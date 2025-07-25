import mlflow
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
import pytz
import pandas as pd
from mlflow.tracking import MlflowClient
from fastapi import UploadFile
import math, os, ast
import re
import yaml
MODEL_STORAGE_PATH = os.getenv("MODEL_STORAGE_PATH", "/home/ariya/central_storage/models/")

# Connect to MLflow server via URI
mlflow.set_tracking_uri("http://mlflow:5050")  # Ensure this URI is correct for your MLflow address

# The Metrics class represents the metrics of a run
class Metrics:
    def __init__(self, accuracy: float, loss: float):
        self.accuracy = accuracy  # Accuracy
        self.loss = loss          # Loss

# Function to get information of all experiments
def get_all_experiments() -> List[Dict[str, Any]]:
    # Retrieve all experiments without using a filter string
    experiments = mlflow.search_experiments()

    # List to store the information of experiments
    experiment_list = []
    for experiment in experiments:
        experiment_info = get_experiment_info(experiment.experiment_id)
        if experiment_info:
            experiment_list.append(experiment_info)
    
    return experiment_list

# Function to get detailed information of a single experiment
def get_experiment_info(experiment_id: str) -> Dict[str, Any]:
    
    if experiment_id == "0":
        return {"error": "Experiment with ID = 0 (default experiment) does not contain any runs. Skipping."}
    
    client = MlflowClient()

    # Get all runs of the experiment
    runs = client.search_runs(experiment_ids=[experiment_id])
    
    experiment = client.get_experiment(experiment_id)
    if experiment is None:
        return {
            "id": experiment_id,
            "name": None,
            "status": None,
            "dataset": None,
            "model": None,
            "version": None,
            "framework": None,
            "metrics": {
                "accuracy": None,
                "loss": None
            },
            "metrics_history": {
                "trainAcc": [],
                "valAcc": [],
                "trainLoss": [],
                "valLoss": []
            },
            "hyperparameters": {
                "learningRate": None,
                "batchSize": None,
                "epochs": None
            },
            "startTime": None,
            "endTime": None,
            "createdAt": None,
            "updatedAt": None,
            "runtime": None,
            "timestamp": None,
            "description": None
        }
        
        
    
    experiment_name = client.get_experiment(experiment_id).name
    
    # Check if the experiment has any runs
    if not runs:
        return {"error": f"No runs found for experiment with ID = {experiment_id}."}
    
    # Count the number of runs in the experiment (num_run)
    num_run = len(runs)
    # Generate the version based on num_run
    # Generate the version based on num_run
    if num_run > 10:
        major, minor, patch = 1, 0, num_run  # Start with 1.0.{num_run}
        patch = num_run
        if patch > 10:
            # Reset patch and increment minor version
            patch = 1
            minor += 1
        if minor > 10:
            # Reset minor and increment major version
            minor = 1
            major += 1
        version = f"{major}.{minor}.{patch}"
    else:
        version = f"v1.0.{num_run}"  # Regular versioning for less than or equal to 10 runsversioning for less than or equal to 10 runs
    
    # Loop through all runs to find the latest run
    latest_run = None
    # for run in runs:
    #     # Instead of using run['start_time'], we need to use run.info.start_time
    #     current_start_time = run.info.start_time.timestamp() if isinstance(run.info.start_time, pd.Timestamp) else run.info.start_time
        
    #     # Get start_time of the latest_run as a single value
    #     latest_run_start_time = latest_run.info.start_time.timestamp() if latest_run is not None and isinstance(latest_run.info.start_time, pd.Timestamp) else latest_run.info.start_time if latest_run else None

    #     # Compare times to find the latest run
    #     if latest_run is None or current_start_time > latest_run_start_time:
    #         latest_run = run  # Update with the latest run
    first_run = sorted(runs, key=lambda run: run.info.start_time)[0]
    latest_run = max(
        runs,
        key=lambda r: r.info.start_time.timestamp() if isinstance(r.info.start_time, pd.Timestamp) else r.info.start_time
    )

    # Check if there's a latest run
    if latest_run is not None:
        # Retrieve detailed information from the latest run
        run_id = latest_run.info.run_id
        run_name = latest_run.data.tags.get('mlflow.runName', 'Unknown Run Name')
        
        metrics_history = {
            'trainAcc': [],
            'valAcc': [],
            'trainLoss': [],
            'valLoss': []
        }
        
        # Get the list of metrics in the run
        metric_keys = latest_run.data.metrics.keys()

        for metric_key in metric_keys:
            # Get the history of the current metric key
            metric_history = client.get_metric_history(run_id=latest_run.info.run_id, key=metric_key)

            # Check valid values and replace NaN with 0
            valid_values = []
            for metric in metric_history:
                try:
                    # If the value can be converted to float, use it
                    valid_value = float(metric.value)
                    if valid_value != valid_value:  # Check for NaN
                        valid_value = 0
                    valid_values.append(valid_value)
                except (ValueError, TypeError):
                    # If invalid, replace with 0
                    valid_values.append(0)

            # Map the valid values to the respective metrics
            if metric_key == 'train_acc':
                metrics_history['trainAcc'] = valid_values
            elif metric_key == 'val_acc':
                metrics_history['valAcc'] = valid_values
            elif metric_key == 'train_loss':
                metrics_history['trainLoss'] = valid_values
            elif metric_key == 'val_loss':
                metrics_history['valLoss'] = valid_values
            
        # ✅ Fallback nếu các metric đều rỗng
        if all(metric == [] for metric in metrics_history.values()):
            logs = get_latest_run_logs(experiment_id)
            if logs:
                train_losses, val_losses = [], []
                train_accs, val_accs = [], []

                for log in logs:
                    msg = log.get("message", "")
                    if "Epoch" in msg:
                        # Lấy loss và val_loss
                        match = re.search(r"loss = ([0-9.]+), val_loss = ([0-9.]+)", msg)
                        if match:
                            try:
                                train_losses.append(float(match.group(1)))
                                val_losses.append(float(match.group(2)))
                            except ValueError:
                                train_losses.append(0.0)
                                val_losses.append(0.0)

                        # Lấy smape và val_smape để tính accuracy
                        smape_match = re.search(r"smape = ([0-9.]+), val_smape = ([0-9.]+)", msg)
                        if smape_match:
                            try:
                                smape = float(smape_match.group(1))
                                val_smape = float(smape_match.group(2))
                                train_accs.append(100.0 - smape)
                                val_accs.append(100.0 - val_smape)
                            except ValueError:
                                train_accs.append(0.0)
                                val_accs.append(0.0)

                metrics_history['trainLoss'] = train_losses
                metrics_history['valLoss'] = val_losses
                metrics_history['trainAcc'] = train_accs
                metrics_history['valAcc'] = val_accs
                
                
        try:
             # Map MLflow status to custom status names
            status_map = {
                'RUNNING': 'running',
                'FINISHED': 'completed',
                'FAILED': 'failed',
                'KILLED': 'killed'
            }
            original_status = latest_run.info.status
            status = status_map.get(original_status, 'unknown')
        except AttributeError:
            status = 'unknown'  # Default if status attribute does not exist

        dataset = latest_run.data.tags.get('dataset', 'Unknown Dataset')
        model_type = latest_run.data.tags.get('model_type', 'Unknown Model')

        # # Get metrics (accuracy, loss) from the latest run
        # accuracy=float(latest_run.data.tags.get('accuracy', 0.0)) if latest_run.data.tags.get('accuracy') else 0.0
        # loss=float(latest_run.data.tags.get('final_loss', 0.0)) if latest_run.data.tags.get('final_loss') else 0.0
        # Get metrics (accuracy, loss) from the latest run
        accuracy = latest_run.data.tags.get('accuracy')
        loss = latest_run.data.tags.get('final_loss')

        # Try casting to float
        try:
            accuracy = float(accuracy) if accuracy is not None else None
        except (ValueError, TypeError):
            accuracy = None

        try:
            loss = float(loss) if loss is not None else None
        except (ValueError, TypeError):
            loss = None

        # ✅ Fallback nếu không có accuracy/loss thì lấy từ metrics_history (epoch cuối)
        if (accuracy is None or accuracy == 0.0) and metrics_history['trainAcc']:
            accuracy = metrics_history['trainAcc'][-1]  # Epoch cuối cùng
        if (loss is None or loss == 0.0) and metrics_history['trainLoss']:
            loss = metrics_history['trainLoss'][-1]
            

        # Check and cast accuracy and loss to float
        try:
            accuracy = float(accuracy) if isinstance(accuracy, (int, float)) else 0.0
        except (ValueError, TypeError):
            accuracy = 0.0

        try:
            loss = float(loss) if isinstance(loss, (int, float)) else 0.0
        except (ValueError, TypeError):
            loss = 0.0
            
        # Convert start_time to formatted string
        start_time_str = "Unknown"
        if latest_run.info.start_time:
            try:
                start_time = datetime.fromtimestamp(latest_run.info.start_time / 1000, tz=pytz.utc)
                start_time_str = start_time.strftime('%Y-%m-%d %H:%M:%S')
            except Exception as e:
                print("Error formatting start_time:", e)

        # Convert end_time to formatted string
        end_time_str = "Unknown"
        if latest_run.info.end_time:
            try:
                end_time = datetime.fromtimestamp(latest_run.info.end_time / 1000, tz=pytz.utc)
                end_time_str = end_time.strftime('%Y-%m-%d %H:%M:%S')
            except Exception as e:
                print("Error formatting end_time:", e)

        # Get `updatedAt` from `end_time` of the latest run
        if latest_run.info.end_time:
            # Check if end_time has a valid value (could be int or None)
            if isinstance(latest_run.info.end_time, (int, float)):
                # If it's an int (milliseconds), convert it to seconds then use timestamp
                updated_at = str(datetime.fromtimestamp(latest_run.info.end_time / 1000, tz=pytz.timezone('Asia/Seoul')).date())
            elif isinstance(latest_run.info.end_time, pd.Timestamp):
                # If it's a pd.Timestamp, directly use timestamp()
                updated_at = str(datetime.fromtimestamp(latest_run.info.end_time.timestamp(), tz=pytz.timezone('Asia/Seoul')).date())
            else:
                updated_at = "Invalid end_time format"
        else:
            updated_at = "No valid end_time"
            
        # Get the `timestamp` from `Date`
        timestamp = None
        if latest_run.info.start_time:
            try:
                start_time = datetime.fromtimestamp(latest_run.info.start_time / 1000, tz=pytz.timezone('Asia/Seoul'))
                timestamp = start_time.strftime('%Y-%m-%d %H:%M')
            except Exception as e:
                print("Error parsing timestamp:", e)
                timestamp = "Invalid timestamp"

        # Get `runtime` from `Duration`
        runtime = "Unknown"
        if latest_run.info.start_time and latest_run.info.end_time:
            try:
                duration_seconds = (latest_run.info.end_time - latest_run.info.start_time) / 1000  # Convert ms to seconds
                runtime = str(timedelta(seconds=int(duration_seconds)))  # Convert seconds to HH:MM:SS
            except Exception as e:
                print("Error calculating runtime:", e)
                runtime = "Invalid runtime"

        # Get the description of the latest run
        description = latest_run.data.tags.get('description', 'No Description')
        
        framework = latest_run.data.tags.get('framework', 'Unknown framework')
        
        # Get the hyperparameters from the tags
        hyperparameters = {
            "learningRate": float(latest_run.data.params.get('learning_rate', 0.001)) if latest_run.data.params.get('learning_rate') else 0.001,
            "batchSize": int(latest_run.data.params.get('batch_size', None)) if latest_run.data.params.get('batch_size') else None,
            "epochs": int(latest_run.data.params.get('epochs', None)) if latest_run.data.params.get('epochs') else None
        }
        
    created_at = datetime.fromtimestamp(first_run.info.start_time / 1000, tz=pytz.timezone('Asia/Seoul')).strftime('%Y-%m-%d %H:%M')
        

    # Return experiment information with the details of the latest run
    return {
        "id": experiment_id,
        "name": experiment_name,
        "status": status,
        "dataset": dataset,
        "model": model_type,
        "version": version,
        "framework": framework,
        "metrics": {
            "accuracy": accuracy,
            "loss": loss
        },
        "metrics_history": metrics_history,
        "hyperparameters": hyperparameters,
        "startTime":start_time_str,
        "endTime":end_time_str,
        "createdAt": created_at,
        "updatedAt": end_time_str,
        "runtime": runtime,
        "timestamp": timestamp,
        "description": description
    }



