# 📁 tasks/timeseries/train/hpo_optuna.py
import optuna
from tasks.timeseries.utils.model_loader import build_model_by_type
from tasks.timeseries.train.train_pytorch import train_torch_model
import numpy as np

from tensorflow.keras.callbacks import Callback

class EpochLogger(Callback):
    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        print(f"Epoch {epoch + 1}/{self.params['epochs']}: " + ", ".join(f"{k}={v:.4f}" for k, v in logs.items()))


def objective(trial, input_shape, X_train, X_val, y_train, y_val, model_type=None):
    # 👇 Common hyperparameters
    batch_size = trial.suggest_int("batch_size", 32, 128, step=32)
    learning_rate = trial.suggest_float("learning_rate", 0.001, 0.01)

    # 👇 Auto model selection nếu chưa có model_type
    if model_type is None or model_type == "AutoML":
        model_type = trial.suggest_categorical("model_type", ["LSTM", "GRU", "BiLSTM", "Conv1D_BiLSTM"])

    
    model_specific_params = {
        "lstm_units": trial.suggest_int("lstm_units", 32, 256, step=32),
        "conv_filters": trial.suggest_int("conv_filters", 32, 256, step=32),
        "kernel_size": trial.suggest_int("kernel_size", 3, 7),
        "num_layers": trial.suggest_int("num_layers", 1, 4),
        "dropout_rate": trial.suggest_float("dropout_rate", 0.1, 0.5),
        "learning_rate": learning_rate  # ✅ ensure learning_rate is passed
    }
    model = build_model_by_type(model_type, input_shape=input_shape, **model_specific_params)

    
    is_keras = hasattr(model, "fit")
    history = None
    if is_keras:
        epoch_logger = EpochLogger()
        history = model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=30,
            batch_size=batch_size,
            callbacks=[epoch_logger],
            verbose=0
        )
        val_loss = history.history['val_loss'][-1]
    else:

        if len(X_train.shape) == 2:
            X_train = X_train[..., np.newaxis]
            X_val = X_val[..., np.newaxis]

        history = train_torch_model(
            model=model,
            X_train=X_train, y_train=y_train,
            X_val=X_val, y_val=y_val,
            batch_size=batch_size,
            epochs=30,
            learning_rate=learning_rate
        )
        val_loss = history["val_loss"][-1]

    return val_loss


def optimize(input_shape, X_train, y_train, X_val, y_val, model_type=None, n_trials=100):
    study = optuna.create_study(direction="minimize")
    study.optimize(
        lambda trial: objective(trial, input_shape, X_train, y_train, X_val, y_val, model_type),
        n_trials=n_trials
    )
    return study.best_params

