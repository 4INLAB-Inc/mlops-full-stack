import yaml
import json
import argparse
from importlib import import_module
import sys

def load_config(file_path):
    """
    Load configuration from a YAML or JSON file.
    """
    try:
        with open(file_path, 'r') as f:
            if file_path.endswith(('.yml', '.yaml')):
                return yaml.safe_load(f)
            elif file_path.endswith('.json'):
                return json.load(f)
            else:
                raise ValueError("Unsupported file format. Use YAML or JSON.")
    except Exception as e:
        print(f"Error loading config: {e}")
        sys.exit(1)

def override_config(config, args, keys_map, data_type):
    """
    Override the config values based on the provided arguments and data type.
    This function overrides the config dictionary with the values provided in the args,
    based on the mapping in keys_map.
    """
    for key, param in keys_map.items():
        value = getattr(args, param, None)  # Get value from args for each key
        
        if value is not None:  # Only override if a value is provided
            
            keys = key.split('.')  # Split by dot for nested keys (e.g., 'train.hparams.epochs')
            d = config
            
            # Case 1: Override for data_type specific keys (model.timeseries.model_name)
            if data_type in key:  # Check if the key corresponds to the correct data type
                for part in keys[:-1]:
                    d = d.setdefault(part, {})  # Create nested dictionaries if they don't exist
                d[keys[-1]] = value
                print(f"Overriding {key} to: {value}")
            
            # Case 2: Override for general keys (like pipeline, general hyperparameters)
            elif "pipeline" in key or "dataset" in key:  # Keys not specific to data_type
                for part in keys[:-1]:
                    d = d.setdefault(part, {})  # Create nested dictionaries if they don't exist
                d[keys[-1]] = value  # Override the value
                print(f"Overriding {key} to: {value}")


def main():
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Run a flow with a given config.")
    parser.add_argument("--config", type=str, required=True, help="Path to a config file (YAML or JSON).")
    
    # Parse experiment arguments
    parser.add_argument("--exp_name", type=str, default=None, help="Override experiment name in MLflow.")
    parser.add_argument("--exp_desc", type=str, default=None, help="Override experiment description in MLflow.")
    
    # For dataset configuration
    parser.add_argument("--ds_name", type=str, default=None, help="Override dataset name.")
    parser.add_argument("--data_type", type=str, default='timeseries', help="Override data type (timeseries or image).")
    parser.add_argument("--ds_description", type=str, default=None, help="Override dataset description.")
    parser.add_argument("--dvc_tag", type=str, default=None, nargs="+", help="Override dataset tags.")
    parser.add_argument("--file_path", type=str, default=None, help="Override file_path.")
    
    # For model configuration
    parser.add_argument("--model_type", type=str, default=None, help="Override model type.")
    parser.add_argument("--model_name", type=str, default=None, help="Override model name.")
    parser.add_argument("--model_version", type=int, default=None, help="Override model version.")
    
    # For hyperparameters
    parser.add_argument("--learningRate", type=float, default=None, help="Override learningRate.")
    parser.add_argument("--batchSize", type=int, default=None, help="Override batchSize.")
    parser.add_argument("--epochs", type=int, default=None, help="Override epochs.")
    
    # For pipeline actions
    parser.add_argument("--data_flow", type=int, default=None, help="Override data flow pipeline action.")
    parser.add_argument("--train_flow", type=int, default=None, help="Override train flow pipeline action.")
    parser.add_argument("--eval_flow", type=int, default=None, help="Override evaluate flow pipeline action.")
    parser.add_argument("--deploy_flow", type=int, default=None, help="Override deploy flow pipeline action.")
    
    args = parser.parse_args()

    # Load configuration
    config = load_config(args.config)

    # Define mapping between argument and config path
    keys_map = {
        'train.timeseries.mlflow.exp_name': 'exp_name',
        'train.timeseries.mlflow.exp_desc': 'exp_desc',
        
        'train.image.mlflow.exp_name': 'exp_name',
        'train.image.mlflow.exp_desc': 'exp_desc',
        
        'dataset.ds_name': 'ds_name',
        'data_type': 'data_type',
        'dataset.ds_description': 'ds_description',
        'dataset.dvc_tag': 'dvc_tag',
        'dataset.file_path': 'file_path',
        
        'model.timeseries.model_type': 'model_type',
        'model.timeseries.model_name': 'model_name',
        'model.timeseries.model_version': 'model_version',
        
        'model.image.model_type': 'model_type',
        'model.image.model_name': 'model_name',
        'model.image.model_version': 'model_version',
        
        'train.image.hparams.epochs': 'epochs',
        'train.image.hparams.learningRate': 'learningRate',
        'train.image.hparams.batchSize': 'batchSize',
        
        'train.timeseries.hparams.epochs': 'epochs',
        'train.timeseries.hparams.learningRate': 'learningRate',
        'train.timeseries.hparams.batchSize': 'batchSize',
        
        'pipeline.data_flow': 'data_flow',
        'pipeline.train_flow': 'train_flow',
        'pipeline.eval_flow': 'eval_flow',
        'pipeline.deploy_flow': 'deploy_flow'
    }

    # Ensure data_type is specified
    if not args.data_type:
        print("Error: data_type (timeseries or image) is required.")
        sys.exit(1)

    # Override config with provided arguments
    override_config(config, args, keys_map, args.data_type)

    # Ensure 'flow_module' exists in the config
    if 'flow_module' not in config:
        print("Error: 'flow_module' not found in config.")
        sys.exit(1)

    # Import and execute the specified flow
    try:
        flow_module = import_module(config['flow_module'])
        flow_module.start(config)
    except ModuleNotFoundError:
        print(f"Error: Module '{config['flow_module']}' not found.")
        sys.exit(1)
    except Exception as e:
        print(f"Error executing flow: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
