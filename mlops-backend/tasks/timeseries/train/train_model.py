# 📁 tasks/timeseries/train/train_model.py


import os, time
import shutil
import hashlib
import yaml
from datetime import datetime
from typing import Dict, Union, List
import numpy as np

import mlflow
from mlflow.tracking import MlflowClient
from prefect import task, get_run_logger

import tensorflow as tf
from tensorflow.keras.models import  load_model

import tensorflow.keras.backend as K
from tensorflow.keras.metrics import MeanAbsoluteError, MeanAbsolutePercentageError

from tasks.timeseries.utils.system import clear_gpu_memory
from tasks.timeseries.utils.metrics import smape, smape_keras
from tasks.timeseries.train.train_pytorch import train_torch_model, predict_torch_model
from tasks.timeseries.utils.callbacks import EpochLogger



from prefect import task, get_run_logger
import time
import numpy as np
import mlflow

from tasks.timeseries.train.train_pytorch import train_torch_model, predict_torch_model
from tasks.timeseries.utils.metrics import smape  # NumPy-based smape
from tasks.timeseries.utils.callbacks import EpochLogger  # Keras callback


@task(name="train_timeseries_model")
def train_timeseries_model(
    model,
    X_train, y_train,
    X_val, y_val,
    X_test, y_test,
    scaler,
    best_params,
    epochs=10,
    patience=10
):
    logger = get_run_logger()
    logger.info(f"🚀 Starting training with {epochs} epochs")

    # Clear GPU (nếu bạn có hàm clear_gpu_memory)
    clear_gpu_memory()

    # Training setup
    start_time = time.time()
    batch_size = best_params.get("batch_size", 128)
    learning_rate = best_params.get("learning_rate", 0.001)

    is_keras = hasattr(model, "fit")
    history = None

    # 🔹 Training
    if is_keras:
        epoch_logger = EpochLogger(logger, total_epochs=epochs)
        history_obj = model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=batch_size,
            callbacks=[epoch_logger],
            verbose=0
        )
        history = history_obj.history  # Keras trả về History object
    else:
        if len(X_train.shape) == 2:
            X_train = X_train[..., np.newaxis]
            X_val = X_val[..., np.newaxis]
            X_test = X_test[..., np.newaxis]

        history = train_torch_model(
            model,
            X_train, y_train,
            X_val, y_val,
            batch_size,
            epochs,
            learning_rate,
            logger=logger
        )

    # 🔹 Tính thời gian huấn luyện
    end_time = time.time()
    total_seconds = end_time - start_time
    hours, remainder = divmod(total_seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    training_time = f"{int(hours)}h {int(minutes)}m {int(seconds)}s"

    # 🔹 Dự đoán
    if is_keras:
        y_pred = model.predict(X_test)
    else:
        y_pred = predict_torch_model(model, X_test, batch_size=batch_size)

    # 🔹 Inverse scale
    logger.info("📉 Inverse transforming predictions and true values...")
    y_pred = scaler.inverse_transform(y_pred)
    y_test = scaler.inverse_transform(y_test.reshape(-1, 1))

    smape_test = smape(y_test, y_pred)

    # 🔹 Log MLflow
    if mlflow.active_run() is None:
        mlflow.start_run()

    mlflow.log_params(best_params)
    mlflow.log_params({"epochs": epochs, "batch_size": batch_size, "patience": patience})

    for epoch in range(epochs):
        mlflow.log_metric("train_loss", history["loss"][epoch], step=epoch)
        mlflow.log_metric("val_loss", history["val_loss"][epoch], step=epoch)
        
        if "mae" in history:
            mlflow.log_metric("train_mae", history["mae"][epoch], step=epoch)
            mlflow.log_metric("val_mae", history["val_mae"][epoch], step=epoch)
        if "mape" in history:
            mlflow.log_metric("train_mape", history["mape"][epoch], step=epoch)
            mlflow.log_metric("val_mape", history["val_mape"][epoch], step=epoch)

        # SMAPE → Accuracy
        if "smape_keras" in history:
            smape_train = history["smape_keras"][epoch]
            smape_val = history["val_smape_keras"][epoch]
            
            # Log raw smape
            mlflow.log_metric("train_smape", smape_train, step=epoch)
            mlflow.log_metric("val_smape", smape_val, step=epoch)

            # ✅ Tính accuracy từ smape (có thể âm nếu smape > 100)
            mlflow.log_metric("train_acc", 100 - smape_train, step=epoch)
            mlflow.log_metric("val_acc", 100 - smape_val, step=epoch)

        # if "mae" in history:
        #     mlflow.log_metric("val_mae", history["mae"][epoch], step=epoch)
        # if "val_mae" in history:
        #     mlflow.log_metric("val_mae", history["val_mae"][epoch], step=epoch)
        # if "smape" in history:
        #     mlflow.log_metric("val_smape", history["smape"][epoch], step=epoch)
        #     mlflow.log_metric("val_acc", 100 - history["smape"][epoch], step=epoch)
        # if "smape_keras" in history:
        #     mlflow.log_metric("val_smape", history["smape_keras"][epoch], step=epoch)
        #     mlflow.log_metric("val_acc", 100 - history["smape_keras"][epoch], step=epoch)

    mlflow.log_metrics({
        "final_train_loss": history["loss"][-1],
        "final_val_loss": history["val_loss"][-1],
        "final_val_smape": history["val_smape_keras"][-1],    
        "smape_test": smape_test
    })

    final_train_loss = history["loss"][-1]
    final_val_smape = history["val_smape_keras"][-1]

    logger.info("✅ Training completed successfully.")
    return model, final_train_loss, final_val_smape, training_time

