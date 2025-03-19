import os
import shutil
import mlflow
import requests
import subprocess
from pathlib import Path
import numpy as np
import pandas as pd
import tensorflow as tf
from typing import List, Dict, Union, Tuple, Any
from prefect import task, flow, get_run_logger, variables
from tensorflow.keras.models import Model
from tensorflow.keras.layers import InputLayer, Conv2D, Flatten, Dense, LSTM, GRU, Bidirectional, Dropout, Conv1D, MaxPooling1D
from .utils.tf_data_utils import build_data_pipeline

PREFECT_PORT = os.getenv('PREFECT_PORT', '4200')
PREFECT_API_URL = os.getenv('PREFECT_API_URL', f'http://prefect:{PREFECT_PORT}/api')
CENTRAL_STORAGE_PATH = os.getenv('CENTRAL_STORAGE_PATH', '/home/ariya/central_storage')

### TASKS ###

@task(name='create_or_update_prefect_vars')
def create_or_update_prefect_vars(kv_vars: Dict[str, Any]):
    """Create or update Prefect variables"""
    logger = get_run_logger()
    for var_name, var_value in kv_vars.items():
        headers = {'Content-type': 'application/json'}
        body = {"name": var_name, "value": var_value}
        current_value = variables.get(var_name)

        if current_value is None:
            logger.info(f"Creating a new variable: {var_name}={var_value}")
            url = f'{PREFECT_API_URL}/variables'
            res = requests.post(url, json=body, headers=headers)
        else:
            logger.info(f"Updating variable '{var_name}' to '{var_value}'")
            url = f'{PREFECT_API_URL}/variables/name/{var_name}'
            res = requests.patch(url, json=body, headers=headers)

        if not str(res.status_code).startswith('2'):
            logger.error(f'Failed to modify Prefect variable, returned {res.status_code}')
        logger.info(f'Status code: {res.status_code}')


@task(name='validate_model_metadata')
def validate_model_metadata(model_metadata_file_name: str, run_name: str):
    """Check if the model metadata file exists before deployment, try backup if missing"""
    logger = get_run_logger()

    model_dir = os.path.join(CENTRAL_STORAGE_PATH, 'models', 'timeseries', run_name)
    metadata_file = os.path.join(model_dir, model_metadata_file_name)
    backup_metadata_file = f"{model_metadata_file_name}.backup"
    backup_metadata_file_path = f"{metadata_file}.backup"

    if Path(metadata_file).exists():
        logger.info(f"✅ Metadata file found: {metadata_file}")
        return model_metadata_file_name
    elif Path(backup_metadata_file_path).exists():
        logger.warning(f"⚠️ Metadata file missing, restoring from backup: {backup_metadata_file}")
        
        # Restore backup by renaming it to the original file name
        restored_metadata_file_path = backup_metadata_file_path.replace(".backup", "")
        restored_metadata_file = backup_metadata_file.replace(".backup", "")
        shutil.move(backup_metadata_file_path, restored_metadata_file_path)
        logger.info(f"🔄 Backup restored: {restored_metadata_file_path}")
        return restored_metadata_file
    else:
        logger.error(f"🚨 Both metadata file and backup are missing! Deployment aborted.")
        raise FileNotFoundError(f"❌ Metadata file {metadata_file} and its backup are missing!")



@task(name='check_service_health')
def check_service_health(service_host: str='nginx', service_port: str='90'):
    """Check if the service is running"""
    logger = get_run_logger()
    endpoint = f"http://{service_host}:{service_port}/health_check"
    try:
        res = requests.get(endpoint)
        if res.status_code == 200:
            logger.info(f"✅ Service is healthy. Response: {res.text}")
            return True
        else:
            raise Exception(f"Service health check failed with status code {res.status_code}")
    except requests.RequestException as e:
        raise Exception(f"Could not reach service at {endpoint}. Error: {str(e)}")


@task(name='backup_existing_model')
def backup_existing_model(model_metadata_file_name: str, run_name: str):
    """Backup the current model before deployment"""
    model_dir = os.path.join(CENTRAL_STORAGE_PATH, 'models', 'timeseries', run_name)
    metadata_file = os.path.join(model_dir, model_metadata_file_name)
    backup_path = f"{metadata_file}.backup"

    shutil.copy(metadata_file, backup_path)
    return backup_path


@task(name='rollback_model')
def rollback_model(backup_metadata_file: str):
    """Rollback to the previous model in case of deployment failure"""
    shutil.move(backup_metadata_file, backup_metadata_file.replace(".backup", ""))
    return "Rollback successful"


@task(name='put_model_to_service')
def put_model_to_service(model_metadata_file_name: str, run_name: str, service_host: str = 'nginx', service_port: str = '90'):
    """Deploy the model to the service"""
    logger = get_run_logger()
    endpoint = f'http://{service_host}:{service_port}/update_model/{run_name}/{model_metadata_file_name}'
    res = requests.put(endpoint)
    
    if res.status_code == 200:
        logger.info("PUT model to service successfully")
    else:
        logger.error(f"PUT model failed. Status code: {res.status_code}, Response: {res.text}")
        raise Exception(f"Failed to put model to {endpoint}")


