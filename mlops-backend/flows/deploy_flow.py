import os
import yaml
from datetime import datetime
import pytz 
from flows.utils import create_logs_file
from prefect import flow, get_run_logger, context
from tasks.timeseries.deploy.deploy import (
    put_model_to_service,
    validate_model_metadata,
    check_service_health,
    backup_existing_model,
    rollback_model,
    log_model_details
)
from mlflow.tracking import MlflowClient

# Get Prefect work pool information from environment variables
PREFECT_MONITOR_WORK_POOL = os.getenv('PREFECT_MONITOR_WORK_POOL', 'production-model-pool')
MODEL_STORAGE_PATH = os.getenv("MODEL_STORAGE_PATH", "/home/ariya/central_storage/models/")

@flow(name='deploy_flow')
def deploy_flow(model_name: str, model_type: str, model_version: int, data_type: str, metadata_file_path: str):
    """
    Deployment flow for the model.
    Includes validation, backup, deployment, rollback, and logging.
    """
    flow_run_id = context.get_run_context().flow_run.id
    log_file_path = create_logs_file(flow_run_id, flow_type="deploy_flow")
    
    logger = get_run_logger()
    logger.info("🚀 Starting deploy flow...")
    logger.info(f"📄 Log file saved to: {log_file_path}")
    
    client = MlflowClient()
    
    model_name_with_suffix = f'{model_name}_model'

    # 🔍 Check if model is registered
    registered_models = client.search_registered_models()
    model_found = any(model.name == model_name_with_suffix for model in registered_models)
    if not model_found:
        raise ValueError(f"🚨 Model '{model_name_with_suffix}' not found in registered models!")

    # 📦 Get model version
    model_versions = client.search_model_versions(f"name = '{model_name_with_suffix}'")
    if model_version == 0:
        if not model_versions:
            raise ValueError(f"🚨 No versions found for model '{model_name_with_suffix}'!")
        selected_version = max(model_versions, key=lambda v: int(v.version))
    else:
        selected_version = next((v for v in model_versions if int(v.version) == model_version), None)

    if selected_version is None:
        raise ValueError(f"🚨 Model version {model_version} not found for model '{model_type}'!")

    run_id = selected_version.run_id
    run_info = client.get_run(run_id)
    run_name = run_info.info.run_name

    model_source = os.path.join(MODEL_STORAGE_PATH, data_type, run_name)
    if not os.path.exists(model_source):
        raise FileNotFoundError(f"🚨 Model not found at {model_source}")

    logger.info(f"✅ Selected model source path: {model_source}")
    
    model_metadata_file_name = f"{model_name}.yaml"

    try:
        # ✅ Step 1: Validate or restore metadata
        validated_metadata_file, validated_metadata_file_path = validate_model_metadata(model_metadata_file_name, run_name)
    except FileNotFoundError:
        logger.error("🚨 No metadata file or backup available. Deployment aborted.")
        return

    # ✅ Step 2: Check service
    check_service_health(service_host="nginx", service_port="90")

    # ✅ Step 3: Log model details
    log_model_details(validated_metadata_file, run_name)

    # ✅ Step 4: Backup current model
    backup_file = backup_existing_model(validated_metadata_file, run_name)

    # ✅ Step 5: Deploy
    try:
        deploy_endpoint = put_model_to_service(validated_metadata_file, run_name)
        logger.info(f"✅ Deployment successful to {deploy_endpoint}")

        # ✅ Step 6: Update metadata YAML with deploy info
        with open(validated_metadata_file_path, "r") as f:
            metadata = yaml.safe_load(f)

        seoul_time = datetime.now(pytz.timezone('Asia/Seoul')).isoformat()

        metadata["deploy"] = {
            "id": "endpoint-1",
            "name": "프로덕션 엔드포인트",
            "status": "running",
            "url": deploy_endpoint,
            "version": str(model_version),
            "createdAt": seoul_time,
            "resources": {
                "instanceType": "gpu",
                "autoScaling": True,
                "minInstances": 1,
                "maxInstances": 3,
                "memoryLimit": 4096,
                "timeout": 30
            },
            "metrics": {
                "requestsPerMinute": 250,
                "averageLatency": 45,
                "errorRate": 0.2,
                "successRate": 99.8
            }
        }

        # 🔥 Đảm bảo sử dụng đúng path
        with open(validated_metadata_file_path, "w") as f:
            yaml.dump(metadata, f, allow_unicode=True)

        logger.info("📝 Metadata YAML updated with deploy info (Seoul time).")

    except Exception as e:
        logger.error(f"❌ Deployment failed: {e}, rolling back to backup...")
        rollback_model(backup_file)

    logger.info(f"🎯 Deployment flow completed. Monitoring in work pool: {PREFECT_MONITOR_WORK_POOL}")


def start(cfg):
    model_cfg = cfg['model']
    data_type=cfg['data_type']
    deploy_flow(model_cfg['model_name'], model_cfg['model_type'], model_cfg['model_version'], data_type)
