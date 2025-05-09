import psutil
import json
import os
from datetime import datetime
import pytz
import shutil
import asyncio
from typing import List, Dict
import subprocess, random
import logging
import pickle
import sqlite3

logging.basicConfig(
    format='[%(asctime)s] [%(levelname)s] %(message)s',
    level=logging.INFO,
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Path to store system stats
RESOURCE_INFO_STORAGE_PATH =os.getenv('RESOURCE_INFO_STORAGE_PATH', '/home/ariya/central_storage/resources/')

# Ensure that the directory exists for storing stats
os.makedirs(RESOURCE_INFO_STORAGE_PATH, exist_ok=True)

# def save_system_stats(stats: List[Dict], filename="system_stats.pkl"):
#     """
#     Saves system statistics to a Pickle file, with backup mechanism to avoid data loss.
    
#     Args:
#     - stats: The system statistics to save.
#     - filename: The name of the file to save the data to (default is "system_stats.pkl").
#     """
#     try:
#         filepath = os.path.join(RESOURCE_INFO_STORAGE_PATH, filename)
#         backup_filepath = filepath + ".bak"  # Define a backup file path
        
#         # Check if the current file exists
#         if os.path.exists(filepath):
#             with open(filepath, "rb") as f:
#                 existing_data = pickle.load(f)  # Try reading the existing Pickle data
#         else:
#             if os.path.exists(backup_filepath):
#                 # If the backup exists, restore from the backup
#                 logging.info("Main file doesn't exist, restoring data from the backup file.")
#                 shutil.copy(backup_filepath, filepath)  # Restore from backup
#             else:
#                 # If neither the main file nor the backup exists, create an empty file
#                 logging.info("No file or backup found. Creating a new empty file.")
#                 existing_data = []
#                 with open(filepath, "wb") as f:
#                     pickle.dump(existing_data, f)  # Write empty data to Pickle file
#                 logging.info("Created an empty Pickle file.")
        
#         # Check if the current stats already exist in the data
#         current_time = stats[-1]["time"]  # Get the time of the latest entry

#         # Avoid adding duplicate time entries
#         if not any(entry["time"] == current_time for entry in existing_data):
#             # Append new stats to the existing data if time is not duplicate
#             existing_data.append(stats[-1])  # Append only the latest entry

#             # Write the updated data back to the file
#             with open(filepath, "wb") as f:
#                 pickle.dump(existing_data, f)  # Save data in Pickle format
                
#             # After write pkl, make a backup file
#             shutil.copy(filepath, backup_filepath)

#     except Exception as e:
#         # Log the error with critical level and the exception message
#         logging.error(f"Error saving system stats: {e}")

#         # If an error occurs, restore data from the backup file
#         if os.path.exists(backup_filepath):
#             logging.info("Restoring data from the backup file.")
#             shutil.copy(backup_filepath, filepath)  # Restore from backup
#         else:
#             logging.error("No backup file found. The data could not be saved or restored.")


DB_FILENAME = "system_stats.db"
TABLE_NAME = "system_stats"
def save_system_stats(stats: List[Dict]):
    """
    Save system statistics to an SQLite database safely.
    Only appends the latest stat if its 'time' doesn't already exist.
    """
    db_file = os.path.join(RESOURCE_INFO_STORAGE_PATH, DB_FILENAME)

    try:
        # Ensure the target directory exists
        os.makedirs(RESOURCE_INFO_STORAGE_PATH, exist_ok=True)

        # Connect to the SQLite database
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()

        # Create the table if it doesn't already exist
        create_table_query = f"""
        CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            time TEXT UNIQUE,
            cpu REAL,
            cpu_core_total REAL,
            cpu_core_using REAL,
            memory REAL,
            storage REAL,
            gpu TEXT,
            ram_total REAL,
            ram_free REAL,
            free_home_space REAL,
            net_upload REAL,
            net_download REAL
        )
        """
        cursor.execute(create_table_query)

        # Get the most recent entry
        latest_entry = stats[-1]
        time_value = latest_entry["time"]

        # Convert the GPU field to a string if it is a dict or list
        gpu_val = latest_entry.get("gpu")
        if isinstance(gpu_val, (dict, list)):
            latest_entry["gpu"] = json.dumps(gpu_val)
        elif gpu_val is None:
            latest_entry["gpu"] = "null"

        # Check if an entry with the same time already exists
        cursor.execute(f"SELECT 1 FROM {TABLE_NAME} WHERE time = ?", (time_value,))
        if not cursor.fetchone():
            # If not, insert the new entry
            insert_query = f"""
            INSERT INTO {TABLE_NAME} (
                time, cpu, cpu_core_total, cpu_core_using, memory, storage, gpu,
                ram_total, ram_free, free_home_space, net_upload, net_download
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            cursor.execute(insert_query, (
                latest_entry["time"],
                latest_entry["cpu"],
                latest_entry["cpu_core_total"],
                latest_entry["cpu_core_using"],
                latest_entry["memory"],
                latest_entry["storage"],
                latest_entry["gpu"],
                latest_entry["ram_total"],
                latest_entry["ram_free"],
                latest_entry["free_home_space"],
                latest_entry["net_upload"],
                latest_entry["net_download"]
            ))
            conn.commit()
            logging.info(f"Inserted new system stat at time: {time_value}")
        else:
            logging.info(f"System stat at time {time_value} already exists. Skipping insert.")

    except Exception as e:
        logging.error(f"Error saving system stats to SQLite: {e}")

    finally:
        if conn:
            conn.close()
            
            
# Periodic background task to save system stats
async def periodic_save_stats():
    while True:
        try:
            # Get the current time
            now = datetime.now()
            
            #Time period to save resource information (minutes)
            cycle_time=10

            # Calculate the next minute divisible by cycle_time=10 (e.g., 0, 10, 20, 30, 40, 50)
            current_minute = now.minute
            next_save_minute = ((current_minute // cycle_time) + 1) * cycle_time

            if next_save_minute == 60:
                # If next_save_minute is 60, reset to 0 and increment the hour
                next_save_minute = 0
                now_update = now.replace(minute=0, second=0, microsecond=0)
                now_update = now.replace(hour=(now.hour + 1) % 24)  # Increment hour
            
                target_time = now_update.replace(minute=next_save_minute, second=0, microsecond=0)
            else:
                target_time = now.replace(minute=next_save_minute, second=0, microsecond=0)
            wait_time = (target_time - now).total_seconds()+1

            # Wait until the next divisible minute (e.g., 0, 10, 20, etc.)
            await asyncio.sleep(wait_time)
                
            # Get system stats and save to file
            stats = get_system_stats()  # Fetch the system stats
            save_system_stats(stats)  # Save the stats to the file

        except Exception as e:
            print(f"Error occurred while saving system stats: {e}")



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
            f"cd /home/ariya/workspace/ && source /opt/anaconda3/bin/activate mlops-4inlab && nvidia-smi --query-gpu=index,name,memory.total,memory.used,memory.free,utilization.gpu --format=csv,noheader,nounits"
            # f"cd /home/ariya/workspace/ && "
            # f"source /opt/anaconda3/bin/activate mlops-4inlab && "
            # f"nvidia-smi --query-gpu=index,name,memory.total,memory.used,memory.free,utilization.gpu --format=csv,noheader,nounits"
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
    stats = []
    seoul_tz = pytz.timezone("Asia/Seoul")
    now = datetime.now(seoul_tz)

    memory_info = psutil.virtual_memory()
    memory = memory_info.percent
    ram_total = round(memory_info.total / (1024 ** 3), 2)  # GB
    ram_free = round(memory_info.available / (1024 ** 3), 2)

    storage = psutil.disk_usage('/').percent
    free_home_space = round(psutil.disk_usage('/home').free / (1024 ** 3), 2)

    net = psutil.net_io_counters()
    net_upload = round(net.bytes_sent / (1024 ** 2), 2)  # MB
    net_download = round(net.bytes_recv / (1024 ** 2), 2)

    cpu_core_total = psutil.cpu_count(logical=True)
    cpu_core_usage = psutil.cpu_percent(interval=1, percpu=True)
    cpu_core_using = sum(1 for usage in cpu_core_usage if usage > 0)
    cpu = int(cpu_core_using / cpu_core_total * 100)

    gpu = get_gpu_info()

    stats.append({
        "time": now.strftime("%Y-%m-%d %H:%M"),
        "cpu": cpu,
        "cpu_core_total": cpu_core_total,
        "cpu_core_using": cpu_core_using,
        "memory": memory,
        "storage": storage,
        "gpu": gpu,
        "ram_total": ram_total,
        "ram_free": ram_free,
        "free_home_space": free_home_space,
        "net_upload": net_upload,
        "net_download": net_download
    })

    return stats


# def get_system_stats_full():
#     """
#     Retrieves system statistics from the Pickle file and formats it for API response.
    
#     Returns:
#     - List of dict: System stats for each entry in the file.
#     """
#     filepath = os.path.join(RESOURCE_INFO_STORAGE_PATH, "system_stats.pkl")
#     try:
#         # Open and load the data from the Pickle file
#         with open(filepath, "rb") as f:
#             data = pickle.load(f)

#         # Process the data to match the required format
#         processed_data = []
#         for entry in data:
#             # Check and assign values with 'null' if they are missing
#             time_value = entry.get("time", None)
#             cpu_value = entry.get("cpu", None)
#             cpu_core_total_value = entry.get("cpu_core_total", None)
#             cpu_core_using_value = entry.get("cpu_core_using", None)
#             memory_value = entry.get("memory", None)
#             storage_value = entry.get("storage", None)
#             # Check if "gpu" contains an error message
#             if "error" in entry["gpu"]:
#                 # If error, generate a random GPU value between 20 and 70
#                 gpu_value = 'null'
#             else:
#                 gpu_value = entry["gpu"]  # Use the existing gpu value if it's valid

#             # Append the processed data
#             processed_data.append({
#                 "time": time_value,  # null if missing
#                 "cpu": cpu_value,  # null if missing
#                 "cpu_core_total": cpu_core_total_value,  # null if missing
#                 "cpu_core_using": cpu_core_using_value,  # null if missing
#                 "memory": memory_value,  # null if missing
#                 "storage": storage_value,  # null if missing
#                 "gpu": gpu_value,  # Assign the valid or random GPU value, or null if missing
#             })
        
#         return processed_data
    
#     except Exception as e:
#         return {"error": f"Failed to read or process system stats: {str(e)}"}


def get_system_stats_full():
    """
    Retrieves system statistics from the SQLite DB and formats for API response.
    
    Returns:
    - List[Dict] if success, or Dict with "error" key if failure.
    """
    db_file = os.path.join(RESOURCE_INFO_STORAGE_PATH, "system_stats.db")

    try:
        conn = sqlite3.connect(db_file)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM system_stats ORDER BY time ASC")
        rows = cursor.fetchall()

        processed_data = []
        for row in rows:
            gpu_raw = row["gpu"]
            try:
                # Attempt to parse the GPU string back to a dictionary
                gpu_obj = json.loads(gpu_raw) if isinstance(gpu_raw, str) else gpu_raw

                # If GPU contains an error, replace with 'null'
                if isinstance(gpu_obj, dict) and "error" in gpu_obj:
                    gpu_value = 'null'
                else:
                    gpu_value = gpu_obj  # keep as parsed dict
            except Exception:
                gpu_value = 'null'

            processed_data.append({
                "time": row["time"],
                "cpu": row["cpu"],
                "cpu_core_total": row["cpu_core_total"],
                "cpu_core_using": row["cpu_core_using"],
                "memory": row["memory"],
                "storage": row["storage"],
                "gpu": gpu_value,  # now a real object, not an escaped string
            })

        return processed_data

    except Exception as e:
        logging.error(f"Failed to fetch system stats from DB: {e}")
        return {"error": f"Failed to read system stats from DB: {str(e)}"}

    finally:
        if conn:
            conn.close()
            

def get_total_resource_using():
    db_file = os.path.join(RESOURCE_INFO_STORAGE_PATH, "system_stats.db")

    try:
        conn = sqlite3.connect(db_file)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM system_stats ORDER BY time ASC")
        rows = cursor.fetchall()

        if not rows:
            return {"error": "No data found in system_stats table."}

        history = []
        cpu_total_max = 0
        cpu_using_sum = 0

        for row in rows:
            try:
                timestamp = int(datetime.strptime(row["time"], "%Y-%m-%d %H:%M").timestamp() * 1000)

                gpu_obj = json.loads(row["gpu"]) if row["gpu"] and row["gpu"] != "null" else {}
                gpu_util = float(gpu_obj.get("gpu_utilization", "0").replace("%", "").strip()) if gpu_obj else 0.0

                cpu_total = int(row["cpu_core_total"] or 0)
                cpu_using = int(row["cpu_core_using"] or 0)
                cpu_util = float(row["cpu"] or 0)

                cpu_total_max = max(cpu_total_max, cpu_total)
                cpu_using_sum += cpu_using

                history.append({
                    "timestamp": timestamp,
                    "cpuCount": cpu_total,
                    "gpuCount": 1,
                    "cpuUtilization": cpu_util,
                    "gpuUtilization": gpu_util
                })
            except Exception as e:
                logging.warning(f"Error parsing row: {e}")
                continue

        latest = rows[-1]
        latest_gpu = json.loads(latest["gpu"]) if latest["gpu"] and latest["gpu"] != "null" else {}

        avg_gpu_util = round(sum(h["gpuUtilization"] for h in history) / len(history), 2)
        avg_cpu_util = round(sum(h["cpuUtilization"] for h in history) / len(history), 2)

        group = {
            "name": "로컬 워크스테이션",
            "workerCount": 1,
            "avgGpuUtil": avg_gpu_util,
            "avgCpuLoad": avg_cpu_util,
            "ramTotal": latest["ram_total"] if "ram_total" in latest.keys() else 0,
            "ramFree": latest["ram_free"] if "ram_free" in latest.keys() else 0,
            "freeHomeSpace": latest["free_home_space"] if "free_home_space" in latest.keys() else 0,
            "networkStatus": {
                "upload": latest["net_upload"] if "net_upload" in latest.keys() else 0,
                "download": latest["net_download"] if "net_download" in latest.keys() else 0,
            }
        }

        return {
            "metrics": {
                "workers": {"total": 1, "running": 1},
                "gpus": {"total": 1, "running": 1},
                "cpus": {"total": cpu_total_max, "running": int(cpu_using_sum / len(history))},
            },
            "history": history,
            "groups": [group]
        }

    except Exception as e:
        logging.error(f"Error in get_total_resource_using(): {e}")
        return {"error": f"Exception occurred: {str(e)}"}

    finally:
        if conn:
            conn.close()