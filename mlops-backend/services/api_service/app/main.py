from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from api.resource_monitoring import periodic_save_stats, get_system_stats_full, get_total_resource_using
from typing import List, Dict
import asyncio
from datetime import datetime

# Import API functions from separate modules
from api.workflow_run import flow_monitoring_data
from api.experiments import (get_all_experiments_info, get_lastest_experiment_info, get_experiment_and_run_info, 
                            get_experiment_and_all_run_info, get_experiment_create_options, experiment_create_and_run, get_lastest_experiment_log)
from api.models import (get_all_registered_models_info, get_model_register_options, get_model_detailed_info_by_id, 
                        create_model_registration, get_all_registered_models_performance, get_model_deploy_info_by_id,
                        get_model_version_compare_by_id, get_all_model_version_by_id)
from api.datasets_dvc import get_all_datasets_info, get_dataset_detail_info, dataset_create_and_run, get_versions_info_from_dataset, get_dataset_detail_client

from api.pipelines import (
    get_workflows, get_connections, add_workflow_node, add_workflow_edge,
    update_workflow_node, delete_workflow_node, delete_workflow_edge, run_pipeline, check_flow_status
)
# Create FastAPI app instance
app = FastAPI()

# Configuring CORS (Cross-Origin Resource Sharing) settings to allow frontend connections
LOCAL_MACHINE_HOST = "192.168.219.52"  # You can change this IP as needed
origins = [
    f"http://{LOCAL_MACHINE_HOST}:4243",  # URL of frontend application
    "http://127.0.0.1:4243",  # Localhost URL
    "http://localhost:3000",
    f"http://{LOCAL_MACHINE_HOST}:8686",
    "http://192.168.219.30:3000",
    "http://192.168.219.40:3000",
    "http://192.168.219.50:3000",
    "http://192.168.219.52:3000",
    "http://192.168.219.48:3000"# Another local URL
]

# Adding CORS middleware to handle cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow specific origins
    allow_credentials=True,  # Allow credentials such as cookies
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


# =========================Resource Monitoring========================

# Start the background task to save system stats periodically
@app.on_event("startup")
async def start_periodic_task():
    asyncio.create_task(periodic_save_stats())

app.add_api_route("/api/resource-monitoring/dashboard", get_system_stats_full, methods=["GET"], tags=["Resource Monitoring"])
app.add_api_route("/api/resource-monitoring/total", get_total_resource_using, methods=["GET"], tags=["Resource Monitoring"])



# =========================Prefect FLow Monitoring=========================

# API to fetch real-time flow monitoring data (Prefect flow monitoring)
app.add_api_route("/api/flow-monitoring-data", flow_monitoring_data, methods=["GET"], tags=["Monitoring Prefect Flows"])



# =========================MLFLOW EXPERIMENT=========================

# API to get all experiments from MLflow
app.add_api_route("/api/experiments/", get_all_experiments_info, methods=["GET"], tags=["Experiments"])

# API to get the latest experiment info using the experiment ID
app.add_api_route("/api/experiments/{experiment_id}", get_lastest_experiment_info, methods=["GET"], tags=["Experiments"])

# API to get the latest experiment logs content using the experiment ID
app.add_api_route("/api/logs/experiments/{experiment_id}/", get_lastest_experiment_log, methods=["GET"], tags=["Experiments"])

# API to get all runs for a specific experiment using the experiment ID and run ID
app.add_api_route("/api/experiments/{experiment_id}/{run_id}", get_experiment_and_run_info, methods=["GET"], tags=["Experiments"])

app.add_api_route("/api/runs/{experiment_id}", get_experiment_and_all_run_info, methods=["GET"], tags=["Experiments"])

# API to fetch available options for creating new experiments
app.add_api_route("/api/create/options", get_experiment_create_options, methods=["GET"], tags=["Experiments"])

# API to create a new experiment in MLflow
app.add_api_route("/api/create/experiment", experiment_create_and_run, methods=["POST"], tags=["Experiments"])




# =========================MLFLOW MODEL=========================

# API to get all registered models from MLflow
app.add_api_route("/api/models", get_all_registered_models_info, methods=["GET"], tags=["Model Registration"])

app.add_api_route("/api/models/performance", get_all_registered_models_performance, methods=["GET"], tags=["Model Registration"])

# API to get detailed information of a registered model by its model ID
app.add_api_route("/api/models/detailed/{model_id}", get_model_detailed_info_by_id, methods=["GET"], tags=["Model Registration"])

app.add_api_route("/api/models/create/items", get_model_register_options, methods=["GET"], tags=["Model Registration"])

# API to register a new model in MLflow
app.add_api_route("/api/create/model", create_model_registration, methods=["POST"], tags=["Model Registration"])

# API to get detailed information of a registered model by its model ID
app.add_api_route("/api/models/deploy/{model_id}", get_model_deploy_info_by_id, methods=["GET"], tags=["Model Registration"])

# API to get detailed information of current version and previous version
app.add_api_route("/api/models/versions/{model_id}", get_model_version_compare_by_id, methods=["GET"], tags=["Model Registration"])

# API to get detailed information of current version and previous version
app.add_api_route("/api/models/compare/{model_id}", get_all_model_version_by_id, methods=["GET"], tags=["Model Registration"])


# ========================= API DATASETS =========================

# API lấy danh sách tất cả dataset
app.add_api_route("/api/datasets/", get_all_datasets_info, methods=["GET"], tags=["Datasets"])

app.add_api_route("/api/datasets/{dataset_id}", get_dataset_detail_info, methods=["GET"], tags=["Datasets"])

app.add_api_route("/api/datasets/client/{dataset_id}", get_dataset_detail_client, methods=["GET"], tags=["Datasets"])

app.add_api_route("/api/datasets/versions/{dataset_id}", get_versions_info_from_dataset, methods=["GET"], tags=["Datasets"])

# API to create a new datasets dvc
app.add_api_route("/api/create/dataset", dataset_create_and_run, methods=["POST"], tags=["Datasets"])


# ========================= API PIPELINE =========================
# ✅ Add API Routes
app.add_api_route("/api/workflows", get_workflows, methods=["GET"], tags=["Pipeline Workflows"])
app.add_api_route("/api/workflows/connections", get_connections, methods=["GET"], tags=["Pipeline Workflows"])
app.add_api_route("/api/workflows/add_node", add_workflow_node, methods=["POST"], tags=["Pipeline Workflows"])
app.add_api_route("/api/workflows/add_edge", add_workflow_edge, methods=["POST"], tags=["Pipeline Workflows"])
app.add_api_route("/api/workflows/update_node/{node_id}", update_workflow_node, methods=["PUT"], tags=["Pipeline Workflows"])
app.add_api_route("/api/workflows/delete_node", delete_workflow_node, methods=["DELETE"], tags=["Pipeline Workflows"])
app.add_api_route("/api/workflows/delete_edge", delete_workflow_edge, methods=["DELETE"], tags=["Pipeline Workflows"])

app.add_api_route("/api/workflows/run", run_pipeline, methods=["POST"], tags=["Pipeline Workflows"])
app.add_api_route("/api/workflows/run_status_check", check_flow_status, methods=["GET"], tags=["Pipeline Workflows"])
