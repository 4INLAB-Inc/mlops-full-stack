import subprocess

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