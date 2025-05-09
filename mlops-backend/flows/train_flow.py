import os

import json
from typing import Dict, Any
import pickle
import numpy as np
from datetime import datetime

from prefect import flow, get_run_logger, context
from prefect.artifacts import create_link_artifact
import docker
import mlflow

from flows.utils import (log_mlflow_info, build_and_log_mlflow_url, create_logs_file, 
                         get_next_version, get_docker_container_metrics)
from tasks.timeseries.train.train_model import train_timeseries_model
from tasks.timeseries.utils.model_io import save_timeseries_model

from tasks.timeseries.utils.model_loader import build_model_by_type
from tasks.timeseries.train.hpo_optuna import optimize


CENTRAL_STORAGE_PATH = os.getenv("CENTRAL_STORAGE_PATH", "/home/ariya/central_storage")
MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "http://mlflow:5050")

# ✅ Path configuration for dataset storage in DVC
DVC_DATA_STORAGE = os.getenv("DVC_DATA_STORAGE", "/home/ariya/central_storage/datasets/")
mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)



@flow(name='train_flow')
def train_flow(cfg: Dict[str, Any], data_type: str, ds_name: str):
    flow_run_id = context.get_run_context().flow_run.id
    log_file_path = create_logs_file(flow_run_id,flow_type="train_flow")
    

    logger = get_run_logger()
    logger.info("Starting training flow...")
    logger.info(f"Log file saved to: {log_file_path}")
    
    
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
    
    # Config hyperparameters for AI models
    hparams = cfg['train'][data_type]['hparams']
    transformer_hparams = cfg['train'][data_type]['transformer_hparams']
        
    if data_type == 'timeseries':
        model_cfg = cfg['model']['timeseries']
        input_shape = (model_cfg['sequences'], model_cfg['input_num'])
    
    model_type = model_cfg['model_type']
    

   
    if data_type == 'timeseries':
        
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
        
        train_data = len(y_train)
        val_data = len(y_val)
        test_data = len(y_test)
        total_data = train_data+val_data+test_data

        train_ratio = round(train_data / total_data*100,1)
        val_ratio = round(val_data / total_data*100,1)
        test_ratio = round(test_data / total_data*100,1)
        
        # 🔹 Optuna optimization (select best model and/or hyperparameters)
        if model_type == "AutoML":
            n_trials=10
            best_params = optimize(input_shape, X_train, X_val, y_train, y_val, n_trials=n_trials)  # Full Optuna optimization
            model_type = best_params["model_type"]  # Extract optimized model type
        else:
            if model_type == "Transformer":
                best_params = {
                    **transformer_hparams,
                    "learning_rate": hparams.get("learning_rate", 0.001),
                    "batch_size": hparams.get("batch_size", 128)
                }
            else:
                # best_params = optimize(input_shape, X_train, X_val, y_train, y_val, model_type)  # Optimize only hyperparameters fpr selected model
                best_params=hparams  #Training with input parameter, not need optimizing

        
        # 🔹 Build model with best/selected parameters
        if model_type == "Transformer":
            transformer_params = {
                "d_model": best_params["d_model"],
                "nhead": best_params["nhead"],
                "num_layers": best_params["num_layers"],
                "dim_feedforward": best_params["dim_feedforward"],
                "dropout": best_params["dropout"],
                "output_size": best_params.get("output_size", 1),  # fallback
            }
            optimized_model = build_model_by_type(
                model_type=model_type,
                input_shape=input_shape,
                **transformer_params
            )
            framework="Pytorch"
        else:
            # Các model khác (LSTM, GRU, BiLSTM, Conv1D_BiLSTM)
            optimized_model = build_model_by_type(
                model_type=model_type,
                input_shape=input_shape,
                lstm_units=best_params["lstm_units"],
                conv_filters=best_params["conv_filters"],
                kernel_size=best_params["kernel_size"],
                dropout_rate=best_params["dropout_rate"],
                learning_rate=best_params["learning_rate"]  # Sửa key này nếu dùng learning_rate nhỏ
            )
            framework="Tensorflow"
            
    else:
        raise ValueError(f"Unsupported data_type: {data_type}")
    
    # Create MLflow Run Name with automatic versioning
    model_name = model_cfg['model_name']
    run_version = get_next_version(model_name, model_type, mlflow_train_cfg)
    run_name = f"{model_name}_model_{run_version}_{model_type}"
    
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
            "framework": framework,
            "status": "training",
            "dataset": ds_cfg.get('ds_name', "Stock_product_01"),
            "data_type": data_type,
            "epochs": str(hparams.get("epochs", 10)),
            "learning_rate": str(best_params.get("learning_rate", 0.001)),
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
            "sequences": ds_cfg.get('sequences', 'N/A'),
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

        if data_type == 'timeseries':
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
            "framework": framework,
            "status": "training",
            "dataset": ds_cfg.get('ds_name', "Stock_product_01"),
            "data_type": data_type,
            "epochs": str(hparams.get("epochs", 10)),
            "learning_rate": str(best_params.get("learning_rate", 0.001)),
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
        
        

        if data_type == 'timeseries':
            model_dir, metadata_file_path, model_version = save_timeseries_model(trained_model, model_cfg, best_params, framework, final_train_loss, smape, model_train_info)
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
            
            
    create_link_artifact(key='mlflow-train-run', link=mlflow_run_url, description="Link to MLflow's training run")
    

    return model_name, model_type, model_version, metadata_file_path

def start(cfg):
    data_cfg=cfg['dataset']
    data_type=cfg['data_type']
    train_flow(
        cfg,
        data_type=data_type,
        ds_name=data_cfg[data_type]["ds_name"]
        )