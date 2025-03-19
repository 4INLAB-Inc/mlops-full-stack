import psutil
import json
import os
from datetime import datetime
from typing import List, Dict
import subprocess

# Path to store system stats
RESOURCE_INFO_STORAGE_PATH = "/home/ariya/central_storage/resources/"

# Ensure that the directory exists for storing stats
os.makedirs(RESOURCE_INFO_STORAGE_PATH, exist_ok=True)

def save_system_stats(stats: List[Dict], filename="system_stats.json"):
    """
    Saves system statistics to a JSON file.

    Args:
    - stats: The system statistics to save.
    - filename: The name of the file to save the data to (default is "system_stats.json").
    """
    try:
        filepath = os.path.join(RESOURCE_INFO_STORAGE_PATH, filename)

        # If the file exists, load its current contents
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                try:
                    existing_data = json.load(f)  # Try reading the existing JSON data
                except json.JSONDecodeError:
                    existing_data = []  # In case of invalid JSON, start with an empty list
        else:
            existing_data = []  # If file doesn't exist, start with an empty list

        # Append new stats to the existing data
        existing_data.extend(stats)

        # Write the updated data back to the file
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=4)
    
    except Exception as e:
        print(f"Error saving system stats: {e}")

def get_gpu_info() -> Dict:
    """
    Retrieves GPU information from the `nvidia-smi` command within a Docker container (if NVIDIA GPU is available).

    Args:
    - container_name: The name of the running Docker container.

    Returns:
    - Dict: GPU information or error if no GPU is available.
    """
    try:
        # Build the docker exec command to run nvidia-smi inside the container
        # Build the docker exec command to run nvidia-smi inside the container
        command = (
            f"docker exec jupyter bash -c \""
            f"source /opt/anaconda3/bin/activate mlops-4inlab && "
            f"nvidia-smi --query-gpu=index,name,memory.total,memory.used,memory.free,utilization.gpu --format=csv,noheader,nounits"
        )
        command += "\""

        # Run the command and capture the result
        result = subprocess.run(command, shell=True, text=True, capture_output=True, check=True)

        # If there's an error, handle it
        if result.returncode != 0:
            return {"error": f"Failed to run 'nvidia-smi' in container jupyter: {result.stderr.strip()}"}

        # Parse the result into a dictionary
        gpu_info = result.stdout.strip().splitlines()[0].split(', ')

        # Ensure we have exactly the expected number of data points
        if len(gpu_info) != 6:
            return {"error": "Unexpected output from 'nvidia-smi' command."}

        # Return GPU information
        return {
            "gpu_name": gpu_info[1],  # GPU name
            "gpu_memory_total": gpu_info[2] + " MB",  # Total memory in MB
            "gpu_memory_used": gpu_info[3] + " MB",  # Used memory in MB
            "gpu_memory_free": gpu_info[4] + " MB",  # Free memory in MB
            "gpu_utilization": gpu_info[5] + " %",  # GPU utilization in percentage
        }
    except Exception as e:
        # If there is any exception, return the error message
        return {"error": f"Failed to retrieve GPU info: {str(e)}"}

def get_system_stats() -> List[Dict]:
    """
    Retrieves system information such as CPU, memory, storage, and GPU (if available).
    
    Returns:
    - List of dict: A list of dictionaries containing system information.
    """
    stats = []

    # Get the current time
    now = datetime.now()

    # Retrieve system stats
    cpu = psutil.cpu_percent(interval=1)  # CPU usage percentage
    memory = psutil.virtual_memory().percent  # Memory usage percentage
    storage = psutil.disk_usage('/').percent  # Disk usage percentage

    # Get GPU info using the `nvidia-smi` command
    gpu = get_gpu_info()

    # Add the collected stats to the list
    stats.append({
        "time": now.strftime("%H:%M"),  # Current time
        "cpu": cpu,
        "memory": memory,
        "storage": storage,
        "gpu": gpu
    })

    return stats