# Function to get the information of runs in an experiment
def get_runs_for_experiment(experiment_id: str) -> List[Dict[str, Any]]:
    # Initialize the MLflow client
    client = MlflowClient()

    # Get all runs of the experiment
    runs = client.search_runs(experiment_ids=[experiment_id])

    # List to store the information of runs
    run_info = []
    for run in runs:
        metrics = {
            'trainAcc': [],
            'valAcc': [],
            'trainLoss': [],
            'valLoss': []
        }
        
        # Get the list of metrics in the run
        metric_keys = run.data.metrics.keys()

        for metric_key in metric_keys:
            # Get the history of the current metric key
            metric_history = client.get_metric_history(run_id=run.info.run_id, key=metric_key)

            # Check valid values and replace NaN with 0
            valid_values = []
            for metric in metric_history:
                try:
                    # If the value can be converted to float, use it
                    valid_value = float(metric.value)
                    if valid_value != valid_value:  # Check for NaN
                        valid_value = 0
                    valid_values.append(valid_value)
                except (ValueError, TypeError):
                    # If invalid, replace with 0
                    valid_values.append(0)

            # Map the valid values to the respective metrics
            if metric_key == 'train_acc':
                metrics['trainAcc'] = valid_values
            elif metric_key == 'val_acc':
                metrics['valAcc'] = valid_values
            elif metric_key == 'train_loss':
                metrics['trainLoss'] = valid_values
            elif metric_key == 'val_loss':
                metrics['valLoss'] = valid_values
        # ✅ Fallback nếu các metric đều rỗng
        if all(metric == [] for metric in metrics.values()):
            logs = get_latest_run_logs(experiment_id)
            if logs:
                train_losses, val_losses = [], []
                train_accs, val_accs = [], []

                for log in logs:
                    msg = log.get("message", "")
                    if "Epoch" in msg:
                        # Lấy loss và val_loss
                        match = re.search(r"loss = ([0-9.]+), val_loss = ([0-9.]+)", msg)
                        if match:
                            try:
                                train_losses.append(float(match.group(1)))
                                val_losses.append(float(match.group(2)))
                            except ValueError:
                                train_losses.append(0.0)
                                val_losses.append(0.0)

                        # Lấy smape và val_smape để tính accuracy
                        smape_match = re.search(r"smape = ([0-9.]+), val_smape = ([0-9.]+)", msg)
                        if smape_match:
                            try:
                                smape = float(smape_match.group(1))
                                val_smape = float(smape_match.group(2))
                                train_accs.append(100.0 - smape)
                                val_accs.append(100.0 - val_smape)
                            except ValueError:
                                train_accs.append(0.0)
                                val_accs.append(0.0)

                metrics['trainLoss'] = train_losses
                metrics['valLoss'] = val_losses
                metrics['trainAcc'] = train_accs
                metrics['valAcc'] = val_accs
        
        # Get `model` from the tags of the run
        model_type = run.data.tags.get('model_type', 'Unknown Model')
        dataset_name = run.data.tags.get('dataset', 'Unknown Dataset')
        
        # accuracy = run.data.tags.get('accuracy', 0.0)
        # loss = run.data.tags.get('final_loss', 0.0)
        # accuracy=float(run.data.tags.get('accuracy', 0.0)) if run.data.tags.get('accuracy') else 0.0
        # loss=float(run.data.tags.get('final_loss', 0.0)) if run.data.tags.get('final_loss') else 0.0
        accuracy = run.data.tags.get('accuracy')
        loss = run.data.tags.get('final_loss')

        # Try casting to float
        try:
            accuracy = float(accuracy) if accuracy is not None else None
        except (ValueError, TypeError):
            accuracy = None

        try:
            loss = float(loss) if loss is not None else None
        except (ValueError, TypeError):
            loss = None

        # ✅ Fallback nếu không có accuracy/loss thì lấy từ metrics_history (epoch cuối)
        if (accuracy is None or accuracy == 0.0) and metrics['trainAcc']:
            accuracy = metrics['trainAcc'][-1]  # Epoch cuối cùng
        if (loss is None or loss == 0.0) and metrics['trainLoss']:
            loss = metrics['trainLoss'][-1]
            
        # Check and cast accuracy and loss to float
        try:
            accuracy = float(accuracy) if isinstance(accuracy, (int, float)) else 0.0
        except (ValueError, TypeError):
            accuracy = 0.0

        try:
            loss = float(loss) if isinstance(loss, (int, float)) else 0.0
        except (ValueError, TypeError):
            loss = 0.0

        # Get the end time of the run and calculate runtime
        if run.info.end_time:  # Check if the run has an end_time attribute
            end_time = run.info.end_time / 1000  # Convert from milliseconds to seconds
            start_time = run.info.start_time / 1000
            runtime_seconds = end_time - start_time
            hours, remainder = divmod(runtime_seconds, 3600)
            minutes, seconds = divmod(remainder, 60)
            runtime = f"{int(hours)}h {int(minutes)}m {int(seconds)}s"
            
            updated_at = str(datetime.fromtimestamp(end_time, tz=pytz.timezone('Asia/Seoul')).date())
            
        else:
            updated_at = "Unknown Date"
            runtime = "Unknown"

        created_at = str(datetime.fromtimestamp(start_time, tz=pytz.timezone('Asia/Seoul')).strftime('%Y-%m-%d %H:%M'))

        # Get the hyperparameters from the tags
        hyperparameters = {
            "learningRate": float(run.data.params.get('learning_rate', 0.001)) if run.data.params.get('learning_rate') else 0.001,
            "batchSize": int(run.data.params.get('batch_size', None)) if run.data.params.get('batch_size') else None,
            "epochs": int(run.data.params.get('epochs', None)) if run.data.params.get('epochs') else None
        }
                
        
        
        # The description of the run
        description = run.data.tags.get('description', 'No Description')

        # Detailed information of each run
        run_list = {
            "id": experiment_id,  # Fixed to get the correct run_id
            "run_id": run.info.run_id,  # Run ID
            "run_name": run.data.tags.get('mlflow.runName', 'Unknown Run Name'),
            "dataset": dataset_name,
            "model": model_type,
            "status": run.info.status,
            "accuracy": accuracy,  # Assuming 'train_mape' is the accuracy metric
            "f1Score": 0,  # Assuming F1 score (you'll need a function to calculate F1 if needed)
            "loss": loss,  # Get loss from metrics
            "runtime": runtime,
            "created": created_at,
            "hyperparameters": hyperparameters,
            "metrics": metrics,  # Ensure metrics are always present
            "updatedAt": updated_at,
            "description": description
        }
        run_info.append(run_list)
    return run_info



