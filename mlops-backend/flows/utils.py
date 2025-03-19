import os
MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "http://mlflow:5050")
LOCAL_MACHINE_HOST = os.getenv("LOCAL_MACHINE_HOST", "192.168.219.52")
def log_mlflow_info(logger, run):
    logger.info(f'== MLflow Run info ==')
    logger.info(f'experiment_id: {run.info.experiment_id}')
    logger.info(f'run_name: {run.info.run_name}')
    logger.info(f'run_id: {run.info.run_id}')
    logger.info('=====================')

def build_and_log_mlflow_url(logger, run):
    mlflow_run_url = f"{MLFLOW_TRACKING_URI.replace('mlflow',LOCAL_MACHINE_HOST)}/#/experiments/" + \
                     f"{run.info.experiment_id}/runs/{run.info.run_id}"
    logger.info(f'MLflow url: {mlflow_run_url}')
    return mlflow_run_url