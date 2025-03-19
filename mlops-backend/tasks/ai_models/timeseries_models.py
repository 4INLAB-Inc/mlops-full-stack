import os, time
import shutil
import hashlib
import yaml
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error,mean_absolute_percentage_error
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, GRU, Bidirectional, Dense, Dropout, Conv1D, MaxPooling1D
from tensorflow.keras.callbacks import EarlyStopping
from keras import backend as K
import gc
import subprocess
import torch
from prefect import task, get_run_logger
import mlflow
import matplotlib.pyplot as plt
import optuna
from datetime import datetime

from typing import Dict, Union, List
from mlflow.tracking import MlflowClient


def clear_gpu_memory():
    # 🛑 1. Free TensorFlow memory
    try:
        K.clear_session()  # Clears the backend session to release occupied GPU memory
        tf.compat.v1.reset_default_graph()  # Resets the computational graph to avoid stale references
    except Exception as e:
        print(f"⚠ Error clearing TensorFlow memory: {e}")

    # 🛑 2. Free PyTorch memory
    try:
        if torch.cuda.is_available():
            torch.cuda.empty_cache()  # Releases unreferenced GPU memory
            torch.cuda.ipc_collect()  # Cleans up unused inter-process memory
    except Exception as e:
        print(f"⚠ Error clearing PyTorch memory: {e}")

    # 🛑 3. Run garbage collection to free system RAM
    try:
        gc.collect()  # Forces Python garbage collection to free up memory
    except Exception as e:
        print(f"⚠ Error freeing system RAM: {e}")

    

def smape(A, F):
    return 100/len(A) * np.sum(2 * np.abs(F - A) / (np.abs(A) + np.abs(F)))
