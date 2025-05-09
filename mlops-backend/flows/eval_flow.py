import os
import yaml
import mlflow
import pandas as pd
import pickle
import numpy as np
from tasks.timeseries.eval.eval_model import evaluate_timeseries_model
from tasks.timeseries.utils.model_io import load_timeseries_model
from tasks.timeseries.utils.model_loader import build_model_by_type

from flows.utils import log_mlflow_info, build_and_log_mlflow_url, create_logs_file
from prefect import flow, get_run_logger, context
from prefect.artifacts import create_link_artifact
from typing import Dict, Any
from mlflow.tracking import MlflowClient
from datetime import datetime
import torch

CENTRAL_STORAGE_PATH = os.getenv("CENTRAL_STORAGE_PATH", "/home/ariya/central_storage")
MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "http://mlflow:5050")
mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
DVC_DATA_STORAGE = os.getenv("DVC_DATA_STORAGE", "/home/ariya/central_storage/datasets/")
MODEL_STORAGE_PATH = os.getenv("MODEL_STORAGE_PATH", "/home/ariya/central_storage/models/")

@flow(name="evaluation_flow")
def eval_flow(cfg: Dict[str, Any], data_type: str, dataset_name: str, model_name: str, model_type: str, model_version: int):
    client = MlflowClient()
    flow_run_id = context.get_run_context().flow_run.id
    log_file_path = create_logs_file(flow_run_id, flow_type="eval_flow")

    logger = get_run_logger()
    logger.info("Starting evaluation flow....")
    logger.info(f"Log file saved to: {log_file_path}")

    registered_models = client.search_registered_models()
    
    model_name_with_suffix = f'{model_name}_model'
    
    model_found = any(model.name == model_name_with_suffix for model in registered_models)
    if not model_found:
        raise ValueError(f"🚨 Model '{model_name_with_suffix}' not found in registered models!")

    model_versions = client.search_model_versions(f"name = '{model_name_with_suffix}'")
    if model_version is None:
        if not model_versions:
            raise ValueError(f"🚨 No versions found for model '{model_name_with_suffix}'!")
        select_model_version = max(model_versions, key=lambda v: int(v.version))
    else:
        select_model_version = next((v for v in model_versions if int(v.version) == model_version), None)

    if select_model_version is None:
        raise ValueError(f"🚨 Model version {model_version} not found for model '{model_type}'!")

    run_id = select_model_version.run_id
    run_info = client.get_run(run_id)
    run_name = run_info.info.run_name
    model_source = os.path.join(MODEL_STORAGE_PATH, data_type, run_name)

    if not os.path.exists(model_source):
        raise FileNotFoundError(f"🚨 Model not found at {model_source}")

    print(f"✅ Latest model source path: {model_source}")

    metadata_file_name = f"{model_name}.yaml"
    model_metadata_file_path = os.path.join(model_source, metadata_file_name)
    if not os.path.exists(model_metadata_file_path):
        raise FileNotFoundError(f"🚨 Metadata file not found at {model_metadata_file_path}")

    with open(model_metadata_file_path, "r") as f:
        model_cfg = yaml.safe_load(f)
        
    if model_type=="Transformer":
        framework = "pytorch"
    else:
        framework = "tensorflow"
    framework = framework.strip().lower()
    
    
    dataset_path = os.path.join(DVC_DATA_STORAGE, dataset_name, "versions")
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"🚨 Dataset versions folder not found: {dataset_path}")

    version_folders = [f for f in os.listdir(dataset_path) if os.path.isdir(os.path.join(dataset_path, f))]
    version_folders = [v for v in version_folders if len(v.split(".")) == 3 and all(part.isdigit() for part in v.split("."))]
    version_folders.sort(key=lambda v: list(map(int, v.split("."))), reverse=True)

    latest_version_folder = version_folders[0]
    latest_ds_version_path = os.path.join(dataset_path, latest_version_folder)
    logger.info(f"✅ Using dataset version: {latest_version_folder} at {latest_ds_version_path}")

    if data_type == "timeseries":
        # Load test data
        X_test = np.load(os.path.join(latest_ds_version_path, "X_test.npy"))
        y_test = np.load(os.path.join(latest_ds_version_path, "y_test.npy"))
        scaler_path = os.path.join(latest_ds_version_path, "scaler.pkl")
        with open(scaler_path, "rb") as f:
            scaler = pickle.load(f)

        hparams = model_cfg.get("hparams", {}).copy()
        for k in ["batch_size", "epochs"]:
            hparams.pop(k, None)

        if framework == "pytorch":
            # ✅ PyTorch input shape: feature dimension only
            if model_cfg.get("input_size"):
                input_size_cfg = model_cfg["input_size"]
                input_size = input_size_cfg["w"] if isinstance(input_size_cfg, dict) else input_size_cfg
            else:
                input_size = X_test.shape[2] if len(X_test.shape) == 3 else 1

            model_instance = build_model_by_type(
                model_type=model_type,
                input_shape=input_size,
                **hparams
            )

        else:  # TensorFlow
            # ✅ TensorFlow expects (sequences, features)
            if model_cfg.get("input_size"):
                input_size_cfg = model_cfg["input_size"]
                if isinstance(input_size_cfg, dict):
                    sequences = input_size_cfg.get("sequences", X_test.shape[1])
                    num_features = input_size_cfg.get("input_num", 1)
                else:
                    sequences = X_test.shape[1]
                    num_features = input_size_cfg
            else:
                if len(X_test.shape) == 3:
                    sequences, num_features = X_test.shape[1], X_test.shape[2]
                elif len(X_test.shape) == 2:
                    sequences = X_test.shape[1]
                    num_features = 1
                    X_test = X_test[..., np.newaxis]
                elif len(X_test.shape) == 1:
                    sequences, num_features = 1, 1
                    X_test = X_test.reshape(-1, 1, 1)
                else:
                    raise ValueError(f"Unsupported shape for X_test: {X_test.shape}")

            input_shape = (sequences, num_features)

            model_instance = build_model_by_type(
                model_type=model_type,
                input_shape=input_shape,
                **hparams
            )

        # ✅ Load weights vào model instance
        trained_model = load_timeseries_model(
            model_path=model_source,
            framework=framework,
            model_instance=model_instance
        )
    else:
        raise ValueError(f"Unsupported data type: {data_type}")

    

    

    mlflow_exp_name = cfg["evaluate"]["timeseries"]["mlflow"]["exp_name"]
    mlflow.set_experiment(mlflow_exp_name)
    if mlflow.active_run():
        logger.warning("An active MLflow run detected. Ending the current run.")
        mlflow.end_run()

    with mlflow.start_run(run_name=run_name, description="Evaluation for latest model version") as eval_run:
        log_mlflow_info(logger, eval_run)

        mse, mae, smape_eval = evaluate_timeseries_model(
            model=trained_model,
            X_test=X_test,
            y_test=y_test,
            scaler=scaler,
            framework=framework
        )

        logger.info(f"📊 Evaluation metrics - MSE: {mse}, MAE: {mae}, SMAPE: {smape_eval:.2f}")

        mlflow.log_metric("mse", mse)
        mlflow.log_metric("mae", mae)
        mlflow.log_metric("smape", smape_eval)

        eval_run_url = build_and_log_mlflow_url(logger, eval_run)

        mlflow.set_tags({
            "model_type": model_type,
            "log_file": log_file_path,
            "train_run_name": run_name,
            "framework": framework,
            "status": "deployed",
            "accuracy": round(100 - smape_eval, 1),
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
    model_cfg = cfg['model']
    data_type = cfg['data_type']
    eval_flow(
        cfg=cfg,
        data_type=data_type,
        dataset_name=cfg['dataset']['ds_name'],
        model_name=model_cfg[data_type]['model_name'],
        model_type=model_cfg[data_type]['model_type'],
        model_version=model_cfg[data_type]['model_version'],
    )