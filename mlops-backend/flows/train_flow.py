import os
import mlflow
import pandas as pd
import json
import pickle
import numpy as np
from datetime import datetime
from tasks.utils.tf_data_utils import AUGMENTER
from flows.utils import log_mlflow_info, build_and_log_mlflow_url, create_logs_file
from prefect import flow, get_run_logger, context
from prefect.artifacts import create_link_artifact
import docker


from tasks.ai_models.image_model import build_model, save_model, train_model, upload_model
from tasks.deploy import (build_ref_data, save_and_upload_ref_data,
                          build_drift_detectors, save_and_upload_drift_detectors)

from tasks.ai_models.timeseries_models import (
    build_timeseries_model,
    load_timeseries_model,
    train_timeseries_model,
    save_timeseries_model,
    upload_timeseries_model,
    optimize
)

from tasks.utils.tf_data_utils import AUGMENTER
from tasks.dataset import (
    load_time_series_data,
    prepare_time_series_data,
    split_time_series_data,
    validate_data,
    prepare_dataset
)
from prefect import flow, get_run_logger
from prefect.artifacts import create_link_artifact
from typing import Dict, Any

CENTRAL_STORAGE_PATH = os.getenv("CENTRAL_STORAGE_PATH", "/home/ariya/central_storage")
MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "http://mlflow:5050")

# ✅ Path configuration for dataset storage in DVC
DVC_DATA_STORAGE = os.getenv("DVC_DATA_STORAGE", "/home/ariya/central_storage/datasets/")
mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)

def get_next_version(model_name: str, model_type: str, mlflow_train_cfg: dict) -> str:
    """
    Check existing runs in MLflow and automatically increment the version if the version already exists.
    """
    from mlflow.tracking import MlflowClient
    import re
    
    client = MlflowClient()
    experiment_name = mlflow_train_cfg['exp_name']
    experiment = client.get_experiment_by_name(experiment_name)
    
    if experiment is None:
        mlflow.create_experiment(experiment_name)
        experiment = client.get_experiment_by_name(experiment_name)
    
    runs = client.search_runs(experiment_ids=[experiment.experiment_id])
    versions = []
    
    for run in runs:
        if "mlflow.runName" in run.data.tags:
            run_name = run.data.tags["mlflow.runName"]
            pattern = rf"{model_name}_{model_type}_ver(\d+)"
            match = re.match(pattern, run_name)
            if match:
                versions.append(int(match.group(1)))
    
    if versions:
        next_version = max(versions) + 1
        return f"ver{next_version:03d}"  # Ensure the format is always verXXX
    else:
        return "ver001"

def get_docker_container_metrics(container_name_or_id: str):
    """
    Lấy các thông số từ Docker container như CPU, Memory, GPU, Latency, Throughput và Uptime.
    """
    # Kết nối Docker client
    client = docker.DockerClient(base_url='tcp://host.docker.internal:2375')
    
    # Lấy thông tin container
    container = client.containers.get(container_name_or_id)

    # Lấy thông số CPU và Memory
    stats = container.stats(stream=False)
    
    # Lấy tổng CPU usage và system CPU usage
    cpu_usage = stats['cpu_stats']['cpu_usage']['total_usage']
    system_cpu_usage = stats['cpu_stats']['system_cpu_usage']
    cpu_count = len(stats['cpu_stats']['cpu_usage']['percpu_usage'])  # Đếm số lượng CPU
    
    # Tính toán tỷ lệ phần trăm sử dụng CPU
    if system_cpu_usage > 0:
        cpu_percent = round((cpu_usage / system_cpu_usage) * 100 * cpu_count,3)  # CPU usage per core
    else:
        cpu_percent = 0

    # Lấy memory usage và total memory
    memory_usage = stats['memory_stats']['usage']
    memory_limit = stats['memory_stats']['limit']
    
    # Tính toán tỷ lệ phần trăm sử dụng bộ nhớ
    memory_percent = round((memory_usage / memory_limit) * 100,3) if memory_limit > 0 else 0
    
    # Lấy thông số GPU (nếu container có GPU)
    gpu_usage = "N/A"  # Không có GPU trong container này
    if "nvidia" in container.name.lower():
        try:
            gpu_usage = container.exec_run("nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader").output.decode("utf-8")
        except Exception as e:
            gpu_usage = str(e)

    # Lấy thông số Uptime
    uptime = container.attrs['State']['StartedAt']
    
    # Latency và Throughput sẽ phải được đo thông qua ứng dụng trong container
    # Đây chỉ là các giá trị mẫu, bạn có thể thay thế bằng cách đo thực tế từ ứng dụng của bạn
    latency = "45ms"
    throughput = "120 requests/sec"
    
    return {
        "cpu_usage": cpu_percent,
        "memory_usage": memory_percent,
        "gpu_usage": gpu_usage,
        "latency": latency,
        "throughput": throughput,
        "uptime": uptime
    }

