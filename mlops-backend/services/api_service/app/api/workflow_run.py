# app/api/run_flows.py
from fastapi import BackgroundTasks, Form, HTTPException
from utils.class_base import FlowConfig

from prefect.client.orchestration import get_client
from prefect.client.schemas.filters import FlowRunFilter, FlowRunFilterState

import plotly.express as px
import plotly.io as pio
from utils.prefect_client import fetch_latest_flow_runs, get_flow_runs_dataframe
from datetime import datetime, timedelta
import pytz  # D
import subprocess
import logging, shlex

async def flow_monitoring_data():
    # Fetch flow runs
    flow_runs = await fetch_latest_flow_runs(max_flows=200)
    
    # Convert flow runs to DataFrame
    df = get_flow_runs_dataframe(flow_runs)

    # Log debug to check DataFrame content
    print("DEBUG: DataFrame content:\n", df)

    # Prepare data for Plotly chart
    data = []
    unique_flows = df["Flow Name"].unique()  # Get the list of unique flows
    colors = px.colors.qualitative.Plotly  # Use default Plotly colors

    for idx, row in df.iterrows():
        # Add a line for each Flow
        data.append(
            dict(
                type="scatter",
                mode="lines+markers",
                x=[row["Start Time"], row["End Time"]],
                y=[row["Flow Name"], row["Flow Name"]],
                text=[row["Details"], row["Details"]],
                name=row["Flow Name"],
                line=dict(color=colors[idx % len(colors)], width=15),
                marker=dict(size=25),
            )
        )
        # Add a marker at End Time to display the state
        data.append(
            dict(
                type="scatter",
                mode="markers+text",
                x=[row["End Time"]],
                y=[row["Flow Name"]],
                text=[row["State"]],  # Display state at the endpoint
                textposition="middle right",  # Position of the text
                name=f"{row['Flow Name']} (State)",
                marker=dict(color=colors[idx % len(colors)], size=10, symbol="circle"),
                showlegend=False,
            )
        )

    # Find the earliest and latest timestamps from the data
    min_start_time = df["Start Time"].min()
    max_end_time = df["End Time"].max()

    # Define the Asia/Seoul timezone
    seoul_tz = pytz.timezone("Asia/Seoul")
    current_time_seoul = datetime.now(seoul_tz)

    # Calculate 10% of the total time range
    time_range = max_end_time - min_start_time
    buffer_20_percent = time_range * 0.2
    buffer_5_percent = time_range * 0.05

    # Define a fixed time range for the X-axis display
    x_start = min(min_start_time - buffer_5_percent, current_time_seoul)
    x_end = max(max_end_time + buffer_20_percent, current_time_seoul)

    # Configure the layout
    layout = dict(
        title="Real-time Flow Monitoring",
        xaxis=dict(
            title="Time",
            type="date",
            range=[x_start.isoformat(), x_end.isoformat()],
        ),
        yaxis=dict(title="Flow Name"),
        height=800,
        width=1500,
        margin=dict(
            l=250,  # Increase left margin to accommodate long flow names
            r=10,
            t=50,
            b=50,
        ),
    )

    # Return JSON data
    return {"flow_info": flow_runs, "graph": data, "layout": layout}


is_flow_running = False

# Đảm bảo rằng check_if_flow_running là hàm bất đồng bộ
async def check_if_flow_running():
    global is_flow_running
    # Lấy client Prefect
    async with get_client() as client:
        flow_run_filter_1 = FlowRunFilter(state=FlowRunFilterState(type={"any_": ["RUNNING"]}))
        flow_runs = await client.read_flow_runs(flow_run_filter=flow_run_filter_1)
    # Kiểm tra xem có flow nào đang chạy không
    if flow_runs:
        print("A flow is currently running!")
        is_flow_running = True
    else:
        print("No flow is currently running.")
        is_flow_running = False
    return is_flow_running


# Config logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

async def run_flow_cmd(flow_name: str, config_file: str, name: str = None, description: str = None, 
                       data_type:str=None, dataset: str = None, ds_description: str=None, dvc_tag: str=None, file_path:str=None,
                       model_name:str=None,  model: str = None, learningRate: float = None, batchSize: int = None, epochs: int = None, 
                       data_flow: int= None, train_flow: int= None, eval_flow: int= None, deploy_flow: int= None):
    global is_flow_running
    try:
        # Kiểm tra trạng thái của task trước khi bắt đầu
        if await check_if_flow_running():
            logging.error(f"❌ Another flow is already running. Please wait until it completes.")
            return  # Nếu có task đang chạy, không thực thi thêm task mới
        
       # Use shlex.quote to ensure that the string is enclosed in quotes when there are spaces
        name = shlex.quote(name) if name else None
        description = shlex.quote(description) if description else None
        # ds_description = shlex.quote(ds_description) if ds_description else None
        dataset = shlex.quote(dataset) if dataset else None
        model = shlex.quote(model) if model else None

        # Build the command
        command = (
            f"docker exec jupyter bash -c \""
            f"cd /home/ariya/workspace/ && "
            f"source /opt/anaconda3/bin/activate mlops-4inlab && "
            f"python /home/ariya/workspace/run_flow.py --config {config_file}"
        )

        if model:
            command += f" --model_type {model}"
        if model_name:
            command += f" --model_name {model_name}"
        if epochs:
            command += f" --epochs {epochs}"
        if learningRate:
            command += f" --learningRate {learningRate}"
        if batchSize:
            command += f" --batchSize {batchSize}"
            
        if data_type:
            command += f" --data_type {data_type}"
        if dataset:
            command += f" --ds_name {dataset}"
        if ds_description:
            command += f" --ds_description {ds_description}"
        if dvc_tag:
            command += f" --dvc_tag {dvc_tag}"
        if file_path:
            command += f" --file_path {file_path}"
            
            
        if name:
            command += f" --exp_name {name}"  # Ensure name is enclosed in quotes
        if description:
            command += f" --exp_desc {description}"  # Ensure description is enclosed in quotes
            
            
        if data_flow:
            command += f" --data_flow {data_flow}"  
        if train_flow:
            command += f" --train_flow {train_flow}"  
        if eval_flow:
            command += f" --eval_flow {eval_flow}"  
        if deploy_flow:
            command += f" --deploy_flow {deploy_flow}"  
        
        command += "\""
        
        # Run the command
        process = subprocess.run(
            command, shell=True, text=True, capture_output=True, check=True
        )

        # Log the result
        logging.info(f"✅ {flow_name} completed successfully.")
        if process.stdout:
            logging.info(f"STDOUT: {process.stdout.strip()}")
        if process.stderr:
            logging.warning(f"⚠️ STDERR: {process.stderr.strip()}")

    except subprocess.CalledProcessError as e:
        logging.error(f"❌ Error in {flow_name}: {e.stderr.strip()}")



# Define specific flow functions
async def run_selected_flow(name: str = None, description: str = None, 
                       data_type:str=None, dataset: str = None, ds_description: str=None, dvc_tag: str=None, file_path:str=None,
                       model_name:str=None,  model: str = None, learningRate: float = None, batchSize: int = None, epochs: int = None, 
                       data_flow: int= None, train_flow: int= None, eval_flow: int= None, deploy_flow: int= None):
    await run_flow_cmd("full_flow", "configs/full_flow_config.yaml", name, description, 
                       data_type, dataset, ds_description, dvc_tag, file_path,
                       model_name,  model, learningRate, batchSize, epochs, 
                       data_flow, train_flow, eval_flow, deploy_flow)
