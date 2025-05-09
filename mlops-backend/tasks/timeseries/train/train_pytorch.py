import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader
from tasks.timeseries.utils.metrics import mean_absolute_error, symmetric_mean_absolute_percentage_error
from tasks.timeseries.utils.callbacks import TorchEpochLogger


def train_torch_model(
    model,
    X_train,
    y_train,
    X_val,
    y_val,
    batch_size=64,
    epochs=20,
    learning_rate=0.001,
    device=None,
    logger=None
):
    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model.to(device)
    model.train()

    train_dataset = TensorDataset(torch.Tensor(X_train), torch.Tensor(y_train))
    val_dataset = TensorDataset(torch.Tensor(X_val), torch.Tensor(y_val))

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size)

    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)

    history = {"loss": [], "val_loss": [], "mae": [], "smape": []}
    epoch_logger = TorchEpochLogger(logger, total_epochs=epochs) if logger else None

    for epoch in range(epochs):
        model.train()
        train_losses = []

        for xb, yb in train_loader:
            xb, yb = xb.to(device), yb.to(device)

            optimizer.zero_grad()
            pred = model(xb)
            loss = criterion(pred, yb)
            loss.backward()
            optimizer.step()

            train_losses.append(loss.item())

        model.eval()
        val_losses = []
        total_mae = 0.0
        total_smape = 0.0
        n_val = 0

        with torch.no_grad():
            for xb, yb in val_loader:
                xb, yb = xb.to(device), yb.to(device)
                pred = model(xb)
                loss = criterion(pred, yb)
                val_losses.append(loss.item())

                total_mae += mean_absolute_error(yb, pred) * len(yb)
                total_smape += symmetric_mean_absolute_percentage_error(yb, pred) * len(yb)
                n_val += len(yb)

        avg_train_loss = sum(train_losses) / len(train_losses)
        avg_val_loss = sum(val_losses) / len(val_losses)
        avg_mae = total_mae / n_val
        avg_smape = total_smape / n_val

        history["loss"].append(avg_train_loss)
        history["val_loss"].append(avg_val_loss)
        history["mae"].append(avg_mae)
        history["smape"].append(avg_smape)

        if epoch_logger:
            epoch_logger.log(epoch, avg_train_loss, avg_val_loss, {
                "mae": avg_mae,
                "smape": avg_smape
            })
        else:
            print(f"[Epoch {epoch+1}/{epochs}] Train Loss: {avg_train_loss:.4f} | "
                  f"Val Loss: {avg_val_loss:.4f} | MAE: {avg_mae:.4f} | SMAPE: {avg_smape:.2f}")

    return history


def predict_torch_model(model, X, batch_size=64, device=None):
    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model.to(device)
    model.eval()

    data = torch.Tensor(X)
    loader = DataLoader(TensorDataset(data), batch_size=batch_size)

    predictions = []

    with torch.no_grad():
        for (xb,) in loader:
            xb = xb.to(device)
            pred = model(xb)
            predictions.append(pred.cpu())

    return torch.cat(predictions, dim=0).numpy()
