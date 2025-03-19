import os
import yaml
import mlflow
import pandas as pd
import pickle
import numpy as np
from tasks.ai_models.image_model import evaluate_model, load_saved_model
from tasks.ai_models.timeseries_models import evaluate_timeseries_model, load_timeseries_model
from tasks.dataset import (
    prepare_dataset,
    load_time_series_data,
    prepare_time_series_data,
    split_time_series_data
)
from flows.utils import log_mlflow_info, build_and_log_mlflow_url
from prefect import flow, get_run_logger
from prefect.artifacts import create_link_artifact
from typing import Dict, Any
from mlflow.tracking import MlflowClient
import re
from datetime import timedelta, datetime

CENTRAL_STORAGE_PATH = os.getenv("CENTRAL_STORAGE_PATH", "/home/ariya/central_storage")
MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "http://mlflow:5050")
mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
DVC_DATA_STORAGE = os.getenv("DVC_DATA_STORAGE", "/home/ariya/central_storage/datasets/")
MODEL_STORAGE_PATH = os.getenv("MODEL_STORAGE_PATH", "/home/ariya/central_storage/models/")

# @flow(name="eval_flow")
# def eval_flow(cfg: Dict[str, Any], dvc_ds_root: str, model_dir: str, model_metadata_file_path: str, run_name: str, model_type: str):
#     logger = get_run_logger()
#     data_type = cfg['evaluate']['data_type']  # Retrieve the data type
#     eval_cfg = cfg['evaluate'][data_type]  # Choose configuration based on data type
#     mlflow_eval_cfg = eval_cfg['mlflow']

#     logger.info('Preparing model for evaluation...')
#     logger.info(f"Model dir: {model_dir}")
    
#     ds_versions_dir = os.path.join(dvc_ds_root, "versions")
#     ds_version_folders=[f for f in os.listdir(ds_versions_dir) if os.path.isdir(os.path.join(ds_versions_dir, f))]
#     ds_version_folders.sort(reverse=True)
#     latest_version_folder = ds_version_folders[0] if ds_version_folders else None
#     latest_ds_version_path = os.path.join(ds_versions_dir, latest_version_folder) if latest_version_folder else None

#     # Load the model based on the data type
#     if data_type == 'image':
#         trained_model = load_saved_model(model_dir)
#         model_cfg = None  # Metadata not required for image models
#     elif data_type == 'timeseries':
#         trained_model = load_timeseries_model(model_dir)
#     else:
#         raise ValueError(f"Unsupported data type: {data_type}")

#     # Ensure that model_cfg is loaded for time-series
#     with open(model_metadata_file_path, 'r') as f:
#         model_cfg = yaml.safe_load(f)

#     mlflow.set_experiment(mlflow_eval_cfg['exp_name'])
#     if mlflow.active_run():
#         logger.warning("An active MLflow run detected. Ending the current run.")
#         mlflow.end_run()

#     with mlflow.start_run(run_name=run_name, description=mlflow_eval_cfg['exp_desc']) as eval_run:
#         log_mlflow_info(logger, eval_run)

#         if data_type == 'image':
#             # Configuration specific to image models
#             input_shape = (model_cfg['input_size']['h'], model_cfg['input_size']['w'])
#             ds_repo_path, annotation_df = prepare_dataset(
#                 ds_root=cfg['dataset']['ds_root'], 
#                 ds_name=cfg['dataset']['ds_name'], 
#                 dvc_tag=cfg['dataset']['dvc_tag'], 
#                 dvc_checkout=cfg['dataset']['dvc_checkout']
#             )
#             evaluate_model(trained_model, model_cfg['classes'], ds_repo_path, annotation_df,
#                            subset=eval_cfg['subset'], img_size=input_shape, classifier_type=model_cfg['classifier_type'])

#         elif data_type == 'timeseries':
#             X_test = np.load(os.path.join(latest_ds_version_path, "X_test.npy"))
#             y_test = np.load(os.path.join(latest_ds_version_path, "y_test.npy"))
            
#             # Load scaler if needed
#             scaler_path = os.path.join(latest_ds_version_path, "scaler.pkl")
#             with open(scaler_path, 'rb') as f:
#                 scaler = pickle.load(f)

