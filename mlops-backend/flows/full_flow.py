from prefect import flow
from typing import Dict, Any
from flows.data_flow import data_flow  # Import data flow module
from flows.train_flow import train_flow  # Import train flow module
from flows.eval_flow import eval_flow  # Import eval flow module
from flows.deploy_flow import deploy_flow  # Import deploy flow module

@flow(name='MLOps-Pipeline')
def full_flow(cfg: Dict[str, Any]):
    # Extract pipeline configuration values from the provided config
    pipeline_cfg = cfg["pipeline"]
    data_pl_action = pipeline_cfg["data_flow"]  # Action to execute the data pipeline (1 = run, 0 = skip)
    train_pl_action = pipeline_cfg["train_flow"]  # Action to execute the training pipeline (1 = run, 0 = skip)
    eval_pl_action = pipeline_cfg["eval_flow"]  # Action to execute the evaluation pipeline (1 = run, 0 = skip)
    deploy_pl_action = pipeline_cfg["deploy_flow"]  # Action to execute the deployment pipeline (1 = run, 0 = skip)
    
    # If data pipeline is selected (data_pl_action == 1), get the data type and dataset name
    if data_pl_action == 1:
        data_type, dataset_name = data_flow(cfg)
    else:
        # If data pipeline is not selected, use the provided dataset name and data type
        dataset_name = cfg["dataset"]["ds_name"]
        data_type = cfg["data_type"]
        
    # Extract model configuration based on the data type ('timeseries' or 'image')
    model_name = cfg["model"].get(data_type, {}).get("model_name", None)
    model_type = cfg["model"].get(data_type, {}).get("model_type", None)
    model_version = cfg["model"].get(data_type, {}).get("model_version", None)

    # Case 1: Full pipeline: data -> train -> eval -> deploy
    if data_pl_action == 1 and train_pl_action == 1 and eval_pl_action == 1 and deploy_pl_action == 1:
        model_name, model_type, model_version = train_flow(cfg, data_type, dataset_name)
        eval_flow(cfg, data_type, dataset_name, model_name, model_type, model_version)
        deploy_flow(model_name, model_type, model_version, data_type )

    # Case 2: Selected pipeline: data -> train -> deploy (Skip eval)
    elif data_pl_action == 1 and train_pl_action == 1 and eval_pl_action == 0 and deploy_pl_action == 1:
        model_name, model_type, model_version = train_flow(cfg, data_type, dataset_name)
        deploy_flow(model_name, model_type, model_version, data_type)

    # Case 3: Selected pipeline: data -> train (No eval, No deploy)
    elif data_pl_action == 1 and train_pl_action == 1 and eval_pl_action == 0 and deploy_pl_action == 0:
        train_flow(cfg, data_type, dataset_name)

    # Case 4: Selected pipeline: data -> eval (No train, No deploy)
    elif data_pl_action == 1 and train_pl_action == 0 and eval_pl_action == 1 and deploy_pl_action == 0:
        model_name, model_type, model_version = eval_flow(cfg, data_type, dataset_name, model_name, model_type, model_version)

    # Case 5: Selected pipeline: data -> eval -> deploy (Skip train)
    elif data_pl_action == 1 and train_pl_action == 0 and eval_pl_action == 1 and deploy_pl_action == 1:
        model_name, model_type, model_version = eval_flow(cfg, data_type, dataset_name, model_name, model_type, model_version)
        deploy_flow(model_name, model_type, model_version, data_type)
        
    # Case 6: Selected pipeline: train -> eval -> deploy (Skip data)
    elif data_pl_action == 0 and train_pl_action == 1 and eval_pl_action == 1 and deploy_pl_action == 1:
        model_name, model_type, model_version = train_flow(cfg, data_type, dataset_name)
        eval_flow(cfg, data_type, dataset_name, model_name, model_type, model_version)
        deploy_flow(model_name, model_type, model_version, data_type)
        
    # Case 7: Selected pipeline: train -> eval (Skip data and eval)
    elif data_pl_action == 0 and train_pl_action == 1 and eval_pl_action == 1 and deploy_pl_action == 0:
        model_name, model_type, model_version = train_flow(cfg, data_type, dataset_name)
        eval_flow(cfg, data_type, dataset_name, model_name, model_type, model_version)

    # Case 8: Selected pipeline: train -> deploy (Skip eval and data)
    elif data_pl_action == 0 and train_pl_action == 1 and eval_pl_action == 0 and deploy_pl_action == 1:
        model_name, model_type, model_version = train_flow(cfg, data_type, dataset_name)
        deploy_flow(model_name, model_type, model_version, data_type)

    # Case 9: Selected pipeline: train only (No data, No eval, No deploy)
    elif data_pl_action == 0 and train_pl_action == 1 and eval_pl_action == 0 and deploy_pl_action == 0:
        train_flow(cfg, data_type, dataset_name)

    # Case 10: Selected pipeline: eval only (No data, No train, No deploy)
    elif data_pl_action == 0 and train_pl_action == 0 and eval_pl_action == 1 and deploy_pl_action == 0:
        eval_flow(cfg, data_type, dataset_name, model_name, model_type, model_version)

    # Case 11: Selected pipeline: deploy only (No data, No train, No eval)
    elif data_pl_action == 0 and train_pl_action == 0 and eval_pl_action == 0 and deploy_pl_action == 1:
        deploy_flow(model_name, model_type, model_version, data_type)

# Entry point to start the full pipeline flow
def start(cfg):
    full_flow(cfg)