@task(name='log_model_details')
def log_model_details(model_metadata_file_name: str, run_name: str):
    """Log details about the model"""
    model_dir = os.path.join(CENTRAL_STORAGE_PATH, 'models', 'timeseries', run_name)
    metadata_file = os.path.join(model_dir, model_metadata_file_name)

    if not Path(metadata_file).exists():
        raise FileNotFoundError(f"Metadata file {metadata_file} not found!")

    model_size = os.path.getsize(metadata_file) / (1024 * 1024)  # Convert to MB
    logger = get_run_logger()
    logger.info(f"Model metadata: {metadata_file}, Size: {model_size:.2f} MB")




























### IMAGE AND TIME SERIES INTEGRATION ###
@task(name='build_ref_data')
def build_ref_data(uae_model: tf.keras.models.Model, 
                   bbsd_model: tf.keras.models.Model, 
                   data: np.ndarray,
                   n_sample: int, 
                   data_type: str = 'timeseries',
                   time_steps: int = 30):
    """
    Build reference data for drift detection based on the provided data type.
    """
    logger = get_run_logger()
    logger.info(f"Building reference data for {data_type}...")
    logger.info(f"Input data shape: {data.shape}, time_steps: {time_steps}")

    if data_type == 'timeseries':
        if n_sample > data.shape[0]:
            logger.warning(f"Requested {n_sample} samples, but only {data.shape[0]} available. Adjusting to use all available data.")
            n_sample = data.shape[0]

        try:
            sampled_indices = np.random.choice(data.shape[0], n_sample, replace=False)
            X = data[sampled_indices, :time_steps]  # Đảm bảo lấy đúng `time_steps` bước
            y_true_bin = data[sampled_indices, -1]  # Cột cuối cùng là nhãn
        except Exception as e:
            logger.error(f"Error sampling data points: {str(e)}")
            raise ValueError("Failed to sample data points.") from e

        # Kiểm tra và điều chỉnh kích thước đầu vào
        if len(X.shape) == 2:
            X = np.expand_dims(X, axis=-1)

        if X.shape[1:] != (time_steps, 1):
            logger.error(f"Input data shape {X.shape[1:]} does not match expected shape ({time_steps}, 1).")
            raise ValueError(f"Input data shape {X.shape[1:]} does not match expected shape ({time_steps}, 1).")

        try:
            uae_feats = uae_model.predict(X, batch_size=32, verbose=0)
            bbsd_feats = bbsd_model.predict(X, batch_size=32, verbose=0)
        except Exception as e:
            logger.error(f"Error during feature extraction with UAE or BBSD model: {str(e)}")
            raise RuntimeError("Feature extraction failed.") from e
    else:
        logger.error(f"Unsupported data_type: {data_type}. Only 'timeseries' is supported.")
        raise ValueError(f"Unsupported data_type: {data_type}. Only 'timeseries' is supported.")

    try:
        data_dict = {
            'uae_feats': list(uae_feats),
            'bbsd_feats': list(bbsd_feats),
            'label': list(y_true_bin)
        }
        ref_data_df = pd.DataFrame(data_dict)
    except Exception as e:
        logger.error(f"Error creating DataFrame from features and labels: {str(e)}")
        raise ValueError("Failed to create reference data DataFrame.") from e

    logger.info("Reference data built successfully.")
    return ref_data_df




@task(name='save_and_upload_ref_data')
def save_and_upload_ref_data(ref_data_df: pd.DataFrame, remote_dir: str, model_cfg: Dict[str, Union[str, List[str], List[int]]]):
    logger = get_run_logger()
    save_file_name = model_cfg['model_name'] + model_cfg['drift_detection']['reference_data_suffix'] + '.parquet'
    save_file_path = os.path.join(model_cfg['save_dir'], save_file_name)

    if not os.path.exists(model_cfg['save_dir']):
        os.makedirs(model_cfg['save_dir'], exist_ok=True)

    try:
        ref_data_df.to_parquet(save_file_path)
        logger.info(f"Saved reference data to {save_file_path}")
        mlflow.log_artifact(save_file_path)

        if not os.path.exists(remote_dir):
            os.makedirs(remote_dir, exist_ok=True)

        shutil.copy2(save_file_path, remote_dir)
        logger.info(f"Uploaded reference data to {os.path.join(remote_dir, save_file_name)}")
    except Exception as e:
        logger.error(f"Failed to save or upload reference data: {e}")
        raise