#             # # Save dataset info log as artifact
#             # dataset_info_path = os.path.join(model_dir, "dataset_info.json")
#             # mlflow.log_artifact(dataset_info_path, artifact_path="datasets")

#             # Call evaluate_timeseries_model inside the active MLflow run
#             mse, mae, mape = evaluate_timeseries_model(
#                 model=trained_model, 
#                 X_test=X_test, 
#                 y_test=y_test, 
#                 scaler=scaler
#             )
#             logger.info(f"Evaluation metrics - MSE: {mse}, MAE: {mae}")

#             # Log evaluation metrics to MLflow
#             mlflow.log_metric("mse", mse)
#             mlflow.log_metric("mae", mae)
#             mlflow.log_metric("mape", mape)
        
#         eval_run_url = build_and_log_mlflow_url(logger, eval_run)
#         # mlflow.set_tags(tags=mlflow_eval_cfg['exp_tags'])
#         # Gắn thẻ metadata vào MLflow
#         tags_exp = {
#             "model_type": model_type,
#             "framework": "TensorFlow",
#             "status": "deployed",
#             "accuracy": round(100*(1-mape),1),
#             "dataset": model_cfg.get("dataset_name", "Stock_product_01"),
#             "final_loss": mse,
#             "createdAt": datetime.now().strftime('%Y-%m-%d'),
#             "updatedAt": datetime.now().strftime('%Y-%m-%d'),
#         }
        
#         mlflow.set_tags(tags=tags_exp)
#         mlflow.log_artifact(model_metadata_file_path)

#     create_link_artifact(
#         key='mlflow-evaluate-run',
#         link=eval_run_url,
#         description="Link to MLflow's evaluation run"
#     )


# def eval_flow(cfg: Dict[str, Any], dvc_ds_root: str, model_dir: str, model_metadata_file_path: str, run_name: str, model_type: str):
# def start(cfg):
#     eval_cfg = cfg['evaluate']
#     eval_flow(
#         cfg=cfg,
#         dvc_ds_root=cfg['dataset']['dvc_data_dir'],
#         model_dir=eval_cfg['timeseries']['model_dir'],
#         model_metadata_file_path=eval_cfg['timeseries']['model_metadata_file_path'],
#         run_name=eval_cfg['run_name'],
#         model_type=eval_cfg['timeseries']['model_type'],
#     )


DVC_DATA_STORAGE = os.getenv("DVC_DATA_STORAGE", "/home/ariya/central_storage/datasets/")
MODEL_STORAGE_PATH = os.getenv("MODEL_STORAGE_PATH", "/home/ariya/central_storage/models/")

