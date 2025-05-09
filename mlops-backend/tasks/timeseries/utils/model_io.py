# # 📁 tasks/timeseries/utils/model_io.py

import os
import yaml
import shutil
import hashlib
import mlflow
import torch
from datetime import datetime
from typing import Dict, Union, List, Any
from mlflow.tracking import MlflowClient
from prefect import task, get_run_logger

# Optional TensorFlow imports
try:
    import tensorflow as tf
    from tensorflow.keras.models import load_model
    from tasks.timeseries.utils.metrics import smape_keras
    from tensorflow.keras.metrics import MeanAbsoluteError, MeanAbsolutePercentageError
except ImportError:
    tf = None

# ---------- UTILS ----------

def calculate_model_hash(model_dir):
    hasher = hashlib.md5()
    for root, _, files in os.walk(model_dir):
        for file in sorted(files):
            file_path = os.path.join(root, file)
            with open(file_path, 'rb') as f:
                while chunk := f.read(8192):
                    hasher.update(chunk)
    return hasher.hexdigest()


# ---------- SAVE MODEL ----------

@task(name="save_timeseries_model")
def save_timeseries_model(
    model,
    model_cfg: Dict[str, Union[str, List[str], List[int]]],
    best_params,
    framework,
    final_train_loss: float,
    smape_test: float,
    model_train_info: Dict
):
    logger = get_run_logger()

    if mlflow.active_run() is None:
        mlflow.start_run()
        logger.info("📘 Started new MLflow run")

    run_id = mlflow.active_run().info.run_id
    logger.info(f"📎 MLflow Run ID: {run_id}")
    
    if framework==None:
        framework = model_cfg.get("framework", "TensorFlow").strip().lower()
    else:
        framework = framework.strip().lower()
    
    model_name = model_cfg["model_name"]
    model_name_with_suffix = model_cfg["model_name"] + "_model"
    model_dir = os.path.join(model_cfg["save_dir"])
    metadata_path = os.path.join(model_dir, f"{model_name}.yaml")
    os.makedirs(model_dir, exist_ok=True)

    # === Save model ===
    if framework == "pytorch":
        model_path = os.path.join(model_dir, "trained_model.pth")
        torch.save(model.state_dict(), model_path)
        logger.info(f"✅ PyTorch model saved to {model_path}")
        mlflow.log_artifact(model_path)

    elif framework == "tensorflow":
        weights_path = os.path.join(model_dir, "trained_model.h5")
        model.save_weights(weights_path)
        logger.info(f"✅ TensorFlow weights saved to {weights_path}")
        mlflow.log_artifact(weights_path)

    else:
        raise ValueError(f"Unsupported framework: {framework}")

    model_cfg["metadata"]["created_date"] = datetime.now().strftime('%Y-%m-%d')
    metadata = model_cfg.copy()
    metadata.pop("save_dir", None)
    metadata["framework"] = framework
    metadata["hparams"] = best_params
    with open(metadata_path, "w") as f:
        yaml.dump(metadata, f)
    logger.info(f"📝 Metadata saved at {metadata_path}")
    mlflow.log_artifact(metadata_path)

    model_hash = calculate_model_hash(model_dir)
    if model_cfg.get("model_hash") == model_hash:
        logger.info("⚠️ Model unchanged. Skipping registration.")
        return model_dir, metadata_path, None

    model_cfg["model_hash"] = model_hash

    model_uri = f"runs:/{run_id}/{model_name_with_suffix}"
    model_type = model_train_info["model_type"]
    dataset_name = model_train_info["dataset_name"]
    client = MlflowClient()
    model_version = None

    try:
        existing_versions = client.search_model_versions(f'name="{model_name_with_suffix}"')

        for v in existing_versions:
            if v.source == model_uri and v.run_id == run_id:
                logger.info(f"📦 Model version already exists: v{v.version}")
                model_version = v
                break

        if model_version is None:
            if not existing_versions:
                mlflow.register_model(model_uri=model_uri, name=model_name_with_suffix)
                client.set_registered_model_tag(model_name_with_suffix, "description", f"In the lastest experiment, the {model_type} model is applied for {model_name_with_suffix}")

            model_version = client.create_model_version(
                name=model_name_with_suffix,
                source=model_uri,
                run_id=run_id
            )
            logger.info(f"🚀 Registered new model version: {model_version.version}")

        client.update_model_version(
            name=model_name_with_suffix,
            version=model_version.version,
            description=(
                f"Version {model_version.version} of {model_name_with_suffix} based on {model_type} model trained on {dataset_name}. "
                f"Framework: {framework}, SMAPE: {smape_test:.2f}"
            )
        )

        client.transition_model_version_stage(
            name=model_name_with_suffix,
            version=model_version.version,
            stage="Staging"
        )

        tags = {
            "model_name": model_name,
            "framework": framework,
            "accuracy": round(100 - smape_test, 1),
            "final_loss": final_train_loss,
            "training_time": model_train_info["training_time"],
            "createdAt": datetime.now().strftime('%Y-%m-%d'),
            **model_train_info,
        }

        for key, val in tags.items():
            client.set_model_version_tag(
                name=model_name_with_suffix,
                version=model_version.version,
                key=key,
                value=str(val)
            )

        logger.info(f"🏷 Tags and metadata updated for version {model_version.version}")

    except Exception as e:
        logger.error(f"❌ MLflow registration error: {str(e)}")
        return model_dir, metadata_path, None

    return model_dir, metadata_path, model_version.version


