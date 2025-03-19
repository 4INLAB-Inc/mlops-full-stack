from fastapi import BackgroundTasks, Form, HTTPException
from utils.mlflow_utils import (
    get_runs_for_experiment, get_latest_run_for_experiment, get_all_experiments, get_mlflow_and_datasets_info
)
from api.workflow_run import run_selected_flow
from utils.class_base import (
    Experiment, Experiment_Lastest, Run, Run_ID,  # Importing the classes
    ExperimentOptions  # For creating experiments
)
from api.workflow_run import check_if_flow_running
import time
from typing import List

# Fetching all experiments and returning them as structured responses
async def get_all_experiments_info() -> List[Experiment]:
    experiment_list = get_all_experiments()
    return [Experiment(**experiment) for experiment in experiment_list]  # Returning as structured Experiment objects

# Fetch the latest experiment information using the experiment ID
async def get_lastest_experiment_info(experiment_id: str) -> Experiment_Lastest:
    run_lastest = get_latest_run_for_experiment(experiment_id)
    if not run_lastest:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return Experiment_Lastest(**run_lastest)  # Return as Experiment_Lastest object

# Fetch information for a specific experiment and run by their IDs
async def get_experiment_and_run_info(experiment_id: str, run_id: str) -> List[Run]:
    run_info = get_runs_for_experiment(experiment_id)
    if not run_info:
        raise HTTPException(status_code=404, detail="Experiment or Runs not found")
    
    # Filter by run_id
    run_info = [run for run in run_info if run["run_id"] == run_id]
    return [Run(**run) for run in run_info]  # Return as a list of Run objects

# Fetch all runs related to an experiment
async def get_experiment_and_all_run_info(experiment_id: str) -> List[Run_ID]:
    run_info = get_runs_for_experiment(experiment_id)
    if not run_info:
        raise HTTPException(status_code=404, detail="Experiment or Runs not found")
    return [Run_ID(**run) for run in run_info]  # Return as list of Run_ID objects

# Fetch datasets and models to create an experiment
async def get_experiment_create_options() -> ExperimentOptions:
    exp_options = get_mlflow_and_datasets_info()
    return exp_options  # Return as a list of ExperimentOptions objects

async def experiment_create_and_run(
    background_tasks: BackgroundTasks,
    name: str = Form(..., example="Timeseries Stock Prediction Training"),
    description: str = Form(..., example="Train a model for stock prediction"),
    dataset: str = Form(..., example="Stock_product_01"),
    model: str = Form(..., example="LSTM"),
    learningRate: float = Form(..., example=0.001),
    batchSize: int = Form(..., example=32),
    epochs: int = Form(..., example=10)
):
    try:
        # Check if any flow is currently running
        if await check_if_flow_running():  # Use await because check_if_flow_running is an asynchronous function
            return {"status": "error", "message": "A flow is already running. Please wait until it completes."}
        else:
            # If no flow is running, start a new flow
            data_type=None
            model_name=None
            ds_description=None
            dvc_tag=None
            file_path=None
            data_flow=1
            train_flow=1
            eval_flow=1
            deploy_flow=1
            background_tasks.add_task(run_selected_flow, name, description, 
            data_type, dataset, ds_description, dvc_tag, file_path,
            model_name, model, learningRate, batchSize, epochs, 
            data_flow, train_flow, eval_flow, deploy_flow)  #Run full pipeline from data_flow to deploy
            
            
            # Wait for task to start
            for _ in range(5):  # Check for 3 seconds
                time.sleep(1)  # Checking every 1 second
                if await check_if_flow_running():
                    return {"status": "started", "message": "Run_flow is added and running in the background."}
                else:
                    return {"status": "started", "message": "Please wait, flow is being added, not started yet!"}
            
            # If the task does not start after 3 seconds, return error
            return {"status": "error", "message": "Failed to start the task on Prefect."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) # Return error in case of any exception