@flow(name="evaluation_flow")
def eval_flow(cfg: Dict[str, Any], data_type: str, dataset_name:str, model_name:str, model_type:str, model_version: int):
    client = MlflowClient()
    logger = get_run_logger()
    registered_models = client.search_registered_models()
    model_found = any(model.name == model_type for model in registered_models)
    # model_version=int(model_version)
    if not model_found:
        raise ValueError(f"🚨 Model '{model_type}' not found in registered models!")

    model_versions = client.search_model_versions(f"name = '{model_type}'")
    if model_version is None:
        # If model_version is not provided, get the latest version
        if not model_versions:
            raise ValueError(f"🚨 No versions found for model '{model_type}'!")
        select_model_version = max(model_versions, key=lambda v: int(v.version))
    else:
        # If model_version is provided, find the specific model version
        select_model_version = next(
            (v for v in model_versions if int(v.version) == model_version), None
        )

    if select_model_version is None:
        raise ValueError(f"🚨 Model version {model_version} not found for model '{model_type}'!")
    
    
    run_id = select_model_version.run_id

    run_info = client.get_run(run_id)
    run_name = run_info.info.run_name
    

    model_source = os.path.join(MODEL_STORAGE_PATH, data_type, run_name)
    if not os.path.exists(model_source):
        raise FileNotFoundError(f"🚨 Model not found at {model_source}")

    print(f"✅ Latest model source path: {model_source}")


    # Load model metadata from artifacts
    metadata_file_name=f"{model_name}.yaml"
    model_metadata_file_path = os.path.join(model_source, metadata_file_name)
    if not os.path.exists(model_metadata_file_path):
        raise FileNotFoundError(f"🚨 Metadata file not found at {model_metadata_file_path}")

    # with open(model_metadata_file_path, "r") as f:
    #     model_cfg = yaml.safe_load(f)


    # Load model
    if data_type == "image":
        trained_model = load_saved_model(model_source)
    elif data_type == "timeseries":
        trained_model = load_timeseries_model(model_source)
    else:
        raise ValueError(f"Unsupported data type: {data_type}")
    
    # 📌 Tìm folder dataset trong DVC_DATA_STORAGE
    dataset_path = os.path.join(DVC_DATA_STORAGE, dataset_name)
    versions_path = os.path.join(dataset_path, "versions")

    if not os.path.exists(versions_path):
        raise FileNotFoundError(f"🚨 Dataset versions folder not found: {versions_path}")

    # 📌 Lấy danh sách phiên bản và chọn version lớn nhất
    version_folders = [f for f in os.listdir(versions_path) if os.path.isdir(os.path.join(versions_path, f))]
    
    if not version_folders:
        raise FileNotFoundError("🚨 No dataset versions found in DVC storage!")

    # Sắp xếp các phiên bản theo giá trị số (ví dụ: 1.0.1, 1.0.2, ..., 1.0.11)
    version_folders.sort(key=lambda v: [int(x) for x in v.split('.')], reverse=True)
    
    latest_version_folder = version_folders[0]
    latest_ds_version_path = os.path.join(versions_path, latest_version_folder)

    logger.info(f"✅ Using dataset version: {latest_version_folder} at {latest_ds_version_path}")

    # 📌 Load test dataset
    if data_type == "timeseries":
        X_test = np.load(os.path.join(latest_ds_version_path, "X_test.npy"))
        y_test = np.load(os.path.join(latest_ds_version_path, "y_test.npy"))

        # Load scaler if needed
        scaler_path = os.path.join(latest_ds_version_path, "scaler.pkl")
        with open(scaler_path, "rb") as f:
            scaler = pickle.load(f)

    # 📌 Bắt đầu Evaluation với MLflow
    mlflow_exp_name=cfg["evaluate"]["timeseries"]["mlflow"]["exp_name"]
    mlflow.set_experiment(mlflow_exp_name)
    if mlflow.active_run():
        logger.warning("An active MLflow run detected. Ending the current run.")
        mlflow.end_run()

    with mlflow.start_run(run_name=mlflow_exp_name, description="Evaluation for latest model version") as eval_run:
        log_mlflow_info(logger, eval_run)

        if data_type == "timeseries":
            mse, mae, mape = evaluate_timeseries_model(
                model=trained_model, 
                X_test=X_test, 
                y_test=y_test, 
                scaler=scaler
            )
            logger.info(f"📊 Evaluation metrics - MSE: {mse}, MAE: {mae}")

            # Log evaluation metrics to MLflow
            mlflow.log_metric("mse", mse)
            mlflow.log_metric("mae", mae)
            mlflow.log_metric("mape", mape)

        eval_run_url = build_and_log_mlflow_url(logger, eval_run)

        # Gắn metadata lên MLflow
        mlflow.set_tags({
            "model_type": model_type,
            "train_run_name": run_name,
            "framework": "TensorFlow",
            "status": "deployed",
            "accuracy": round(100 * (1 - mape), 1),
            "dataset": dataset_name,
            "final_loss": mse,
            "createdAt": datetime.now().strftime("%Y-%m-%d"),
            "updatedAt": datetime.now().strftime("%Y-%m-%d"),
        })

        mlflow.log_artifact(model_metadata_file_path)

    create_link_artifact(
        key="mlflow-evaluate-run",
        link=eval_run_url,
        description="Link to MLflow's evaluation run"
    )

    logger.info(f"🎯 Evaluation completed! Check MLflow logs: {eval_run_url}")
    return model_name, model_type, model_version


def start(cfg):
    eval_cfg = cfg['evaluate']
    eval_flow(
        cfg=cfg,
        data_type=cfg['data_type'],
        dataset_name=cfg['dataset']['ds_name'],
        model_name=eval_cfg['model_name'],
        model_type=eval_cfg['timeseries']['model_type'],
    )

    