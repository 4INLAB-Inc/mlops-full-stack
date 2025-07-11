from tensorflow.keras.callbacks import Callback

class EpochLogger(Callback):
    def __init__(self, logger, total_epochs=1):
        self.logger = logger
        self.total_epochs = total_epochs

    def _fmt(self, val):
        return f"{val:.4f}" if val is not None else "N/A"

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
            f"Epoch {epoch + 1}/{self.total_epochs}:: "
            f"loss = {self._fmt(loss)}, val_loss = {self._fmt(val_loss)}, "
            f"mae = {self._fmt(mae)}, val_mae = {self._fmt(val_mae)}, "
            f"smape = {self._fmt(smape)}, val_smape = {self._fmt(val_smape)}"
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