# Function to get the latest run information for an experiment
def get_latest_run_for_experiment(experiment_id: str) -> Dict[str, Any]:
    # Initialize the MLflow client
    client = MlflowClient()

    # Get all runs for the experiment
    runs = client.search_runs(experiment_ids=[experiment_id])
    
    experiment_name = client.get_experiment(experiment_id).name


    # Check if there are no runs
    if not runs:
        return None

    # Sort runs by start time (start_time), get the latest run
    latest_run = max(runs, key=lambda run: run.info.start_time)
    
    try:
            # Map MLflow status to custom status names
        status_map = {
            'RUNNING': 'running',
            'FINISHED': 'completed',
            'FAILED': 'failed',
            'KILLED': 'killed'
        }
        original_status = latest_run.info.status
        status = status_map.get(original_status, 'unknown')
    except AttributeError:
        status = 'unknown'  # Default if status attribute does not exist

    metrics = {
        'trainAcc': [],
        'valAcc': [],
        'trainLoss': [],
        'valLoss': []
    }

    # Get the list of metrics in the run
    metric_keys = latest_run.data.metrics.keys()

    # Loop through each metric_key and get the metric history
    for metric_key in metric_keys:
        # Get the history of the current metric key
        metric_history = client.get_metric_history(run_id=latest_run.info.run_id, key=metric_key)

        # Check valid values and replace NaN with 0
        valid_values = []
        for metric in metric_history:
            try:
                # If the value can be converted to float, use it
                valid_value = float(metric.value)
                if valid_value != valid_value:  # Check for NaN
                    valid_value = 0
                valid_values.append(valid_value)
            except (ValueError, TypeError):
                # If invalid, replace with 0
                valid_values.append(0)

        # Map the valid values to the respective metrics
        if metric_key == 'train_acc':
            metrics['trainAcc'] = valid_values
        elif metric_key == 'val_acc':
            metrics['valAcc'] = valid_values
        elif metric_key == 'train_loss':
            metrics['trainLoss'] = valid_values
        elif metric_key == 'val_loss':
            metrics['valLoss'] = valid_values
            
    # ✅ Fallback nếu các metric đều rỗng
    if all(metric == [] for metric in metrics.values()):
        logs = get_latest_run_logs(experiment_id)
        if logs:
            train_losses, val_losses = [], []
            train_accs, val_accs = [], []

            for log in logs:
                msg = log.get("message", "")
                if "Epoch" in msg:
                    # Lấy loss và val_loss
                    match = re.search(r"loss = ([0-9.]+), val_loss = ([0-9.]+)", msg)
                    if match:
                        try:
                            train_losses.append(float(match.group(1)))
                            val_losses.append(float(match.group(2)))
                        except ValueError:
                            train_losses.append(0.0)
                            val_losses.append(0.0)

                    # Lấy smape và val_smape để tính accuracy
                    smape_match = re.search(r"smape = ([0-9.]+), val_smape = ([0-9.]+)", msg)
                    if smape_match:
                        try:
                            smape = float(smape_match.group(1))
                            val_smape = float(smape_match.group(2))
                            train_accs.append(100.0 - smape)
                            val_accs.append(100.0 - val_smape)
                        except ValueError:
                            train_accs.append(0.0)
                            val_accs.append(0.0)

            metrics['trainLoss'] = train_losses
            metrics['valLoss'] = val_losses
            metrics['trainAcc'] = train_accs
            metrics['valAcc'] = val_accs

    # Get `model` from the tags of the run
    model_type = latest_run.data.tags.get('model_type', 'Unknown Model')
    dataset_name = latest_run.data.tags.get('dataset', 'Unknown Dataset')

    # accuracy = latest_run.data.tags.get('accuracy', 0.0)
    # loss = latest_run.data.tags.get('final_loss', 0.0)
    # accuracy=float(latest_run.data.tags.get('accuracy', 0.0)) if latest_run.data.tags.get('accuracy') else 0.0
    # loss=float(latest_run.data.tags.get('final_loss', 0.0)) if latest_run.data.tags.get('final_loss') else 0.0
    accuracy = latest_run.data.tags.get('accuracy')
    loss = latest_run.data.tags.get('final_loss')

    # Try casting to float
    try:
        accuracy = float(accuracy) if accuracy is not None else None
    except (ValueError, TypeError):
        accuracy = None

    try:
        loss = float(loss) if loss is not None else None
    except (ValueError, TypeError):
        loss = None

    # ✅ Fallback nếu không có accuracy/loss thì lấy từ metrics_history (epoch cuối)
    if (accuracy is None or accuracy == 0.0) and metrics['trainAcc']:
        accuracy = metrics['trainAcc'][-1]  # Epoch cuối cùng
    if (loss is None or loss == 0.0) and metrics['trainLoss']:
        loss = metrics['trainLoss'][-1]
        
    # Check and cast accuracy and loss to float
    try:
        accuracy = float(accuracy) if isinstance(accuracy, (int, float)) else 0.0
    except (ValueError, TypeError):
        accuracy = 0.0

    try:
        loss = float(loss) if isinstance(loss, (int, float)) else 0.0
    except (ValueError, TypeError):
        loss = 0.0

    # Get the end time of the run and calculate runtime
    if latest_run.info.end_time:  # Check if the run has an end_time attribute
        end_time = latest_run.info.end_time / 1000  # Convert from milliseconds to seconds
        start_time = latest_run.info.start_time / 1000
        runtime_seconds = end_time - start_time
        hours, remainder = divmod(runtime_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        runtime = f"{int(hours)}h {int(minutes)}m {int(seconds)}s"
        
    else:
        runtime = "Unknown"
        
    # created_at = str(datetime.fromtimestamp(start_time, tz=pytz.timezone('Asia/Seoul')).strftime('%Y-%m-%d %H:%M'))
    created_at = datetime.fromtimestamp(latest_run.info.start_time / 1000, tz=pytz.timezone('Asia/Seoul')).strftime('%Y-%m-%d %H:%M')
    
    # Get the hyperparameters from the tags
    hyperparameters = {
        "learningRate": float(latest_run.data.params.get('learning_rate', 0.001)) if latest_run.data.params.get('learning_rate') else 0.001,
        "batchSize": int(latest_run.data.params.get('batch_size', None)) if latest_run.data.params.get('batch_size') else None,
        "epochs": int(latest_run.data.params.get('epochs', None)) if latest_run.data.params.get('epochs') else None
    }

    
    # Detailed information of the latest run
    run_info = {
        "id": experiment_id,
        "name": experiment_name,
        "dataset": dataset_name,
        "model": model_type,
        "status": status,
        "accuracy": accuracy,
        "f1Score": 0,  # F1 score assumed
        "loss": loss,
        "runtime": runtime,
        "created": created_at,
        "hyperparameters": hyperparameters,
        "metrics": metrics,
    }

    return run_info

# Function to parse the log file and return logs in the desired format
def parse_log_file(log_file_path: str) -> list:
    log_entries = []
    
    try:
        with open(log_file_path, 'r') as log_file:
            log_lines = log_file.readlines()
            
            # Updated regex pattern to handle the timestamp with timezone, process ID, log level, and message
            log_pattern = r'\[(?P<timestamp>[\d\-]+\s[\d:]+\s[+\-]\d{4})\]\s\[\d+\]\s\[(?P<level>[A-Z]+)\]\s(?P<message>.+)'
            
            for line in log_lines:
                match = re.match(log_pattern, line.strip())
                if match:
                    timestamp = match.group('timestamp')
                    level = match.group('level')
                    message = match.group('message')
                    
                    # Append parsed log entry to the list
                    log_entries.append({
                        'timestamp': timestamp,
                        'level': level,
                        'message': message
                    })
    except Exception as e:
        print(f"Error reading or parsing log file: {e}")
    
    return log_entries

# Function to get the latest run information for an experiment
def get_latest_run_logs(experiment_id: str) -> Dict[str, Any]:
    # Initialize the MLflow client
    client = MlflowClient()

    # Get all runs for the experiment
    runs = client.search_runs(experiment_ids=[experiment_id])
    experiment_name = client.get_experiment(experiment_id).name

    # Check if there are no runs
    if not runs:
        return None

    # Sort runs by start time (start_time), get the latest run
    latest_run = max(runs, key=lambda run: run.info.start_time)
    
    # Get the log file path from the tags of the latest run
    log_file_path = latest_run.data.tags.get('log_file', 'Unknown')
    
    # If no log file path is found, return None
    if log_file_path == 'Unknown':
        return None
    
    # Parse the log file and return the logs in the desired format
    latest_run_logs = parse_log_file(log_file_path)
    
    return latest_run_logs



def get_mlflow_and_datasets_info() -> Dict[str, list]:
    """
    This function retrieves information about the registered models in MLflow and the datasets from the DVC_ROOT directory.
    
    Returns:
        - dataset: List of datasets (subdirectories in DVC_ROOT).
        - model: List of registered models in MLflow.
    """
    # Define the directories
    DVC_DATA_STORAGE = os.getenv("DVC_DATA_STORAGE", "/home/ariya/central_storage/datasets/")
    MODEL_CODE_STORAGE_PATH = os.getenv("MODEL_CODE_STORAGE_PATH", "/home/ariya/workspace/models/")

    # Retrieve the list of datasets in the DVC_ROOT directory
    datasets = [
        d for d in os.listdir(DVC_DATA_STORAGE)
        if os.path.isdir(os.path.join(DVC_DATA_STORAGE, d)) and d != ".ipynb_checkpoints"
    ]

    # Retrieve the list of model names (excluding __init__.py)
    model_names = []
    for root, dirs, files in os.walk(MODEL_CODE_STORAGE_PATH):
        for file in files:
            if file.endswith(".py") and file != "__init__.py":
                model_names.append(file.replace(".py", ""))  # Remove the .py extension

    return {
        "framework": ["Pytorch", "Tensorflow", "Scikit-learn", "XGBoost"],
        "dataset": datasets,
        "model": model_names
    }
    
    
    
# Function to get registered model details as a list of dictionaries
def get_registered_all_models() -> List[Dict[str, Any]]:
    client = MlflowClient()
    models = []
    
    # Search for all registered models
    registered_models = client.search_registered_models()  # Use search_registered_models
    
    for idx, model in enumerate(registered_models, 1):  # Start counting from 1
        # Get the details of the latest version
        latest_version = model.latest_versions
        latest_version  = sorted(latest_version, key=lambda v: tuple(map(int, v.version.split('.'))))
        latest_version =latest_version [-1]
        # Create a dictionary containing metadata for each model
        model_status_mapping = {
        "Production": "deployed", 
        "Staging": "training", 
        "Archived": "failed", 
        "Uploaded": "ready",
        "Deployed": "deployed",
        "None": "ready",
        "READY": "ready"
        }
        raw_status = latest_version.tags.get("status", "unknown")
        custom_status = model_status_mapping.get(raw_status, raw_status)
        model_info = {
            # "id": f'model-{idx}',  # Assign a custom id based on the order
            "id": str(idx),
            "name": model.name,
            "description": latest_version.description if latest_version.description else "No Description",
            "framework": latest_version.tags.get('framework', 'Unknown'),
            "version": latest_version.version + ".0",
            "status": custom_status,
            "accuracy": float(latest_version.tags.get('accuracy', 0.0)) if latest_version.tags.get('accuracy') else 0.0,
            "trainTime": latest_version.tags.get("train_time", "Unknown"),
            "dataset": latest_version.tags.get("dataset", "Unknown"),
            "createdAt": latest_version.tags.get("createdAt", "Unknown"),  # Convert timestamp to string
            "updatedAt": latest_version.tags.get("updatedAt", "Unknown"),  # Convert timestamp to string
            "thumbnail": latest_version.tags.get("thumbnail", f"/model-thumbnails/{model.name}_thum.png"),  # Example for getting thumbnail
            "servingStatus": {
                "isDeployed": custom_status == "deployed", #custom_status == "deployed" → isDeployed = true, other cases isDeployed = false
                "health": "healthy"  # Adjust if there's a real health check
            }
        }
        models.append(model_info)
    
    return models




def get_model_details(model_name: str, model_id: str) -> List[Dict[str, Any]]:
    """
    Fetches detailed information about a registered model from MLflow based on its model_id.
    Returns the model details as a list of dictionaries.
    """
    client = MlflowClient()
    models = []

    # Search for the registered model by its name (model_id in this case)
    filter_string = f"name='{model_name}'"
    registered_models = client.search_registered_models(filter_string=filter_string)

    if not registered_models:
        raise ValueError(f"Model with id '{model_name}' not found in MLflow")

    model = registered_models[0]  # Get the first registered model

    # Get the latest version of the model
    versions = client.search_model_versions(f"name='{model_name}'")
    versions  = sorted(versions, key=lambda v: tuple(map(int, v.version.split('.'))))
    # Kiểm tra nếu có ít nhất 2 phiên bản
    if len(versions) > 1:
        latest_version = versions[-1]  # Phiên bản mới nhất
        previous_version = versions[-2]  # Phiên bản trước đó
    else:
        latest_version = versions[-1]
        previous_version = None  # Nếu chỉ có một phiên bản thì không có phiên bản trước đó
    
    model_status_mapping = {
        "Production": "deployed", 
        "Staging": "training", 
        "Archived": "failed", 
        "Uploaded": "ready",
        "Deployed": "deployed",
        "None": "ready",
        "READY": "ready"
        }
    raw_status = latest_version.tags.get("status", "unknown")
    custom_status = model_status_mapping.get(raw_status, raw_status)
    
    # Create model details as a dictionary
    model_info = {
        "id": model_id,
        "name": model_name,
        "description": latest_version.description if latest_version.description else "No Description",
        "framework": latest_version.tags.get('framework', 'Unknown'),
        "version": latest_version.version+".0",
        "previousVersion": previous_version.version + ".0" if previous_version else "None",
        "status": custom_status,
        "accuracy": float(latest_version.tags.get('accuracy', 0.0)) if latest_version.tags.get('accuracy') else 0.0,
        "previousAccuracy": float(previous_version.tags.get('accuracy', 0.0)) if previous_version and previous_version.tags.get('accuracy') else 0.0,
        "trainTime": latest_version.tags.get("training_time", "Unknown"),
        "dataset": {
            "name": latest_version.tags.get("dataset_name", "Unknown"),
            "size": latest_version.tags.get("dataset_size", "Unknown"),
            "split": latest_version.tags.get("dataset_split", "Unknown"),
            "format": latest_version.tags.get("dataset_format", "Unknown")
        },
        "createdAt": latest_version.tags.get("createdAt", "Unknown"),  # Chuyển đổi timestamp thành chuỗi
        "updatedAt": latest_version.tags.get("updatedAt", "Unknown"),
        "deployedAt": latest_version.tags.get("deployedAt", "Unknown"),
        "author": latest_version.tags.get("author", "4INLAB"),
        "task": latest_version.tags.get("task", "Stock Prediction"),
        "thumbnail": latest_version.tags.get("thumbnail", f"/model-thumbnails/{model_name}_thum.png"),
        "servingStatus": {
            "isDeployed": custom_status == "deployed",
            "health": latest_version.tags.get("health", "healthy"),  # Placeholder; You can replace with actual health check logic
            "requirements": {
                "cpu": latest_version.tags.get("cpu", "fulfilled"),
                "memory": latest_version.tags.get("memory", "fulfilled"),
                "gpu": latest_version.tags.get("gpu", "N/A")
            },
            "latency": latest_version.tags.get("latency", "45ms"),
            "throughput": latest_version.tags.get("throughput", "120 requests/sec"),
            "uptime": latest_version.tags.get("uptime", "99.9%")
        },
        "metrics": {
            "accuracy": float(latest_version.tags.get('accuracy', 0.0)) if latest_version.tags.get('accuracy') else 0.0,
            "precision": float(latest_version.tags.get('precision', 0.0)) if latest_version.tags.get('precision') else 0.0,
            "recall": float(latest_version.tags.get('recall', 0.0)) if latest_version.tags.get('recall') else 0.0,
            "f1Score": float(latest_version.tags.get('f1Score', 0.0)) if latest_version.tags.get('f1Score') else 0.0,
            "auc": float(latest_version.tags.get('auc', 0.0)) if latest_version.tags.get('auc') else 0.0,
            "latency": 45,
            "throughput": 120
        },
        "previousMetrics": {
            "accuracy": float(latest_version.tags.get("previousAccuracy", 0.0)),
            "precision": float(latest_version.tags.get("previousPrecision", 0.0)),
            "recall": float(latest_version.tags.get("previousRecall", 0.0)),
            "f1Score": float(latest_version.tags.get("previousF1Score", 0.0)),
            "auc": float(latest_version.tags.get("previousAuc", 0.0)),
            "latency": 50,
            "throughput": 100
        },
        "versions": []
    }
    
    
    metric_keys = ['train_acc', 'train_loss', 'val_acc', 'val_loss']
    # Now fetch all versions of the model
    for version in versions:
        
        # Lấy lịch sử metric cho từng key
        metric_history = {}
        for metric_key in metric_keys:
            metric_history[metric_key] = client.get_metric_history(version.run_id, metric_key)

        # Xử lý dữ liệu thành dạng hợp lệ cho trainingHistory
        training_history = []
        epochs = len(metric_history['train_acc'])  # Giả sử các metrics có số lượng epoch giống nhau

        for epoch in range(epochs):
            training_history.append({
                "epoch": epoch + 1,
                "trainAccuracy": float(metric_history['train_acc'][epoch].value),
                "trainLoss": float(metric_history['train_loss'][epoch].value),
                "valAccuracy": float(metric_history['val_acc'][epoch].value),
                "valLoss": float(metric_history['val_loss'][epoch].value),
            })
        
        raw_version_status = version.tags.get("status", "unknown")
        custom_version_status = model_status_mapping.get(raw_version_status, raw_version_status)
        
        version_info = {
            "version": version.version+".0",
            "status": custom_version_status,
            "createdAt": version.tags.get("createdAt", "Unknown"),  # Chuyển đổi timestamp thành chuỗi
            "metrics": {
                "accuracy": float(version.tags.get('accuracy', 0.0)),
                "precision": float(version.tags.get('precision', 0.0)),
                "recall": float(version.tags.get('recall', 0.0)),
                "f1Score": float(version.tags.get('f1Score', 0.0)),
                "auc": float(version.tags.get('auc', 0.0)),
                "latency": 45,
                "throughput": 120
            },
            "trainingHistory": training_history,
        }
        model_info["versions"].append(version_info)  # Add version info to the list of versions

    models.append(model_info)  # Add the model info to the models list
    return models  # Returning the list of model details

def get_model_version_performance_compare(model_name: str) -> Dict[str, Any]:
    """
    Fetches performance metrics and training details of the current and previous versions of a registered model from MLflow.
    Returns the performance comparison as a dictionary.
    """
    client = MlflowClient()

    # Fetch all versions of the model
    versions = client.search_model_versions(f"name='{model_name}'")
    versions = sorted(versions, key=lambda v: tuple(map(int, v.version.split('.'))))

    # If there are less than 2 versions, raise an error
    if len(versions) < 2:
        raise ValueError(f"Not enough versions of model '{model_name}' to compare performance.")

    # Get the current (latest) and previous versions
    current_version = versions[-1]
    previous_version = versions[-2]

    # Map status codes to readable status
    model_status_mapping = {
        "Production": "deployed", 
        "Staging": "training", 
        "Archived": "failed", 
        "Uploaded": "ready",
        "Deployed": "deployed",
        "None": "ready",
        "READY": "ready"
    }

    # Get the status for the current and previous versions
    def get_version_metrics(version):
        raw_status = version.tags.get("status", "unknown")
        custom_status = model_status_mapping.get(raw_status, raw_status)
        
        metrics = {
            "accuracy": float(version.tags.get('accuracy', 0.0)),
            "precision": float(version.tags.get('precision', 0.0)),
            "recall": float(version.tags.get('recall', 0.0)),
            "f1Score": float(version.tags.get('f1Score', 0.0)),
            "auc": float(version.tags.get('auc', 0.0)),
            "latency": 45,
            "throughput": 120,
            "truePositives": int(version.tags.get('truePositives', 0)),
            "falsePositives": int(version.tags.get('falsePositives', 0)),
            "falseNegatives": int(version.tags.get('falseNegatives', 0)),
            "trueNegatives": int(version.tags.get('trueNegatives', 0)),
            "specificity": float(version.tags.get('specificity', 0.0)),
            "mcc": float(version.tags.get('mcc', 0.0)),
            "kappa": float(version.tags.get('kappa', 0.0))
        }
        
        return custom_status, metrics

    # Get the metrics for current and previous versions
    current_status, current_metrics = get_version_metrics(current_version)
    previous_status, previous_metrics = get_version_metrics(previous_version)
    previous_status="ready"

    # Training history
    def get_training_history(version):
        metric_keys = ['train_acc', 'train_loss', 'val_acc', 'val_loss']
        metric_history = {}
        for metric_key in metric_keys:
            metric_history[metric_key] = client.get_metric_history(version.run_id, metric_key)

        training_history = []
        epochs = len(metric_history['train_acc'])  # Assuming all metrics have the same number of epochs

        for epoch in range(epochs):
            training_history.append({
                "epoch": epoch + 1,
                "trainAccuracy": float(metric_history['train_acc'][epoch].value),
                "trainLoss": float(metric_history['train_loss'][epoch].value),
                "valAccuracy": float(metric_history['val_acc'][epoch].value),
                "valLoss": float(metric_history['val_loss'][epoch].value),
            })

        return training_history

    # Fetch training history for both current and previous versions
    current_training_history = get_training_history(current_version)
    previous_training_history = get_training_history(previous_version)
    
    # Resource usage (assuming these values are available as tags)
    def parse_resource_value(value):
        """Parse resource values and return a default if not valid."""
        try:
            return int(value)
        except ValueError:
            return 0  # Default value if conversion fails (e.g., 'fulfilled')

    def get_resources(version):
        resources = {
            "cpu": parse_resource_value(version.tags.get('cpu', '0')),
            "gpu": parse_resource_value(version.tags.get('gpu', '0')),
            "memory": parse_resource_value(version.tags.get('memory', '0')),
            "disk": parse_resource_value(version.tags.get('disk', '0'))
        }
        return resources

    current_resources = get_resources(current_version)
    previous_resources = get_resources(previous_version)

    # Compile final response with both versions' data
    response = {
        "currentVersion": {
            "version": current_version.version + ".0",
            "status": current_status,
            "metrics": current_metrics,
            "trainingTime": current_version.tags.get('training_time', 'Unknown'),
            "epochs": len(current_training_history),
            "batchSize": int(current_version.tags.get('batch_size', 32)),
            "learningRate": float(current_version.tags.get('learning_rate', 0.001)),
            "optimizer": current_version.tags.get('optimizer', 'Adam'),
            "lossFunction": current_version.tags.get('loss_function', 'MSE'),
            "trainingHistory": current_training_history,
            "resources": current_resources
        },
        "previousVersion": {
            "version": previous_version.version + ".0",
            "status": previous_status,
            "metrics": previous_metrics,
            "trainingTime": previous_version.tags.get('training_time', 'Unknown'),
            "epochs": len(previous_training_history),
            "batchSize": int(previous_version.tags.get('batch_size', 32)),
            "learningRate": float(previous_version.tags.get('learning_rate', 0.001)),
            "optimizer": previous_version.tags.get('optimizer', 'Adam'),
            "lossFunction": previous_version.tags.get('loss_function', 'MSE'),
            "trainingHistory": previous_training_history,
            "resources": previous_resources
        }
    }

    return response


def get_all_model_versions_info(model_name: str) -> Dict[str, Any]:
    client = MlflowClient()

    # Fetch and sort model versions
    versions = client.search_model_versions(f"name='{model_name}'")
    versions = sorted(versions, key=lambda v: tuple(map(int, v.version.split('.'))))

    model_status_mapping = {
        "Production": "deployed", 
        "Staging": "training", 
        "Archived": "failed", 
        "Uploaded": "ready",
        "Deployed": "deployed",
        "None": "ready",
        "READY": "ready"
    }

    def parse_resource_value(value):
        try:
            return int(value)
        except ValueError:
            return 0

    def get_training_history(version):
        metric_keys = ['train_acc', 'train_loss', 'val_acc', 'val_loss']
        metric_history = {}
        for metric_key in metric_keys:
            try:
                metric_history[metric_key] = client.get_metric_history(version.run_id, metric_key)
            except:
                metric_history[metric_key] = []

        training_history = []
        epochs = len(metric_history['train_acc'])

        for epoch in range(epochs):
            training_history.append({
                "epoch": epoch + 1,
                "trainAccuracy": float(metric_history['train_acc'][epoch].value),
                "trainLoss": float(metric_history['train_loss'][epoch].value),
                "valAccuracy": float(metric_history['val_acc'][epoch].value),
                "valLoss": float(metric_history['val_loss'][epoch].value),
            })

        return training_history

    def get_version_info(version):
        raw_status = version.tags.get("status", "unknown")
        custom_status = model_status_mapping.get(raw_status, raw_status)

        training_history = get_training_history(version)

        metrics = {
            "accuracy": float(version.tags.get('accuracy', 0.0)),
            "precision": float(version.tags.get('precision', 0.0)),
            "recall": float(version.tags.get('recall', 0.0)),
            "f1Score": float(version.tags.get('f1Score', 0.0)),
            "auc": float(version.tags.get('auc', 0.0)),
            "latency": 45,
            "throughput": 120,
            "truePositives": int(version.tags.get('truePositives', 0)),
            "falsePositives": int(version.tags.get('falsePositives', 0)),
            "falseNegatives": int(version.tags.get('falseNegatives', 0)),
            "trueNegatives": int(version.tags.get('trueNegatives', 0)),
            "specificity": float(version.tags.get('specificity', 0.0)),
            "mcc": float(version.tags.get('mcc', 0.0)),
            "kappa": float(version.tags.get('kappa', 0.0))
        }

        resources = {
            "cpu": parse_resource_value(version.tags.get('cpu', '0')),
            "gpu": parse_resource_value(version.tags.get('gpu', '0')),
            "memory": parse_resource_value(version.tags.get('memory', '0')),
            "disk": parse_resource_value(version.tags.get('disk', '0'))
        }

        return {
            "version": f"{version.version}.0",
            "status": custom_status,
            "metrics": metrics,
            "trainingTime": version.tags.get('training_time', 'Unknown'),
            "epochs": len(training_history),
            "batchSize": int(version.tags.get('batch_size', 32)),
            "learningRate": float(version.tags.get('learning_rate', 0.001)),
            "optimizer": version.tags.get('optimizer', 'Adam'),
            "lossFunction": version.tags.get('loss_function', 'MSE'),
            "trainingHistory": training_history,
            "resources": resources
        }

    # Build response dictionary
    response = {}
    for version in versions:
        key = f"version {version.version}.0"
        response[key] = get_version_info(version)

    return response




def get_model_deploy_info(model_name: str) -> List[Dict[str, Any]]:
    """
    Fetches deployment info from YAML metadata file of the latest model version.
    """
    client = MlflowClient()

    # Lấy phiên bản mới nhất
    model_versions = client.search_model_versions(f"name='{model_name}'")
    if not model_versions:
        raise ValueError(f"No model versions found for model '{model_name}'")

    latest_version = max(model_versions, key=lambda v: int(v.version))
    model_apply_name=latest_version.tags.get("model_name", "Unknown")
    run_id = latest_version.run_id
    run_info = client.get_run(run_id)
    run_name = run_info.info.run_name

    # Đường dẫn file YAML
    yaml_path = os.path.join(
        MODEL_STORAGE_PATH,
        "timeseries",
        run_name,
        f"{model_apply_name}.yaml"
    )

    if not os.path.exists(yaml_path):
        raise FileNotFoundError(f"Metadata YAML not found at: {yaml_path}")

    with open(yaml_path, "r", encoding="utf-8") as f:
        metadata = yaml.safe_load(f)

    if "deploy" not in metadata:
        return []  # Không có thông tin deploy

    deploy_info = metadata["deploy"]

    return [deploy_info]


def get_latest_model_details() -> Dict[str, Dict[str, Any]]:
    client = MlflowClient()
    latest_model_details = {}

    # Lấy danh sách tất cả các mô hình được đăng ký
    registered_models = client.search_registered_models()

    for model in registered_models:
        model_name = model.name

        # Lấy danh sách các phiên bản của mô hình này
        versions = client.search_model_versions(f"name='{model_name}'")

        # Chọn phiên bản mới nhất (dựa trên số phiên bản)
        latest_version = max(versions, key=lambda v: int(v.version))

        # Lấy ID của lần chạy (run_id) liên quan đến phiên bản mới nhất
        run_id = latest_version.run_id

        # Lấy danh sách các metrics trong lần chạy đó
        metric_keys = ['train_acc', 'train_loss', 'val_acc', 'val_loss']
        metric_history = {key: client.get_metric_history(run_id, key) for key in metric_keys}

        # Xử lý dữ liệu thành dạng hợp lệ
        training_history = []
        num_epochs = len(metric_history['train_acc']) if metric_history['train_acc'] else 0  # Kiểm tra số epoch
        
        for epoch in range(num_epochs):
            training_history.append({
                "epoch": epoch + 1,
                "trainAccuracy": float(metric_history['train_acc'][epoch].value),
                "trainLoss": float(metric_history['train_loss'][epoch].value),
                "valAccuracy": float(metric_history['val_acc'][epoch].value),
                "valLoss": float(metric_history['val_loss'][epoch].value),
            })

        # Tạo danh sách epoch
        epochs = [f"Epoch {i+1}" for i in range(num_epochs)]

        # Chỉ lấy metrics có dữ liệu thực tế
        metrics_data = {
            "trainAccuracy": [item["trainAccuracy"] for item in training_history],
            "trainLoss": [item["trainLoss"] for item in training_history],
            "valAccuracy": [item["valAccuracy"] for item in training_history],
            "valLoss": [item["valLoss"] for item in training_history]
        }

        # Lưu vào kết quả cuối cùng
        latest_model_details[model_name] = {
            "metrics": metrics_data,
            "epochs": epochs
        }

    return latest_model_details


import shutil
# Define the model storage path
MODEL_STORAGE_PATH = os.getenv("MODEL_STORAGE_PATH", "/home/ariya/central_storage/models/")
DVC_DATA_STORAGE = os.getenv("DVC_DATA_STORAGE", "/home/ariya/central_storage/datasets/")

def register_model(model_name: str, model_description: str, framework: str, dataset: str,
                   model_file: UploadFile, image_file: UploadFile, author: str) -> dict:
    """
    Registers a model with MLflow, stores it in a specified directory, and adds metadata.
    The model and image files are uploaded via the API and saved to the server.
    """
    try:
        # Ensure the model storage directory exists
        if not os.path.exists(MODEL_STORAGE_PATH):
            os.makedirs(MODEL_STORAGE_PATH)
            
        if not os.path.exists(DVC_DATA_STORAGE):
            os.makedirs(DVC_DATA_STORAGE)

        # Create a directory with the name of the model file (without extension)
        model_dir = os.path.join(MODEL_STORAGE_PATH, model_name)
        if not os.path.exists(model_dir):
            os.makedirs(model_dir)

        # Save the model file to the created directory
        model_file_path = os.path.join(model_dir, model_file.filename)
        with open(model_file_path, "wb") as model_out:
            shutil.copyfileobj(model_file.file, model_out)

        # # Create a directory for the image with the name of the image file (without extension)
        # image_dir = os.path.join(DVC_DATA_STORAGE, image_file.filename.split('.')[0])
        # if not os.path.exists(image_dir):
        #     os.makedirs(image_dir)
        
        # # Save the image file to the created directory
        thumbail_file_path = os.path.join(model_dir, image_file.filename)
        with open(thumbail_file_path, "wb") as image_out:
            shutil.copyfileobj(image_file.file, image_out)

        # Start a new MLflow client session and create a new run
        client = MlflowClient()
        
         # Check if the experiment already exists
        experiment_name = f"Experiment for model {model_name}"  # Give your experiment a unique name
        experiment = client.get_experiment_by_name(experiment_name)

        if experiment is None:
            # Create the experiment if it doesn't exist
            experiment_id = client.create_experiment(experiment_name)
        else:
            experiment_id = experiment.experiment_id  # Access the experiment_id correctly
        
        # Start a new MLflow run to register the model (since it's not part of any existing run)
        with mlflow.start_run(experiment_id=experiment_id) as run:
            # Log the model to this run
            mlflow.log_artifact(model_file_path, "model")
            mlflow.log_artifact(thumbail_file_path, "thum_image")

            # Register the model in MLflow (using the current run)
            model_uri = f"runs:/{run.info.run_id}/model/{model_file.filename}"
            model_info = mlflow.register_model(model_uri=model_uri, name=model_name)

            # Add necessary tags to the model
            client.set_registered_model_tag(model_info.name, "description", model_description)
            
            # Create the tags dictionary with additional information for the model version
            tags = {
                "model_name": model_name,
                "model_type": model_name,
                "description": model_description,
                "framework": framework,  # Assuming you're using TensorFlow, adjust accordingly
                "author": author,
                "status": "Staging",
                "accuracy": 0,
                "dataset_name": dataset,
                "dataset_size": "Unknown",
                "dataset_split": "Unknown",
                "epochs": 0,
                "learning_rate": 0,
                "training_time": 0,
                "final_loss": 0,
                "model_storage_path": model_file_path,
                "thumbail_storage_path": thumbail_file_path,
                "createdAt": datetime.now().strftime('%Y-%m-%d'),
                "updatedAt": datetime.now().strftime('%Y-%m-%d'),
            }

            # Set the tags for the model version
            for key, value in tags.items():
                client.set_model_version_tag(model_info.name, model_info.version, key, value)
                
            client.update_model_version(name=model_info.name ,version=model_info.version, description=model_description)
            
             # Add tags to the experiment run
            tags_exp_run = {
                "model_type": model_name,
                "framework": framework,  # Assuming you're using TensorFlow, adjust accordingly
                "status": "Uploaded",
                "accuracy": 0,
                "dataset": dataset,
                "epochs": 0,
                "learning_rate": 0,
                "training_time": 0,
                "final_loss": 0,
                "createdAt": datetime.now().strftime('%Y-%m-%d'),
                "updatedAt": datetime.now().strftime('%Y-%m-%d'),
            }
            
            # Add tags to the run (specific to this run)
            for key, value in tags_exp_run.items():
                client.set_tag(run.info.run_id, key, value)
            

        return {"status": "success", "message": f"Model '{model_name}' registered successfully"}

    except Exception as e:
        return {"status": "error", "message": str(e)}