# ==========================
# 1️⃣ MODEL BUILD FUNCTION
# ==========================
@task(name="build_timeseries_model")
def build_timeseries_model(input_shape, model_type="LSTM", lstm_units=128, conv_filters=128, kernel_size=3, dropout_rate=0.2):
    
    logger = get_run_logger()
    logger.info(f"Building {model_type} model with input shape {input_shape}...")

    if model_type == "LSTM":
        model = Sequential([
            LSTM(lstm_units, return_sequences=True, input_shape=input_shape),
            Dropout(dropout_rate),
            LSTM(lstm_units),
            Dropout(dropout_rate),
            Dense(1)
        ])
    elif model_type == "GRU":
        model = Sequential([
            GRU(lstm_units, return_sequences=True, input_shape=input_shape),
            Dropout(dropout_rate),
            GRU(lstm_units // 2),
            Dropout(dropout_rate),
            Dense(1)
        ])
    elif model_type == "BiLSTM":
        model = Sequential([
            Bidirectional(LSTM(lstm_units, return_sequences=True), input_shape=input_shape),
            Dropout(dropout_rate),
            Bidirectional(LSTM(lstm_units // 2)),
            Dropout(dropout_rate),
            Dense(1)
        ])
    elif model_type == "Conv1D-BiLSTM":
        model = Sequential([
            Conv1D(conv_filters, kernel_size=kernel_size, activation="relu", input_shape=input_shape),
            MaxPooling1D(pool_size=2),
            Bidirectional(LSTM(lstm_units, return_sequences=True)),
            Dropout(dropout_rate),
            Bidirectional(LSTM(lstm_units // 2)),
            Dropout(dropout_rate),
            Dense(1)
        ])
    else:
        raise ValueError(f"Unsupported model type: {model_type}")

    model.compile(optimizer="adam", loss="mse", metrics=["mae"])
    logger.info(f"{model_type} model built successfully.")
    return model

# 2️⃣ OPTUNA OPTIMIZATION FUNCTION (Runs only if model_type="AutoML")
# ==========================
def objective(trial, input_shape, X_train, X_val, y_train, y_val, model_type=None):
    """
    Optuna objective function for hyperparameter tuning.
    If model_type is None, it means we are selecting the best model type as well.
    """
    # If model_type is not provided, select it automatically
    if model_type is None or model_type == "AutoML":
        model_type = trial.suggest_categorical("model_type", ["LSTM", "GRU", "BiLSTM", "Conv1D-BiLSTM"])

    # Define hyperparameter space
    lstm_units = trial.suggest_int("lstm_units", 32, 256, step=32)
    conv_filters = trial.suggest_int("conv_filters", 32, 256, step=32)
    kernel_size = trial.suggest_int("kernel_size", 3, 7, step=1)
    dropout_rate = trial.suggest_uniform("dropout_rate", 0.1, 0.5)
    batch_size = trial.suggest_int('batch_size', 32, 128, step=32)

    # Build model with these hyperparameters
    model = build_timeseries_model(input_shape, model_type, lstm_units, conv_filters, kernel_size, dropout_rate)

    # Train model briefly for evaluation
    start_time = time.time()
    history = model.fit(X_train, y_train, epochs=50, batch_size=batch_size, validation_data=(X_val, y_val), verbose=0)
    end_time = time.time()
    
    val_loss = history.history['val_loss'][-1]

    # Logging trial infomation
    print(f"Trial {trial.number} - LSTM Units: {lstm_units}, Dropout: {dropout_rate}, Batch Size: {batch_size}")
    print(f"Validation Loss: {val_loss}, Time: {end_time - start_time:.2f}s")
    
    return val_loss



def optimize(input_shape, X_train, X_val, y_train, y_val, model_type=None):
    """
    Runs Optuna optimization. If model_type is None, it selects both model and hyperparameters.
    If model_type is specified, it only tunes the hyperparameters.
    """
    # If model_type is not provided, select it automatically
    if model_type is None or model_type == "AutoML":
        n_trials=40
    else:
        n_trials=5
    
    study = optuna.create_study(direction="minimize")
    study.optimize(lambda trial: objective(trial, input_shape, X_train, X_val, y_train, y_val, model_type), n_trials=n_trials)   #n_trials is number of trial to get optimize parameters

    print("Best Model Parameters:")
    print(f"  Value: {study.best_value}")
    print(f"  Params: {study.best_params}")

    return study.best_params


@task(name="train_timeseries_model")
def train_timeseries_model(model, X_train, y_train, X_val, y_val, X_test, y_test, scaler, best_params, epochs=10, patience=10):
    """
    Huấn luyện mô hình time series.
    """
    logger = get_run_logger()
    logger.info(f"Starting training with {epochs} epochs ")
    
    
    clear_gpu_memory()

    # early_stopping = EarlyStopping(monitor="val_loss", patience=patience, restore_best_weights=True)
    start_time = time.time()
    batch_size=best_params['batch_size']
    
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=epochs,
        batch_size=batch_size,
        # callbacks=[early_stopping],
        verbose=2
    )
    
    end_time = time.time()
    # Tính tổng thời gian huấn luyện
    total_seconds = end_time - start_time
    hours, remainder = divmod(total_seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    training_time = f"{int(hours)}h {int(minutes)}m {int(seconds)}s"
    
    y_pred = model.predict(X_test)

    # Inverse transform predictions and true values
    logger.info("Inverse transforming predictions and true values...")
    y_pred = scaler.inverse_transform(y_pred)
    y_test = scaler.inverse_transform(y_test.reshape(-1, 1))
    
    mape_eval = smape(y_test, y_pred)

    # Log hyperparameters vào MLflow
    if mlflow.active_run() is None:
        mlflow.start_run()
        
    mlflow.log_params(best_params)
    mlflow.log_params({"epochs": epochs, "batch_size": batch_size, "patience": patience})

    # Log loss và val_loss cho từng epoch
    for epoch, (train_loss, val_loss) in enumerate(zip(history.history["loss"], history.history["val_loss"])):
        mlflow.log_metric("train_loss", train_loss, step=epoch)
        mlflow.log_metric("val_loss", val_loss, step=epoch)
        
        # Dự đoán trên tập training và validation
        y_pred_epoch_1 = model.predict(X_train)
        y_pred_epoch_2 = model.predict(X_val)

        # Đảo ngược scaler và kiểm tra NaN hoặc inf
        y_pred_epoch_1_inverse = np.nan_to_num(scaler.inverse_transform(y_pred_epoch_1), nan=0.0, posinf=0.0, neginf=0.0)
        y_pred_epoch_2_inverse = np.nan_to_num(scaler.inverse_transform(y_pred_epoch_2), nan=0.0, posinf=0.0, neginf=0.0)
        y_train_inverse = np.nan_to_num(scaler.inverse_transform(y_train.reshape(-1, 1)), nan=0.0, posinf=0.0, neginf=0.0)
        y_val_inverse = np.nan_to_num(scaler.inverse_transform(y_val.reshape(-1, 1)), nan=0.0, posinf=0.0, neginf=0.0)
        
        # Đảm bảo rằng kích thước dự đoán và thực tế khớp nhau
        if y_train_inverse.shape != y_pred_epoch_1_inverse.shape:
            raise ValueError("Shape mismatch between train predictions and true values.")
        if y_val_inverse.shape != y_pred_epoch_2_inverse.shape:
            raise ValueError("Shape mismatch between val predictions and true values.")
        
        # Tính MAPE
        train_mape_epoch = smape(y_train_inverse, y_pred_epoch_1_inverse)
        val_mape_epoch = smape(y_val_inverse, y_pred_epoch_2_inverse)
        
        # Log MAPE
        mlflow.log_metric("train_acc", 100-train_mape_epoch, step=epoch)
        mlflow.log_metric("val_acc", 100-val_mape_epoch, step=epoch)


    # Log giá trị loss cuối cùng
    mlflow.log_metrics({
        "final_train_loss": history.history["loss"][-1],
        "final_val_loss": history.history["val_loss"][-1],
    })
    
    final_train_loss=history.history["loss"][-1]

    logger.info("Training completed successfully.")
    return model, final_train_loss, mape_eval, training_time

@task(name="evaluate_timeseries_model")
def evaluate_timeseries_model(model, X_test, y_test, scaler):
    """
    Evaluate the time-series model.

    Args:
        model: Trained model.
        X_test: Test input data.
        y_test: True labels of the test data.
        scaler: Scaler to inverse transform predictions and true labels.

    Returns:
        mse: Mean Squared Error of predictions.
        mae: Mean Absolute Error of predictions.
    """
    logger = get_run_logger()
    logger.info("Evaluating the time-series model...")

    # Ensure there's an active MLflow run
    if mlflow.active_run() is None:
        logger.error("No active MLflow run found. Ensure eval_flow starts an MLflow run.")
        raise RuntimeError("No active MLflow run found.")

    try:
        logger.info("Making predictions with the model...")
        # Predict values using the model
        y_pred = model.predict(X_test)

        # Inverse transform predictions and true values
        logger.info("Inverse transforming predictions and true values...")
        y_pred = scaler.inverse_transform(y_pred)
        y_test = scaler.inverse_transform(y_test.reshape(-1, 1))

        # Calculate performance metrics
        logger.info("Calculating performance metrics...")
        mse = mean_squared_error(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        mape = smape(y_test, y_pred)

        logger.info(f"Mean Squared Error (MSE): {mse}")
        logger.info(f"Mean Absolute Error (MAE): {mae}")

        # Create comparison plot
        logger.info("Creating comparison plot...")
        comparison_plot = plt.figure(figsize=(10, 6))
        plt.plot(y_test, label="True Values", alpha=0.7)
        plt.plot(y_pred, label="Predicted Values", alpha=0.7)
        plt.legend()
        plt.title("True vs Predicted Values")
        plt.xlabel("Time Steps")
        plt.ylabel("Values")
        plt.tight_layout()

        # Log metrics and plot to MLflow
        logger.info("Logging metrics and plot to MLflow...")
        mlflow.log_metric("MSE", mse)
        mlflow.log_metric("MAE", mae)
        mlflow.log_figure(comparison_plot, "elvaluation_comparison_plot.png")
        plt.close(comparison_plot)

        logger.info("Evaluation process completed successfully.")

        return mse, mae, mape

    except Exception as e:
        logger.error(f"Error during model evaluation: {str(e)}")
        raise


# @task(name="save_timeseries_model")
# def save_timeseries_model(model, model_cfg: dict):
#     """
#     Lưu mô hình và metadata vào thư mục chỉ định.
#     """
#     logger = get_run_logger()

#     # Đường dẫn lưu mô hình
#     model_dir = os.path.join(model_cfg['save_dir'])#, model_cfg['model_name'])
#     metadata_path = os.path.join(model_cfg['save_dir'], f"{model_cfg['model_name']}.yaml")

#     # Tạo thư mục nếu chưa tồn tại
#     if not os.path.exists(model_cfg['save_dir']):
#         os.makedirs(model_cfg['save_dir'])

#     # Lưu mô hình
#     model.save(model_dir)
#     logger.info(f"Model saved to {model_dir}")

#     # Lưu metadata
#     metadata = model_cfg.copy()
#     metadata.pop('save_dir', None)
#     with open(metadata_path, 'w') as f:
#         yaml.dump(metadata, f)
#     logger.info(f"Metadata saved to {metadata_path}")

#     # Tính toán hash của mô hình để kiểm tra sự thay đổi
#     model_hash = calculate_model_hash(model_dir)
#     logger.info(f"Model hash: {model_hash}")

#     return model_dir, metadata_path

@task(name="save_timeseries_model")
def save_timeseries_model(model: tf.keras.models.Model, model_cfg: Dict[str, Union[str, List[str], List[int]]], final_train_loss: float, mape:float, model_train_info: Dict[str, Union[str, Dict[str, Union[str, int]]]]):
    logger = get_run_logger()

    # Bắt đầu một MLflow run nếu chưa có
    if mlflow.active_run() is None:
        mlflow.start_run()
        logger.info("Started a new MLflow run.")
    
    run_id = mlflow.active_run().info.run_id
    logger.info(f"Active Run ID: {run_id}")

    # Xác định đường dẫn lưu trữ
    model_dir = os.path.join(model_cfg['save_dir'])#, model_cfg['model_name'])
    metadata_path = os.path.join(model_cfg['save_dir'], model_cfg['model_name'] + '.yaml')

    if not os.path.exists(model_cfg['save_dir']):
        os.makedirs(model_cfg['save_dir'])

    # Lưu mô hình
    model.save(model_dir)
    logger.info(f"Model saved to {model_dir}")

    # Lưu metadata của mô hình
    model_cfg["metadata"]["created_date"]=datetime.now().strftime('%Y-%m-%d')
    metadata = model_cfg.copy()
    metadata.pop('save_dir', None)
    with open(metadata_path, 'w') as f:
        yaml.dump(metadata, f)
    logger.info(f"Metadata saved to {metadata_path}")

    # Log artifacts lên MLflow
    mlflow.log_artifact(model_dir)
    mlflow.log_artifact(metadata_path)

    # Tính toán hash mô hình
    current_model_hash = calculate_model_hash(model_dir)
    if 'model_hash' in model_cfg and model_cfg['model_hash'] == current_model_hash:
        logger.info("Model has not changed. Skipping version registration.")
        return model_dir, metadata_path
    
    # Lưu hash hiện tại vào model_cfg
    model_cfg['model_hash'] = current_model_hash
    model_uri = f"runs:/{run_id}/{model_cfg['model_name']}"
    model_name = model_cfg['model_name']
    model_type = model_train_info["model_type"]
    dataset_name=model_train_info["dataset_name"]
    client = MlflowClient()

    # Kiểm tra nếu phiên bản đã tồn tại
    existing_versions = client.search_model_versions(f"name='{model_type}'")
    for version in existing_versions:
        if version.source == model_uri and version.run_id == run_id:
            logger.info(f"Model version already exists: Version {version.version}")
            return model_dir, metadata_path

    # Đăng ký mô hình
    try:
        if not existing_versions:
            description_model = (f"Using {model_type} for Time-series stock prediction task.")
            registered_model = mlflow.register_model(model_uri=model_uri, name=model_type)
            client.set_registered_model_tag(registered_model.name, "description", description_model)
            logger.info(f"Model registered with name: {registered_model.name}")
    
        model_version = client.create_model_version(
            name=model_type,
            source=model_uri,
            run_id=run_id,
        )
        logger.info(f"Model version {model_version.version} registered successfully!")
    except Exception as e:
        logger.error(f"Error during model registration: {str(e)}")

    # Cập nhật metadata & chuyển trạng thái mô hình
    try:
        description_version = (
            f"Version {model_version.version} of {model_type} model based time-series stock prediction. "
            f"Trained with dataset: {dataset_name}, "
            f"epochs: {model_cfg.get('epochs', 10)}, "
            f"learning rate: {model_cfg.get('learning_rate', 0.001)}."
        )
        client.update_model_version(
            name=model_type,
            version=model_version.version,
            description=description_version
        )
        client.transition_model_version_stage(
            name=model_type,
            version=model_version.version,
            stage="Archived"
        )
        logger.info(f"Model version {model_version.version} transitioned to stage 'Staging'.")

        # Gắn thẻ metadata vào MLflow
        tags = {
            "model_name": model_name,
            "model_type": model_type,
            "framework": model_cfg["framework"],
            "status": "Deployed",
            "accuracy": round(100*(1-mape),1),
            "dataset_name": dataset_name,
            "data_type": model_train_info["data_type"],
            "epochs": model_train_info["train_epochs"],
            "learning_rate": str(model_cfg.get("learningRate", 0.001)),
            "training_time": model_train_info["training_time"],
            "final_loss": final_train_loss,
            "createdAt": datetime.now().strftime('%Y-%m-%d'),
            "updatedAt": datetime.now().strftime('%Y-%m-%d'),
            "deployedAt": datetime.now().strftime('%Y-%m-%d'),
            "dataset_size": model_train_info["dataset_size"],
            "dataset_split": model_train_info["dataset_split"],
            "dataset_format": model_train_info["dataset_format"],
            "isDeployed": model_train_info["isDeployed"],
            "health": model_train_info["health"],
            "cpu": model_train_info["cpu"],
            "memory": model_train_info["memory"],
            "gpu": model_train_info["gpu"],
            "latency": model_train_info["latency"],
            "throughput": model_train_info["throughput"],
            "uptime": model_train_info["uptime"],
            
        }
        
        for key, value in tags.items():
            client.set_model_version_tag(
                name=model_type,
                version=model_version.version,
                key=key,
                value=value
            )
            
        logger.info(f"Updated model version {model_version.version} with tags: {tags}")
    except Exception as e:
        logger.error(f"Error during updating model version metadata: {str(e)}")

    return model_dir, metadata_path, model_version.version


def calculate_model_hash(model_dir):
    
    hasher = hashlib.md5()
    for root, _, files in os.walk(model_dir):
        for file in sorted(files):
            file_path = os.path.join(root, file)
            with open(file_path, 'rb') as f:
                while chunk := f.read(8192):
                    hasher.update(chunk)
    return hasher.hexdigest()


@task(name="upload_timeseries_model")
def upload_timeseries_model(model_dir: str, metadata_file_path: str, remote_dir: str):
    # this is the step you should replace with uploading the file
    # to a cloud storage if you want to deploy on cloud
    logger = get_run_logger()
    model_name = os.path.basename(model_dir)

    # Tạo thư mục từ xa nếu chưa tồn tại
    if not os.path.exists(remote_dir):
        os.makedirs(remote_dir)

    # Copy model
    remote_model_dir = os.path.join(remote_dir, model_name)
    shutil.copytree(model_dir, remote_model_dir, dirs_exist_ok=True)
    logger.info(f"Model uploaded to {remote_model_dir}")

    # Copy metadata
    remote_metadata_path = os.path.join(remote_dir, os.path.basename(metadata_file_path))
    shutil.copy2(metadata_file_path, remote_metadata_path)
    logger.info(f"Metadata uploaded to {remote_metadata_path}")

    return remote_model_dir, remote_metadata_path


@task(name="load_timeseries_model")
def load_timeseries_model(model_path: str):
    
    logger = get_run_logger()
    
    clear_gpu_memory()

    # Tải mô hình
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}")
    model = load_model(model_path)
    logger.info(f"Model loaded from {model_path}")

    # # Đọc metadata
    # if not os.path.exists(metadata_file_path):
    #     raise FileNotFoundError(f"Metadata file not found at {metadata_file_path}")
    # with open(metadata_file_path, 'r') as f:
    #     metadata = yaml.safe_load(f)
    # logger.info(f"Metadata loaded from {metadata_file_path}")

    return model
