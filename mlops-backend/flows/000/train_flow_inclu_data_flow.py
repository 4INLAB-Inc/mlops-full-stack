import os
import mlflow
import pandas as pd
import json

from tasks.utils.tf_data_utils import AUGMENTER
from flows.utils import log_mlflow_info, build_and_log_mlflow_url
from prefect import flow, get_run_logger
from prefect.artifacts import create_link_artifact

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
    load_time_series_csv,
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

@flow(name='train_flow')
def train_flow(cfg: Dict[str, Any]):
    logger = get_run_logger()
    # main save directories
    central_models_dir = os.path.join(CENTRAL_STORAGE_PATH, 'models')
    central_ref_data_dir = os.path.join(CENTRAL_STORAGE_PATH, 'ref_data')
    
    # Config variables
    if cfg['data_type'] == 'image':
        model_cfg = cfg['model']['image']
        drift_cfg = model_cfg['drift_detection']
        
    elif cfg['data_type'] == 'timeseries':
        model_cfg = cfg['model']['timeseries']
    
    
    model_type = model_cfg['model_type']
    mlflow_train_cfg = cfg['train']['mlflow']
    hparams = cfg['train']['hparams']
    ds_cfg = cfg['dataset']
    data_type = cfg['data_type'] 
    
    # Get input size from config
    if cfg['data_type'] == 'image':
        input_shape = (model_cfg['input_size']['h'], model_cfg['input_size']['w'])
    elif cfg['data_type'] == 'timeseries':
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
        data = load_time_series_csv(file_path=ds_cfg['file_path'], 
                                    date_col=ds_cfg['date_col'], 
                                    target_col=ds_cfg['target_col'])
        X, y, scaler = prepare_time_series_data(data=data, time_step=ds_cfg['time_step'], target_col=ds_cfg['target_col'])
        X_train, X_val, X_test, y_train, y_val, y_test = split_time_series_data(X=X, y=y)
        
        # Calculate number of data and data split ratio
        total_data = len(X)
        train_data = len(X_train)
        val_data = len(X_val)
        test_data = len(X_test)

        train_ratio = train_data / total_data
        val_ratio = val_data / total_data
        test_ratio = test_data / total_data
        
        # 🔹 Optuna optimization (select best model and/or hyperparameters)
        if model_type == "auto":
            best_params = optimize(input_shape, X_train, X_val, y_train, y_val)  # Full Optuna optimization
            model_type = best_params["model_type"]  # Extract optimized model type
        else:
            best_params = optimize(input_shape, X_train, X_val, y_train, y_val, model_type)  # Optimize only hyperparameters


        
        # 🔹 Build model with optimized parameters
        optimized_model = build_timeseries_model(
            input_shape=input_shape,
            model_type=model_type,  # Ensure the correct model type is used
            lstm_units=best_params["lstm_units"],
            conv_filters=best_params["conv_filters"],
            kernel_size=best_params["kernel_size"],
            dropout_rate=best_params["dropout_rate"]
        )
            
    else:
        raise ValueError(f"Unsupported data_type: {data_type}")
    
    # Create MLflow Run Name with automatic versioning
    model_name = model_cfg['model_name']
    model_type = best_params["model_type"]
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
        mlflow.set_tags(tags=mlflow_train_cfg['exp_tags'])
        mlflow.log_params(best_params)
        mlflow.log_params({"epochs": hparams['epochs']})
        
        #  # Log dataset information
        # mlflow.log_param("dataset_name", ds_cfg['ds_name'])
        # mlflow.log_param("dataset_version", ds_cfg.get('dvc_tag', 'v1.0.0'))
        # mlflow.log_param("dataset_path", ds_cfg['file_path'])
        # mlflow.log_param("date_column", ds_cfg.get('date_col', 'N/A'))
        # mlflow.log_param("target_column", ds_cfg.get('target_col', 'N/A'))
        # mlflow.log_param("time_steps", ds_cfg.get('time_step', 'N/A'))

        # if data_type == 'timeseries':
        #     # Log number of data and data split ratio
        #     mlflow.log_param("total_data_points", total_data)
        #     mlflow.log_param("train_data_points", train_data)
        #     mlflow.log_param("val_data_points", val_data)
        #     # mlflow.log_param("test_data_points", test_data)

        #     mlflow.log_metric("train_ratio", train_ratio)
        #     mlflow.log_metric("val_ratio", val_ratio)
        #     # mlflow.log_metric("test_ratio", test_ratio)
        
        # Log dataset information as an artifact
        dataset_info = {
            "dataset_name": ds_cfg['ds_name'],
            "dataset_version": ds_cfg.get('dvc_tag', 'v1.0.0'),
            "dataset_path": ds_cfg['file_path'],
            "date_column": ds_cfg.get('date_col', 'N/A'),
            "target_column": ds_cfg.get('target_col', 'N/A'),
            "time_steps": ds_cfg.get('time_step', 'N/A'),
            "num_samples": len(data) if data_type == 'timeseries' else len(annotation_df),
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
            trained_model, history = train_timeseries_model(
                model=optimized_model,
                X_train=X_train,
                y_train=y_train,
                X_val=X_val,
                y_val=y_val,
                best_params=best_params,
                epochs=hparams['epochs'],
            )
        else:
            raise ValueError(f"Unsupported data_type: {data_type}")
        
        
        if data_type == 'image':
            model_dir, metadata_file_path = save_model(trained_model, model_cfg)
            model_save_dir, metadata_file_name = upload_model(model_dir=model_dir, 
                                                            metadata_file_path=metadata_file_path,
                                                            remote_dir=central_models_dir)
        elif data_type == 'timeseries':
            model_dir, metadata_file_path,_ = save_timeseries_model(trained_model, model_cfg)
            # model_save_dir, metadata_file_name = upload_timeseries_model(
            #     model_dir=model_dir,
            #     metadata_file_path=metadata_file_path,
            #     remote_dir=central_models_dir
            # )
            model_save_dir=model_dir
            # metadata_file_name=metadata_file_path#Due to not use Cloud DB to save model
            metadata_file_name = os.path.basename(metadata_file_path)
            
            # Log model to MLflow artifacts
            mlflow.log_artifact(model_dir, artifact_path="trained_model")
            
            

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

    return model_save_dir, metadata_file_path, metadata_file_name, run_name

def start(cfg):
    train_flow(cfg)
