
import os
from datetime import datetime
import logging
import pytz

MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "http://mlflow:5050")
LOCAL_MACHINE_HOST = os.getenv("LOCAL_MACHINE_HOST", "192.168.219.52")
PIPELINE_LOG_PATH = os.getenv('PIPELINE_LOG_PATH', '/home/ariya/central_storage/logs/')

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

# Path configuration for log storage (using environment variable or default value)

def create_logs_file(flow_run_id: str, log_path=PIPELINE_LOG_PATH, flow_type="full_flow") -> str:
    """
    Function to create a log file, configure the logger, and log to both file and console.
    Returns the path to the log file.
    """
    # Create the log file name based on flow_run_id
    log_filename = f"{flow_run_id}.log"
    log_folder_path = os.path.join(log_path, flow_type)
    log_file_path = os.path.join(log_folder_path, log_filename)
    
    # Ensure the log directory exists
    os.makedirs(log_folder_path, exist_ok=True)

    # Create custom formatter to use Seoul time
    class SeoulTimeFormatter(logging.Formatter):
        def formatTime(self, record, datefmt=None):
            utc_time = datetime.fromtimestamp(record.created, tz=pytz.utc)
            seoul_time = utc_time.astimezone(pytz.timezone('Asia/Seoul'))
            return seoul_time.strftime('%Y-%m-%d %H:%M:%S')

    # Configure logging
    handler = logging.FileHandler(log_file_path, mode='a')  # Log to file
    console_handler = logging.StreamHandler()  # Log to console
    
    # Set log format using Seoul time
    formatter = SeoulTimeFormatter('[%(asctime)s +0900] [%(process)d] [%(levelname)s] %(message)s')
    handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    # Create logger and add handlers
    logger = logging.getLogger()
    logger.handlers.clear()
    logger.setLevel(logging.INFO)
    logger.addHandler(handler)
    logger.addHandler(console_handler)
    
    # 💡 Suppress noisy loggers
    for noisy in ["httpx", "prefect.client", "anyio", "urllib3", "asyncio"]:
        logging.getLogger(noisy).setLevel(logging.WARNING)

    # Log the start of the pipeline
    # logger.info("Starting MLOps pipeline....")
    
    #This below code for main flow
    # flow_run_id = context.get_run_context().flow_run.id
    # log_file_path = create_logs_file(flow_run_id)
    
    # logger = get_run_logger()
    # logger.info(f"Log file saved to: {log_file_path}")
    
    return log_file_path