# Example usage
metrics = get_docker_container_metrics(container_name_or_id="jupyter")
print(metrics)

@flow(name='train_flow')
def train_flow(cfg: Dict[str, Any], data_type: str, ds_name: str):
    flow_run_id = context.get_run_context().flow_run.id
    log_file_path = create_logs_file(flow_run_id,flow_type="train_flow")
    
    
    
    
    
    logger = get_run_logger()
    logger.info("Starting training flow...")
    logger.info(f"Log file saved to: {log_file_path}")
    
    central_models_dir = os.path.join(CENTRAL_STORAGE_PATH, 'models')
    central_ref_data_dir = os.path.join(CENTRAL_STORAGE_PATH, 'ref_data')
    
    
    # get dataset version newest in dvc_ds_root
    ds_versions_dir = os.path.join(DVC_DATA_STORAGE, ds_name, "versions")
    ds_version_folders=[f for f in os.listdir(ds_versions_dir) if os.path.isdir(os.path.join(ds_versions_dir, f))]
    ds_version_folders.sort(reverse=True)
    latest_version_folder = ds_version_folders[0] if ds_version_folders else None
    latest_ds_version_path = os.path.join(ds_versions_dir, latest_version_folder) if latest_version_folder else None
    
    print(f"Lastest version of {ds_name} is {latest_version_folder}!")


        
    # Config variables
    ds_cfg = cfg['dataset']
    data_type = cfg['data_type'] 
    mlflow_train_cfg = cfg['train'][data_type]['mlflow']
    hparams = cfg['train'][data_type]['hparams']
    
    if data_type == 'image':
        model_cfg = cfg['model']['image']
        drift_cfg = model_cfg['drift_detection']
        
    elif data_type == 'timeseries':
        model_cfg = cfg['model']['timeseries']
    
    model_type = model_cfg['model_type']
    
    
    # Get input size from config
    if data_type == 'image':
        input_shape = (model_cfg['input_size']['h'], model_cfg['input_size']['w'])
    elif data_type == 'timeseries':
        input_shape = (model_cfg['time_step'], 1)  # time_step and number of features
    else:
        raise ValueError(f"Unsupported data_type: {cfg['data_type']}")
    

    # Prepare dataset based on data_type
    if data_type == 'image':
        model = build_model(input_size=input_shape, n_classes=len(model_cfg['classes']),  
                            classifier_activation=model_cfg['classifier_activation'],
                            classification_layer=model_cfg['classification_layer'])
        ds_repo_path, annotation_df = prepare_dataset(ds_root=ds_cfg['ds_root'], 
                                                    ds_name=ds_cfg['ds_name'], 
                                                    dvc_tag=ds_cfg['dvc_tag'], 
                                                    dvc_checkout=ds_cfg['dvc_checkout'])
        report_path = f"files/{ds_cfg['ds_name']}_{ds_cfg['dvc_tag']}_validation.html"
        validate_data(ds_repo_path, img_ext='jpeg', save_path=report_path)
    elif data_type == 'timeseries':
        # data = load_time_series_csv(file_path=ds_cfg['file_path'], 
        #                             date_col=ds_cfg['date_col'], 
        #                             target_col=ds_cfg['target_col'])
        # X, y, scaler = prepare_time_series_data(data=data, time_step=ds_cfg['time_step'], target_col=ds_cfg['target_col'])
        # X_train, X_val, X_test, y_train, y_val, y_test = split_time_series_data(X=X, y=y)
        X_train = np.load(os.path.join(latest_ds_version_path , "X_train.npy"))
        X_val = np.load(os.path.join(latest_ds_version_path , "X_val.npy"))
        X_test = np.load(os.path.join(latest_ds_version_path , "X_test.npy"))
        
        y_train = np.load(os.path.join(latest_ds_version_path , "y_train.npy"))
        y_val = np.load(os.path.join(latest_ds_version_path , "y_val.npy"))
        y_test = np.load(os.path.join(latest_ds_version_path , "y_test.npy"))
        
        # Load scaler if needed
        scaler_path = os.path.join(latest_ds_version_path , "scaler.pkl")
        with open(scaler_path, 'rb') as f:
            scaler = pickle.load(f)
            
        # Calculate number of data and data split ratio
        
        train_data = len(X_train)
        val_data = len(X_val)
        test_data = len(X_test)
        total_data = train_data+val_data+test_data

        train_ratio = round(train_data / total_data*100,1)
        val_ratio = round(val_data / total_data*100,1)
        test_ratio = round(test_data / total_data*100,1)
        
        # 🔹 Optuna optimization (select best model and/or hyperparameters)
        if model_type == "AutoML":
            best_params = optimize(input_shape, X_train, X_val, y_train, y_val)  # Full Optuna optimization
            model_type = best_params["model_type"]  # Extract optimized model type
        else:
            # best_params = optimize(input_shape, X_train, X_val, y_train, y_val, model_type)  # Optimize only hyperparameters fpr selected model
            best_params=hparams  #Training with input parameter, not need optimizing

        
        # 🔹 Build model with optimized parameters
        optimized_model = build_timeseries_model(
            input_shape=input_shape,
            model_type=model_type,  # Ensure the correct model type is used
            lstm_units=best_params["lstm_units"],
            conv_filters=best_params["conv_filters"],
            kernel_size=best_params["kernel_size"],
            dropout_rate=best_params["dropout_rate"],
            learningRate=best_params["learningRate"]
        )
            
    else:
        raise ValueError(f"Unsupported data_type: {data_type}")
    
    # Create MLflow Run Name with automatic versioning
    model_name = model_cfg['model_name']
    run_version = get_next_version(model_name, model_type, mlflow_train_cfg)
    run_name = f"{model_name}_{model_type}_{run_version}"
    
    if data_type == 'timeseries':
            model_cfg['save_dir'] = os.path.join(CENTRAL_STORAGE_PATH, 'models', data_type, run_name)
            os.makedirs(model_cfg['save_dir'], exist_ok=True)  # Ensure directory exists
    else:
            model_cfg['save_dir'] = os.path.join(CENTRAL_STORAGE_PATH, 'models')
            os.makedirs(model_cfg['save_dir'], exist_ok=True)  # Ensure directory exists
                
        # Start MLflow run
    mlflow.set_experiment(mlflow_train_cfg['exp_name'])
    with mlflow.start_run(run_name=run_name, description=mlflow_train_cfg['exp_desc']) as train_run:
        log_mlflow_info(logger, train_run)
        mlflow_run_url = build_and_log_mlflow_url(logger, train_run)

    
        
        mlflow.log_params(best_params)
        mlflow.log_params({"epochs": hparams['epochs']})
        
        # Gắn thẻ metadata vào MLflow
        tags_exp_initial = {
            "model_type": model_type,
            "log_file": log_file_path,
            "framework": "TensorFlow",
            "status": "training",
            "dataset": ds_cfg.get('ds_name', "Stock_product_01"),
            "data_type": data_type,
            "epochs": str(hparams.get("epochs", 10)),
            "learning_rate": str(best_params.get("learningRate", 0.001)),
            "createdAt": datetime.now().strftime('%Y-%m-%d'),
            "updatedAt": datetime.now().strftime('%Y-%m-%d'),
        }
        for k, v in tags_exp_initial.items():
            mlflow.set_tag(k, v)

        
        # Log dataset information as an artifact
        dataset_info = {
            "dataset_name": ds_cfg['ds_name'],
            "dataset_version": ds_cfg.get('dvc_tag', 'v1.0.0'),
            "data_type": data_type,
            "dataset_path": ds_cfg['file_path'],
            "date_column": ds_cfg.get('date_col', 'N/A'),
            "target_column": ds_cfg.get('target_col', 'N/A'),
            "time_steps": ds_cfg.get('time_step', 'N/A'),
            "num_samples": total_data if data_type == 'timeseries' else len(annotation_df),
            "train_split": len(X_train) if data_type == 'timeseries' else "N/A",
            "val_split": len(X_val) if data_type == 'timeseries' else "N/A",
            "test_split": len(X_test) if data_type == 'timeseries' else "N/A",
            "train_ratio": train_ratio if data_type == 'timeseries' else "N/A",
            "val_ratio": val_ratio if data_type == 'timeseries' else "N/A",
            "test_ratio": test_ratio if data_type == 'timeseries' else "N/A",
        }
        dataset_info_path = os.path.join(model_cfg['save_dir'], "dataset_info.json")
        with open(dataset_info_path, "w") as f:
            json.dump(dataset_info, f, indent=4)
        mlflow.log_artifact(dataset_info_path, artifact_path="datasets")

        if data_type == 'image':
            trained_model = train_model(
                model=model,
                classes=model_cfg['classes'],
                ds_repo_path=ds_repo_path,
                annotation_df=annotation_df,
                img_size=input_shape,
                epochs=hparams['epochs'],
                batch_size=hparams['batch_size'],
                init_lr=hparams['init_lr'],
                augmenter=AUGMENTER
            )
        elif data_type == 'timeseries':
            # Train model
            trained_model, final_train_loss, smape, training_time = train_timeseries_model(
                model=optimized_model,
                X_train=X_train,
                y_train=y_train,
                X_val=X_val,
                y_val=y_val,
                X_test=X_test,
                y_test=y_test,
                scaler=scaler,
                best_params=best_params,
                epochs=hparams['epochs'],
            )
            
        else:
            raise ValueError(f"Unsupported data_type: {data_type}")
        
        
        
        tags_exp_update = {
            "model_type": model_type,
            "log_file": log_file_path,
            "framework": "TensorFlow",
            "status": "training",
            "dataset": ds_cfg.get('ds_name', "Stock_product_01"),
            "data_type": data_type,
            "epochs": str(hparams.get("epochs", 10)),
            "learning_rate": str(best_params.get("learningRate", 0.001)),
            "createdAt": datetime.now().strftime('%Y-%m-%d'),
            "updatedAt": datetime.now().strftime('%Y-%m-%d'),
            "accuracy": round(100-smape,1),
            "training_time": training_time,
            "final_loss": final_train_loss,
            "status": "deployed",
        }
        for k, v in tags_exp_update.items():
            mlflow.set_tag(k, v)    
            
        
        docker_metrics = get_docker_container_metrics(container_name_or_id="jupyter")
        
        model_train_info = {
        "training_time": training_time,
        "log_file": log_file_path,
        "dataset_name": ds_cfg.get('ds_name', "Stock_product_01"),
        "data_type": data_type,
        "dataset_size": f"{total_data} row",
        "dataset_split": f"Train {train_ratio}%, Validate {val_ratio}%, Test {test_ratio}%",
        "dataset_format": 'csv file',
        "task": model_name,
        "model_type": model_type,
        "train_epochs": hparams['epochs'],
        "isDeployed": True,
        "health": "healthy",  # Placeholder; You can replace with actual health check logic
        "cpu": "fulfilled" if docker_metrics["cpu_usage"] < 80 else "warning",
        "memory": "fulfilled" if docker_metrics["memory_usage"] < 80 else "warning",
        "gpu": docker_metrics["gpu_usage"],
        "latency": docker_metrics["latency"],
        "throughput": docker_metrics["throughput"],
        "uptime": docker_metrics["uptime"]
        }
        
        
        
        if data_type == 'image':
            model_dir, metadata_file_path = save_model(trained_model, model_cfg)
            model_save_dir, metadata_file_name = upload_model(model_dir=model_dir, 
                                                            metadata_file_path=metadata_file_path,
                                                            remote_dir=central_models_dir)
        elif data_type == 'timeseries':
            model_dir, metadata_file_path, model_version = save_timeseries_model(trained_model, model_cfg, final_train_loss, smape, model_train_info)
            # model_save_dir, metadata_file_name = upload_timeseries_model(
            #     model_dir=model_dir,
            #     metadata_file_path=metadata_file_path,
            #     remote_dir=central_models_dir
            # )
            model_save_dir=model_dir
            # metadata_file_name=metadata_file_path#Due to not use Cloud DB to save model
            metadata_file_name = os.path.basename(metadata_file_path)
            
            # Log model to MLflow artifacts
            # mlflow.log_artifact(model_dir, artifact_path="trained_model")
            
            

        # uae, bbsd = build_drift_detectors(trained_model, model_input_size=input_shape,
        #                                   softmax_layer_idx=drift_cfg['bbsd_layer_idx'],
        #                                   encoding_dims=drift_cfg['uae_encoding_dims'],
        #                                   data_type=data_type)
        # save_and_upload_drift_detectors(uae, bbsd, remote_dir=central_models_dir, model_cfg=model_cfg)

        # if data_type == "image":
        #     ref_data_df = build_ref_data(
        #         uae_model=uae,
        #         bbsd_model=bbsd,
        #         data=annotation_df,
        #         n_sample=drift_cfg['reference_data_n_sample'],
        #         classes=model_cfg['classes'],
        #         img_size=(model_cfg['input_size']['h'], model_cfg['input_size']['w']),
        #         batch_size=hparams['batch_size'],
        #         data_type="image"
        #     )
        # elif data_type == "timeseries":
        #     ref_data_df = build_ref_data(
        #         uae_model=uae,
        #         bbsd_model=bbsd,
        #         data=X_train,
        #         n_sample=min(drift_cfg['reference_data_n_sample'], X_train.shape[0]),
        #         data_type="timeseries"
        #     )

        # save_and_upload_ref_data(ref_data_df, central_ref_data_dir, model_cfg)

    create_link_artifact(key='mlflow-train-run', link=mlflow_run_url, description="Link to MLflow's training run")
    

    return model_name, model_type, model_version

def start(cfg):
    data_cfg=cfg['dataset']
    data_type=cfg['data_type']
    train_flow(
        cfg,
        data_type=data_type,
        ds_name=data_cfg[data_type]["ds_name"]
        )