@task(name='build_drift_detectors')
def build_drift_detectors(main_model: tf.keras.models.Model, model_input_size: Tuple[int, int], softmax_layer_idx: int = -1,
                          encoding_dims: int = 32, data_type: str = 'image'):
    logger = get_run_logger()

    if not isinstance(model_input_size, tuple):
        raise ValueError("model_input_size must be a tuple (e.g., (time_steps, features) or (height, width)).")
    if not isinstance(encoding_dims, int) or encoding_dims <= 0:
        raise ValueError("encoding_dims must be a positive integer.")

    if data_type == 'image':
        logger.info("Building UAE and BBSD for images...")
        uae = tf.keras.Sequential([
            InputLayer(input_shape=model_input_size + (3,)),
            Conv2D(64, 4, strides=2, padding='same', activation=tf.nn.relu),
            Conv2D(128, 4, strides=2, padding='same', activation=tf.nn.relu),
            Conv2D(512, 4, strides=2, padding='same', activation=tf.nn.relu),
            Flatten(),
            Dense(encoding_dims)
        ])
        bbsd = Model(inputs=main_model.inputs, outputs=[main_model.layers[softmax_layer_idx].output])

    elif data_type == 'timeseries':
        logger.info("Building UAE and BBSD for time series...")
        uae = tf.keras.Sequential([
            InputLayer(input_shape=model_input_size),
            LSTM(64, return_sequences=True),
            LSTM(32),
            Dense(encoding_dims)
        ])
        bbsd = Model(inputs=main_model.inputs, outputs=[main_model.layers[softmax_layer_idx].output])

    else:
        raise ValueError(f"Unsupported data_type: {data_type}. Choose 'image' or 'timeseries'.")

    logger.info(f"UAE and BBSD built successfully for {data_type} data.")
    logger.info(f"UAE model summary:\n{uae.summary()}")
    logger.info(f"BBSD model summary:\n{bbsd.summary()}")
    return uae, bbsd



@task(name='save_and_upload_drift_detectors')
def save_and_upload_drift_detectors(uae_model: tf.keras.models.Model, 
                                    bbsd_model: tf.keras.models.Model, 
                                    remote_dir: str,
                                    model_cfg: Dict[str, Union[str, List[str], List[int]]]):
    """
    Save and upload drift detection models (UAE and BBSD) to the same folder as the main model.

    Args:
        uae_model: UAE model used for drift detection.
        bbsd_model: BBSD model used for drift detection.
        remote_dir: Remote directory to upload models.
        model_cfg: Model configuration dictionary containing model details.
    """
    logger = get_run_logger()


    save_dir = os.path.join(model_cfg['save_dir'])

    # Define model directories for UAE and BBSD
    uae_model_dir = os.path.join(save_dir, model_cfg['model_name'] + model_cfg['drift_detection']['uae_model_suffix'])
    bbsd_model_dir = os.path.join(save_dir, model_cfg['model_name'] + model_cfg['drift_detection']['bbsd_model_suffix'])

    # Save models locally
    os.makedirs(save_dir, exist_ok=True)
    uae_model.save(uae_model_dir)
    logger.info(f"Saved UAE model to {uae_model_dir}")
    bbsd_model.save(bbsd_model_dir)
    logger.info(f"Saved BBSD model to {bbsd_model_dir}")

    # Log models as artifacts in MLflow
    mlflow.log_artifact(uae_model_dir)
    mlflow.log_artifact(bbsd_model_dir)

    # Upload models to the remote directory
    remote_uae_dir = os.path.join(remote_dir, os.path.basename(uae_model_dir))
    remote_bbsd_dir = os.path.join(remote_dir, os.path.basename(bbsd_model_dir))

    shutil.copytree(uae_model_dir, remote_uae_dir, dirs_exist_ok=True)
    shutil.copytree(bbsd_model_dir, remote_bbsd_dir, dirs_exist_ok=True)
    logger.info(f"Uploaded UAE model to {remote_uae_dir}")
    logger.info(f"Uploaded BBSD model to {remote_bbsd_dir}")



### FLOW ###
@flow(name="deploy_pipeline")
def deploy_pipeline(annotation_df: pd.DataFrame, main_model: tf.keras.models.Model,
                    model_cfg: Dict[str, Union[str, List[str], List[int]]], remote_dir: str,
                    deploy_name: str, data_type: str = 'image'):
    logger = get_run_logger()

    uae_model, bbsd_model = build_drift_detectors.run(main_model, model_input_size=model_cfg['input_size'],
                                                      softmax_layer_idx=model_cfg['drift_detection']['bbsd_layer_idx'],
                                                      encoding_dims=model_cfg['drift_detection']['uae_encoding_dims'],
                                                      data_type=data_type)

    ref_data_df = build_ref_data.run(uae_model, bbsd_model, annotation_df,
                                     n_sample=model_cfg['drift_detection']['reference_data_n_sample'],
                                     classes=model_cfg['classes'], img_size=model_cfg['input_size'],
                                     batch_size=model_cfg['train']['batch_size'], data_type=data_type)

    save_and_upload_ref_data.run(ref_data_df, remote_dir, model_cfg)
    save_and_upload_drift_detectors.run(uae_model, bbsd_model, remote_dir, model_cfg)
    deploy_prefect_flow.run(git_repo_root=model_cfg['git_repo_root'], deploy_name=deploy_name)

    logger.info("Deployment pipeline completed successfully.")
