from fastapi import FastAPI, HTTPException, BackgroundTasks,  File, UploadFile, Form
from pydantic import BaseModel
from utils import (run_data_flow,run_train_flow,run_eval_flow,run_deploy_flow,run_full_flow)
from fastapi.middleware.cors import CORSMiddleware
import os, time
LOCAL_MACHINE_HOST = os.getenv('LOCAL_MACHINE_HOST','192.168.219.52')

app = FastAPI()

# Config CORS
origins = [
    "http://%s:4243" %LOCAL_MACHINE_HOST,  # URL off frontend (run in 192.168.219.52)
    "http://127.0.0.1:4243",  # URL localhost (IPv4)
    "http://localhost:3000",
    "http://%s:8686" %LOCAL_MACHINE_HOST,
    "http://192.168.219.40:3000",
    
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,  
    allow_methods=["*"],  
    allow_headers=["*"],  
)

from utils.class_base import FlowConfig


#=============================API for run flows in prefect============================
@app.post("/api/run_flow/{flow_type}", tags=["Run Flows"])
async def run_flow(config: FlowConfig, background_tasks: BackgroundTasks, flow_type: str):
    """
    Gracefully creates a new flow from the provided schema.
    If a flow with the same name already exists, the existing flow is returned.
    
    Returns:
        - The created or existing flow object.
    """
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


@app.get("/api/run_flow_api_check", tags=["Run Flows"])
def read_root():
    return {"message": "FastAPI server is running"}



import plotly.express as px
import plotly.io as pio
from utils.prefect_client import fetch_flow_runs, get_flow_runs_dataframe
from datetime import datetime, timedelta
import pytz  # D

@app.get("/api/flow-monitoring-data", tags=["Monitoring Flows"])
async def flow_monitoring_data():
    # Fetch flow runs
    flow_runs = await fetch_flow_runs()
    
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




####=============================MLFLOW EXPERIMENT========================================

from utils.mlflow_utils import get_runs_for_experiment, get_latest_run_for_experiment, get_all_experiments, get_mlflow_and_datasets_info

from typing import List

from utils.class_base import (
    Experiment, Experiment_Lastest, Run, Run_ID,  # 2. MLflow Experiment
    ExperimentOptions,  # 3. Experiment Creation and Options
)


# 전체 실험 목록을 가져오는 API 엔드포인트
@app.get("/api/experiments/", response_model=List[Experiment], tags=["Experiments"])
async def get_all_experiments_info():
    # MLflow에서 모든 실험 정보를 가져옵니다.
    experiment_list = get_all_experiments()
    return experiment_list

# 특정 실험의 정보를 가져오는 API 엔드포인트
@app.get("/api/experiments/{experiment_id}", response_model=Experiment_Lastest, tags=["Experiments"])
async def get_lastest_experiment_info(experiment_id: str):
    # 실험 정보 가져오기
    run_lastest = get_latest_run_for_experiment(experiment_id)
    if not run_lastest:
        return {"error": "Experiment not found"}
    return run_lastest

# 특정 실험과 관련된 런(run)의 정보를 가져오는 API 엔드포인트
@app.get("/api/experiments/{experiment_id}/{run_id}", response_model=List[Run], tags=["Experiments"])
async def get_experiment_and_run_info(experiment_id: str, run_id: str):
    # 실험 정보와 run 정보 가져오기
    run_info = get_runs_for_experiment(experiment_id)
    if not run_info:
        return {"error": "Experiment or Runs not found"}

    # 특정 run_id를 가진 런 필터링
    run_info = [run for run in run_info if run["run_id"] == run_id]
    return run_info

# 특정 실험과 관련된 런(run)의 정보를 가져오는 API 엔드포인트
@app.get("/api/runs/{experiment_id}", response_model=List[Run_ID], tags=["Experiments"])
async def get_experiment_and_all_run_info(experiment_id: str):
    # 실험 정보와 run 정보 가져오기
    run_info = get_runs_for_experiment(experiment_id)
    if not run_info:
        return {"error": "Experiment or Runs not found"}
    return run_info


