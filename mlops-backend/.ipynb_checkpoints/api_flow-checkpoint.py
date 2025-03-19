from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import subprocess

app = FastAPI()

class FlowConfig(BaseModel):
    model_type: str
    epochs: int

def run_full_flow(model_type: str, epochs: int):
    try:
        # Run the command in the background
        subprocess.run(
            [
                "bash", "-c", 
                f"cd ~/workspace/ && "
                f"source /opt/anaconda3/bin/activate computer-viz-dl && "
                f"python /home/ariya/workspace/run_flow.py --config configs/full_flow_config.yaml --model_type {model_type} --epochs {epochs}"
            ],
            text=True,
            capture_output=True,
            check=True
        )
    except subprocess.CalledProcessError as e:
        # Log the error here if necessary
        pass
    
def run_train_flow(model_type: str, epochs: int):
    try:
        # Run the command in the background
        subprocess.run(
            [
                "bash", "-c", 
                f"cd ~/workspace/ && "
                f"source /opt/anaconda3/bin/activate computer-viz-dl && "
                f"python /home/ariya/workspace/run_flow.py --config configs/train_flow_config.yaml --model_type {model_type} --epochs {epochs}"
            ],
            text=True,
            capture_output=True,
            check=True
        )
    except subprocess.CalledProcessError as e:
        # Log the error here if necessary
        pass
    
def run_eval_flow():
    try:
        # Run the command in the background
        subprocess.run(
            [
                "bash", "-c", 
                f"cd ~/workspace/ && "
                f"source /opt/anaconda3/bin/activate computer-viz-dl && "
                f"python /home/ariya/workspace/run_flow.py --config configs/eval_flow_config.yaml"
            ],
            text=True,
            capture_output=True,
            check=True
        )
    except subprocess.CalledProcessError as e:
        # Log the error here if necessary
        pass
    
def run_data_flow():
    try:
        # Run the command in the background
        subprocess.run(
            [
                "bash", "-c", 
                f"cd ~/workspace/ && "
                f"source /opt/anaconda3/bin/activate computer-viz-dl && "
                f"python /home/ariya/workspace/run_flow.py --config configs/data_flow_config.yaml"
            ],
            text=True,
            capture_output=True,
            check=True
        )
    except subprocess.CalledProcessError as e:
        # Log the error here if necessary
        pass
    
def run_deploy_flow():
    try:
        # Run the command in the background
        subprocess.run(
            [
                "bash", "-c", 
                f"cd ~/workspace/ && "
                f"source /opt/anaconda3/bin/activate computer-viz-dl && "
                f"python /home/ariya/workspace/run_flow.py --config configs/deploy_flow_config.yaml"
            ],
            text=True,
            capture_output=True,
            check=True
        )
    except subprocess.CalledProcessError as e:
        # Log the error here if necessary
        pass

@app.post("/run_flow/{flow_type}")
async def run_flow(config: FlowConfig, background_tasks: BackgroundTasks, flow_type: str):
    if flow_type=="full_flow":
        background_tasks.add_task(run_full_flow, config.model_type, config.epochs)
    elif flow_type=="train_flow":
        background_tasks.add_task(run_train_flow, config.model_type, config.epochs)
    elif flow_type=="eval_flow":
        background_tasks.add_task(run_eval_flow)
    elif flow_type=="data_flow":
        background_tasks.add_task(run_data_flow)
    elif flow_type=="deploy_flow":
        background_tasks.add_task(run_deploy_flow)
    # Return an immediate response
    return {"status": "started", "message": "Run_flow is running in the background"}


    

# @app.post("/train_flow")
# async def train_flow(config: FlowConfig, background_tasks: BackgroundTasks):
#     background_tasks.add_task(run_train_flow, config.model_type, config.epochs)
#     # Return an immediate response
#     return {"status": "started", "message": "Run_flow is running in the background"}

# @app.post("/eval_flow")
# async def eval_flow(background_tasks: BackgroundTasks):
#     background_tasks.add_task(run_eval_flow)
#     # Return an immediate response
#     return {"status": "started", "message": "Run_flow is running in the background"}

@app.get("/run_flow_check")
def read_root():
    return {"message": "FastAPI server is running"}
