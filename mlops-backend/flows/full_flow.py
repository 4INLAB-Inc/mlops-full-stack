
from prefect import flow, get_run_logger, context
from typing import Dict, Any
from flows.data_flow import data_flow  # Import data flow module
from flows.train_flow import train_flow  # Import train flow module
from flows.eval_flow import eval_flow  # Import eval flow module
from flows.deploy_flow import deploy_flow  # Import deploy flow module
from flows.utils import create_logs_file

@flow(name='MLOps-Pipeline')
def full_flow(cfg: Dict[str, Any]):
    
    flow_run_id = context.get_run_context().flow_run.id
    log_file_path = create_logs_file(flow_run_id,flow_type="full_flow")
    
    logger = get_run_logger()
    logger.info("Starting MLOps pipeline....")
    logger.info(f"Log file saved to: {log_file_path}")
    
    # Extract pipeline configuration values from the provided config
    pipeline_cfg = cfg["pipeline"]
    data_pl_action = pipeline_cfg["data_flow"]  # Action to execute the data pipeline (1 = run, 0 = skip)
    train_pl_action = pipeline_cfg["train_flow"]  # Action to execute the training pipeline (1 = run, 0 = skip)
    eval_pl_action = pipeline_cfg["eval_flow"]  # Action to execute the evaluation pipeline (1 = run, 0 = skip)
    deploy_pl_action = pipeline_cfg["deploy_flow"]  # Action to execute the deployment pipeline (1 = run, 0 = skip)

    # If data pipeline is selected (data_pl_action == 1), get the data type and dataset name
    if data_pl_action == 1:
        data_type, dataset_name = data_flow(cfg)
        logger.info("Data pipeline executed. Data type: %s, Dataset name: %s", data_type, dataset_name)
    else:
        # If data pipeline is not selected, use the provided dataset name and data type
        dataset_name = cfg["dataset"]["ds_name"]
        data_type = cfg["data_type"]
        
    # Extract model configuration based on the data type ('timeseries' or 'image')
    model_name = cfg["model"].get(data_type, {}).get("model_name", None)
    model_type = cfg["model"].get(data_type, {}).get("model_type", None)
    model_version = cfg["deploy"]["model_version"]
    metadata_file_path=cfg["deploy"]["model_metadata_file_path"]

    # Case 1: Full pipeline: data -> train -> eval -> deploy
    if data_pl_action == 1 and train_pl_action == 1 and eval_pl_action == 1 and deploy_pl_action == 1:
        logger.info("Running full pipeline (data -> train -> eval -> deploy).")
        model_name, model_type, model_version, metadata_file_path = train_flow(cfg, data_type, dataset_name)
        eval_flow(cfg, data_type, dataset_name, model_name, model_type, model_version)
        deploy_flow(model_name, model_type, model_version, data_type, metadata_file_path)
        
    # Case 1: Full pipeline: data -> train -> eval
    if data_pl_action == 1 and train_pl_action == 1 and eval_pl_action == 1 and deploy_pl_action == 0:
        logger.info("Running full pipeline (data -> train -> eval).")
        model_name, model_type, model_version, metadata_file_path = train_flow(cfg, data_type, dataset_name)
        eval_flow(cfg, data_type, dataset_name, model_name, model_type, model_version)

    # Case 2: Selected pipeline: data -> train -> deploy (Skip eval)
    elif data_pl_action == 1 and train_pl_action == 1 and eval_pl_action == 0 and deploy_pl_action == 1:
        logger.info("Running pipeline (data -> train -> deploy).")
        model_name, model_type, model_version, metadata_file_path = train_flow(cfg, data_type, dataset_name)
        deploy_flow(model_name, model_type, model_version, data_type, metadata_file_path)

    # Case 3: Selected pipeline: data -> train (No eval, No deploy)
    elif data_pl_action == 1 and train_pl_action == 1 and eval_pl_action == 0 and deploy_pl_action == 0:
        logger.info("Running pipeline (data -> train).")
        train_flow(cfg, data_type, dataset_name)

    # Case 4: Selected pipeline: data -> eval (No train, No deploy)
    elif data_pl_action == 1 and train_pl_action == 0 and eval_pl_action == 1 and deploy_pl_action == 0:
        logger.info("Running pipeline (data -> eval).")
        model_name, model_type, model_version = eval_flow(cfg, data_type, dataset_name, model_name, model_type, model_version)

    # Case 5: Selected pipeline: data -> eval -> deploy (Skip train)
    elif data_pl_action == 1 and train_pl_action == 0 and eval_pl_action == 1 and deploy_pl_action == 1:
        logger.info("Running pipeline (data -> eval -> deploy).")
        model_name, model_type, model_version = eval_flow(cfg, data_type, dataset_name, model_name, model_type, model_version)
        deploy_flow(model_name, model_type, model_version, data_type, metadata_file_path)
        
    # Case 6: Selected pipeline: train -> eval -> deploy (Skip data)
    elif data_pl_action == 0 and train_pl_action == 1 and eval_pl_action == 1 and deploy_pl_action == 1:
        logger.info("Running pipeline (train -> eval -> deploy).")
        model_name, model_type, model_version, metadata_file_path = train_flow(cfg, data_type, dataset_name)
        eval_flow(cfg, data_type, dataset_name, model_name, model_type, model_version)
        deploy_flow(model_name, model_type, model_version, data_type, metadata_file_path)
        
    # Case 7: Selected pipeline: train -> eval (Skip data and eval)
    elif data_pl_action == 0 and train_pl_action == 1 and eval_pl_action == 1 and deploy_pl_action == 0:
        logger.info("Running pipeline (train -> eval).")
        model_name, model_type, model_version, metadata_file_path = train_flow(cfg, data_type, dataset_name)
        eval_flow(cfg, data_type, dataset_name, model_name, model_type, model_version)

    # Case 8: Selected pipeline: train -> deploy (Skip eval and data)
    elif data_pl_action == 0 and train_pl_action == 1 and eval_pl_action == 0 and deploy_pl_action == 1:
        logger.info("Running pipeline (train -> deploy).")
        model_name, model_type, model_version, metadata_file_path = train_flow(cfg, data_type, dataset_name)
        deploy_flow(model_name, model_type, model_version, data_type, metadata_file_path)

    # Case 9: Selected pipeline: train only (No data, No eval, No deploy)
    elif data_pl_action == 0 and train_pl_action == 1 and eval_pl_action == 0 and deploy_pl_action == 0:
        logger.info("Running pipeline (train).")
        train_flow(cfg, data_type, dataset_name)

    # Case 10: Selected pipeline: eval only (No data, No train, No deploy)
    elif data_pl_action == 0 and train_pl_action == 0 and eval_pl_action == 1 and deploy_pl_action == 0:
        logger.info("Running pipeline (eval).")
        eval_flow(cfg, data_type, dataset_name, model_name, model_type, model_version)

    # Case 11: Selected pipeline: deploy only (No data, No train, No eval)
    elif data_pl_action == 0 and train_pl_action == 0 and eval_pl_action == 0 and deploy_pl_action == 1:
        logger.info("Running pipeline (deploy).")
        logger.info(f"Model name before deploy: {model_name}")
        deploy_flow(model_name, model_type, model_version, data_type, metadata_file_path)

# Entry point to start the full pipeline flow
def start(cfg):
    full_flow(cfg)