# Endpoint để lấy thông tin về datasets và models để create experiments
@app.get("/api/create/options", response_model=List[ExperimentOptions], tags=["Experiments"])
async def get_experiment_create_options():
    exp_options = get_mlflow_and_datasets_info()
    return [exp_options]

    
from utils.utils import check_if_flow_running
@app.post("/api/create", tags=["Experiments"])

async def experiment_create_and_run(
    background_tasks: BackgroundTasks,
    name: str = Form(..., example="Timeseries Stock Prediction Training"),
    description: str = Form(..., example="Train a model for stock prediction"),
    dataset: str = Form(..., example="Stock_product_01"),
    model: str = Form(..., example="LSTM"),
    learningRate: float = Form(..., example=0.001),
    batchSize: int = Form(..., example=32),
    epochs: int = Form(..., example=10)):
    
    # Check if any flow is currently running
    if await check_if_flow_running():  # Use await because check_if_flow_running is an asynchronous function
        return {"status": "error", "message": "A flow is already running. Please wait until it completes."}
    else:
        # If no flow is running, start a new flow
        background_tasks.add_task(run_full_flow, name, description, dataset, model, learningRate, batchSize, epochs)
        #wait for task start
        # Kiểm tra trạng thái của task trên Prefect (giả sử sau 3 giây nó bắt đầu)
        for _ in range(5):  # Kiểm tra trong vòng 3 giây
            time.sleep(1)  # Mỗi lần kiểm tra sau 1 giây
            if await check_if_flow_running():
                return {"status": "started", "message": "Run_flow is added and running in the background."}
            else:
                return {"status": "started", "message": "Please wait, flow is adding, not start yet!"}
        
        # Nếu sau 3 giây mà task vẫn chưa bắt đầu chạy, báo lỗi
        return {"status": "error", "message": "Failed to start the task on Prefect."}



####=============================MLFLOW MODELS REGISTER========================================
from utils.mlflow_utils import get_registered_all_models, get_model_details, register_model

from utils.class_base import (
    ModelOptions,  # 5. Model Options for Registration
    ModelInfoAll, ModelInfoDetail,  # 7. Detailed Model Information
)

# API endpoint to get registered models
@app.get("/api/models", response_model=List[ModelInfoAll], tags=["Model Registration"])
async def get_all_registered_models_info():
    models = get_registered_all_models()  # Fetch models from mlflow_ultils.py
    return models


@app.get("/api/models/detailed/{model_id}", response_model=List[ModelInfoDetail], tags=["Model Registration"])
async def get_model_detailed_info_by_id(model_id: int):
    models_all = get_registered_all_models()
    
    # Find model name using the model_id
    model_name = None
    for model in models_all:
        if model['id'] == model_id:
            model_name = model['name']
            break
    
    if not model_name:
        return {"status": "error", "message": "Model ID not found"}
    
    model_detail=get_model_details(model_name, model_id)
    
    return model_detail
    

# Endpoint để lấy thông tin về datasets và models để create experiments
@app.get("/api/models/create/items", response_model=List[ModelOptions], tags=["Model Registration"])
async def get_model_register_options():
    model_options = get_mlflow_and_datasets_info()
    return [model_options]


@app.post("/api/models/create", tags=["Model Registration"])
async def create_model_registration(
    model_name: str = Form(..., example="MNIST Classification"),
    model_description: str = Form(..., example="Image Classification Model"),
    framework: str = Form(..., example="Pytorch"),
    dataset: str = Form(..., example="MNIST"),
    author: str = Form(..., example="4INLAB"),
    model_file: UploadFile = File(...),  # UploadFile to receive the model file
    image_file: UploadFile = File(...),  # UploadFile to receive the image file
):
    """
    API endpoint to register a model with MLflow.
    Receives model details and files, then stores and registers them with MLflow.
    """
    # Call register_model function from mlflow_ultils.py to register the model
    result = register_model(
        model_name=model_name,
        model_description=model_description,
        framework=framework,
        dataset=dataset,
        author=author,
        model_file=model_file,  # Pass the uploaded model file
        image_file=image_file,  # Pass the uploaded image file
    )

    # If registration is successful, return the result
    if result['status'] == 'success':
        return result
    else:
        # If there's an error, raise an HTTP exception with status code 400
        raise HTTPException(status_code=400, detail=result['message'])