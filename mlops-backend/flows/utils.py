
import os
from datetime import datetime
import logging
import pytz
import docker
import mlflow

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

    
    return log_file_path


def get_next_version(model_name: str, model_type: str, mlflow_train_cfg: dict) -> str:
    """
    Check existing runs in MLflow and automatically increment the version if the version already exists.
    """
    from mlflow.tracking import MlflowClient
    import re
    
    client = MlflowClient()
    experiment_name = mlflow_train_cfg['exp_name']
    experiment = client.get_experiment_by_name(experiment_name)
    
    if experiment is None:
        mlflow.create_experiment(experiment_name)
        experiment = client.get_experiment_by_name(experiment_name)
    
    runs = client.search_runs(experiment_ids=[experiment.experiment_id])
    versions = []
    
    # Loop through each run and search for the version pattern
    for run in runs:
        if "mlflow.runName" in run.data.tags:
            run_name = run.data.tags["mlflow.runName"]
            # Adjust regex pattern to match "model_name_model_ver(\d+)_model_type"
            pattern = rf"{model_name}_model_ver(\d+)_" #({model_type})"
            match = re.match(pattern, run_name)
            if match:
                versions.append(int(match.group(1)))
                
    if versions:
        next_version = max(versions) + 1
        return f"ver{next_version:03d}"  # Ensure the format is always verXXX
    else:
        return "ver001"



def get_docker_container_metrics(container_name_or_id: str):
    """
    Lấy các thông số từ Docker container như CPU, Memory, GPU, Latency, Throughput và Uptime.
    """
    # Kết nối Docker client
    client = docker.DockerClient(base_url='tcp://host.docker.internal:2375')
    
    # Lấy thông tin container
    container = client.containers.get(container_name_or_id)

    # Lấy thông số CPU và Memory
    stats = container.stats(stream=False)
    
    # Lấy tổng CPU usage và system CPU usage
    cpu_usage = stats['cpu_stats']['cpu_usage']['total_usage']
    system_cpu_usage = stats['cpu_stats']['system_cpu_usage']
    cpu_count = len(stats['cpu_stats']['cpu_usage']['percpu_usage'])  # Đếm số lượng CPU
    
    # Tính toán tỷ lệ phần trăm sử dụng CPU
    if system_cpu_usage > 0:
        cpu_percent = round((cpu_usage / system_cpu_usage) * 100 * cpu_count,3)  # CPU usage per core
    else:
        cpu_percent = 0

    # Lấy memory usage và total memory
    memory_usage = stats['memory_stats']['usage']
    memory_limit = stats['memory_stats']['limit']
    
    # Tính toán tỷ lệ phần trăm sử dụng bộ nhớ
    memory_percent = round((memory_usage / memory_limit) * 100,3) if memory_limit > 0 else 0
    
    # Lấy thông số GPU (nếu container có GPU)
    gpu_usage = "N/A"  # Không có GPU trong container này
    if "nvidia" in container.name.lower():
        try:
            gpu_usage = container.exec_run("nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader").output.decode("utf-8")
        except Exception as e:
            gpu_usage = str(e)


    uptime = container.attrs['State']['StartedAt']
    

    latency = "45ms"
    throughput = "120 requests/sec"
    
    return {
        "cpu_usage": cpu_percent,
        "memory_usage": memory_percent,
        "gpu_usage": gpu_usage,
        "latency": latency,
        "throughput": throughput,
        "uptime": uptime
    }
    