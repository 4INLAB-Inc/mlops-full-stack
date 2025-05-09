from tensorflow.keras.callbacks import Callback

class EpochLogger(Callback):
    def __init__(self, logger, total_epochs=1):
        self.logger = logger
        self.total_epochs = total_epochs

    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        loss = logs.get("loss")
        val_loss = logs.get("val_loss")
        mae = logs.get("mae")
        val_mae = logs.get("val_mae")
        mape = logs.get("mape")
        val_mape = logs.get("val_mape")
        smape = logs.get("smape_keras") or logs.get("smape")
        val_smape = logs.get("val_smape_keras") or logs.get("val_smape")
        self.logger.info(
            f"Epoch {epoch + 1}/{self.total_epochs}:: loss = {loss:.4f}, val_loss = {val_loss:.4f}, mae = {mae:.4f}, val_mae = {val_mae:.4f}, smape = {smape:.4f}, val_smape = {val_smape:.4f}"
        )


class TorchEpochLogger:
    def __init__(self, logger, total_epochs=1):
        self.logger = logger
        self.total_epochs = total_epochs

    def log(self, epoch, train_loss, val_loss=None, metrics=None):
        msg = f"[Epoch {epoch + 1}/{self.total_epochs}] loss = {train_loss:.4f}"
        if val_loss is not None:
            msg += f", val_loss = {val_loss:.4f}"

        if metrics:
            for k, v in metrics.items():
                msg += f", {k} = {v:.4f}"

        self.logger.info(msg)