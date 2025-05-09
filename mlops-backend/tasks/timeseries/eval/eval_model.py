# 📁 tasks/timeseries/eval/eval_model.py
from prefect import task, get_run_logger
import mlflow
import matplotlib.pyplot as plt
from sklearn.metrics import mean_squared_error, mean_absolute_error
from tasks.timeseries.utils.metrics import smape
from tasks.timeseries.train.train_pytorch import predict_torch_model
import numpy as np
@task(name="evaluate_timeseries_model")
def evaluate_timeseries_model(
    model,
    X_test,
    y_test,
    scaler,
    framework: str = "tensorflow",
    best_params: dict = None
):

    logger = get_run_logger()
    logger.info("📊 Starting model evaluation...")

    framework = framework.lower().strip()
    batch_size = best_params.get("batch_size", 64) if best_params else 64

    # 🔹 Predict
    if framework == "pytorch":
        # Đảm bảo X_test có shape (batch, seq_len, features)
        if len(X_test.shape) == 2:
            X_test = X_test[:, :, np.newaxis]  # ➝ (batch, seq_len, 1)
        elif len(X_test.shape) == 1:
            X_test = X_test[np.newaxis, :, np.newaxis]  # ➝ (1, seq_len, 1)
        y_pred_scaled = predict_torch_model(model, X_test, batch_size=batch_size)
    elif framework == "tensorflow":
        y_pred_scaled = model.predict(X_test, batch_size=batch_size)
    else:
        raise ValueError(f"Unsupported framework: {framework}")
    
    y_test_scaled = y_test.reshape(-1, 1)
    
    # 🔹 Tính metrics trên dữ liệu đã được scale
    mse_scaled = mean_squared_error(y_test_scaled, y_pred_scaled)
    mae_scaled = mean_absolute_error(y_test_scaled, y_pred_scaled)
    smape_score_scaled = smape(y_test_scaled, y_pred_scaled)

    # 🔹 Inverse transform
    y_pred = scaler.inverse_transform(y_pred_scaled)
    y_true = scaler.inverse_transform(y_test_scaled)

    # 🔹 Tính metrics trên dữ liệu gốc
    mse = mean_squared_error(y_true, y_pred)
    mae = mean_absolute_error(y_true, y_pred)
    smape_score = smape(y_true, y_pred)

    mlflow.log_metric("mse_eval", mse_scaled)
    mlflow.log_metric("mae_eval", mae)
    mlflow.log_metric("smape_eval", smape_score)

    plt.figure(figsize=(10, 5))
    plt.plot(y_true, label="True")
    plt.plot(y_pred, label="Predicted")
    plt.legend()
    plt.title("True vs Predicted")
    plt.savefig("comparison_plot.png")
    mlflow.log_artifact("comparison_plot.png")
    logger.info(f"Evaluation done. SMAPE: {smape_score:.2f}, MAE: {mae:.2f}")

    return mse_scaled, mae_scaled, smape_score


# @task(name="evaluate_timeseries_model")
# def evaluate_timeseries_model(model, X_test, y_test, scaler):
#     """
#     Evaluate the time-series model.

#     Args:
#         model: Trained model.
#         X_test: Test input data.
#         y_test: True labels of the test data.
#         scaler: Scaler to inverse transform predictions and true labels.

#     Returns:
#         mse: Mean Squared Error of predictions.
#         mae: Mean Absolute Error of predictions.
#     """
#     logger = get_run_logger()
#     logger.info("Evaluating the time-series model...")

#     # Ensure there's an active MLflow run
#     if mlflow.active_run() is None:
#         logger.error("No active MLflow run found. Ensure eval_flow starts an MLflow run.")
#         raise RuntimeError("No active MLflow run found.")

#     try:
#         logger.info("Making predictions with the model...")
#         # Predict values using the model
#         y_pred = model.predict(X_test)

#         # Inverse transform predictions and true values
#         logger.info("Inverse transforming predictions and true values...")
#         y_pred = scaler.inverse_transform(y_pred)
#         y_test = scaler.inverse_transform(y_test.reshape(-1, 1))

#         # Calculate performance metrics
#         logger.info("Calculating performance metrics...")
#         mse = mean_squared_error(y_test, y_pred)
#         mae = mean_absolute_error(y_test, y_pred)
#         smape_eval = smape(y_test, y_pred)

#         logger.info(f"Mean Squared Error (MSE): {mse}")
#         logger.info(f"Mean Absolute Error (MAE): {mae}")

#         # Create comparison plot
#         logger.info("Creating comparison plot...")
#         comparison_plot = plt.figure(figsize=(10, 6))
#         plt.plot(y_test, label="True Values", alpha=0.7)
#         plt.plot(y_pred, label="Predicted Values", alpha=0.7)
#         plt.legend()
#         plt.title("True vs Predicted Values")
#         plt.xlabel("Time Steps")
#         plt.ylabel("Values")
#         plt.tight_layout()

#         # Log metrics and plot to MLflow
#         logger.info("Logging metrics and plot to MLflow...")
#         mlflow.log_metric("MSE", mse)
#         mlflow.log_metric("MAE", mae)
#         mlflow.log_figure(comparison_plot, "elvaluation_comparison_plot.png")
#         plt.close(comparison_plot)

#         logger.info("Evaluation process completed successfully.")

#         return mse, mae, smape_eval

#     except Exception as e:
#         logger.error(f"Error during model evaluation: {str(e)}")
#         raise