@task(name="upload_timeseries_model")
def upload_timeseries_model(model_dir: str, metadata_file_path: str, remote_dir: str):
    logger = get_run_logger()
    os.makedirs(remote_dir, exist_ok=True)

    remote_model_dir = os.path.join(remote_dir, os.path.basename(model_dir))
    shutil.copytree(model_dir, remote_model_dir, dirs_exist_ok=True)
    logger.info(f"Model copied to {remote_model_dir}")

    remote_meta = os.path.join(remote_dir, os.path.basename(metadata_file_path))
    shutil.copy2(metadata_file_path, remote_meta)
    logger.info(f"Metadata copied to {remote_meta}")

    return remote_model_dir, remote_meta


@task(name="load_timeseries_model")
def load_timeseries_model(model_path: str, framework: str, model_instance=None, *args, **kwargs):

    logger = get_run_logger()

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at {model_path}")

    framework = framework.strip().lower()

    if framework == "pytorch":
        if os.path.isdir(model_path):
            model_files = [f for f in os.listdir(model_path) if f.endswith(".pth")]
            if not model_files:
                raise FileNotFoundError(f"No .pth model file found in directory: {model_path}")
            model_path = os.path.join(model_path, model_files[0])
            logger.info(f"📂 Found PyTorch model file: {model_path}")

        if model_instance is None:
            raise ValueError("❌ Must provide a PyTorch model instance to load weights into.")

        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        state_dict = torch.load(model_path, map_location=device)
        model_instance.load_state_dict(state_dict)
        model_instance.eval()
        logger.info(f"✅ Loaded PyTorch model from {model_path}")
        return model_instance

    elif framework == "tensorflow":
        if model_instance is None:
            raise ValueError("❌ Must provide a TensorFlow model instance to load weights into.")

        weights_path = model_path
        if os.path.isdir(model_path):
            files = [f for f in os.listdir(model_path) if f.endswith(".h5")]
            if not files:
                raise FileNotFoundError(f"No .h5 weights file found in {model_path}")
            weights_path = os.path.join(model_path, files[0])
            logger.info(f"📂 Found TensorFlow weights file: {weights_path}")

        model_instance.load_weights(weights_path)
        logger.info(f"✅ Loaded TensorFlow model weights from {weights_path}")
        return model_instance

    else:
        raise ValueError(f"❌ Unsupported framework: {framework}")
