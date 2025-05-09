import os, shutil, sys
import json, math
import subprocess
import pickle
import numpy as np
import pandas as pd
from typing import Dict, Any
from flows.utils import create_logs_file
from prefect import flow, task, get_run_logger, context
from datetime import datetime
from subprocess import run, CalledProcessError

from tasks.timeseries.data.dataset import (
    load_time_series_data,
    prepare_time_series_data,
    split_time_series_data,
    validate_timeseries_data,
    generate_metadata_timeseries
)

from packaging.version import Version

DVC_DATA_STORAGE = os.getenv("DVC_DATA_STORAGE", "/home/ariya/central_storage/datasets/")

# Utility functions

def check_dvc_repo(ds_root: str):
    try:
        run(["dvc", "status"], cwd=ds_root, check=True)
    except CalledProcessError:
        run(["dvc", "init", "--no-scm"], cwd=ds_root, check=True)
        get_run_logger().info("DVC repository initialized without SCM.")

def convert_to_serializable(obj):
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return None if math.isnan(obj) or math.isinf(obj) else float(obj)
    elif isinstance(obj, float):
        return None if math.isnan(obj) or math.isinf(obj) else obj
    elif isinstance(obj, np.ndarray):
        return [convert_to_serializable(item) for item in obj.tolist()]
    elif isinstance(obj, pd.Timestamp):
        return obj.strftime('%Y-%m-%d %H:%M:%S')
    elif isinstance(obj, pd.DataFrame):
        return obj.replace({np.nan: None, np.inf: None, -np.inf: None}).to_dict(orient="records")
    elif isinstance(obj, pd.Series):
        return obj.replace({np.nan: None, np.inf: None, -np.inf: None}).tolist()
    elif isinstance(obj, dict):
        return {key: convert_to_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_serializable(item) for item in obj]
    return obj

def save_data_to_dvc(file_path: str, ds_root: str):
    logger = get_run_logger()
    check_dvc_repo(ds_root)
    try:
        run(["dvc", "add", file_path], cwd=ds_root)
        run(["git", "add", file_path + ".dvc"], cwd=ds_root)
        run(["git", "commit", "-m", f"Add {file_path} to DVC"], cwd=ds_root)
    except CalledProcessError as e:
        logger.error(f"Error occurred while adding file to DVC: {e}")

def save_metadata_to_dvc(metadata, ds_root, ds_name, version=None):
    logger = get_run_logger()
    check_dvc_repo(ds_root)
    metadata_serializable = convert_to_serializable(metadata)

    if version:
        version_folder = os.path.join(ds_root, "versions", version)
        os.makedirs(version_folder, exist_ok=True)
        version_metadata_file = os.path.join(version_folder, f"metadata_{ds_name}_{version}.json")
        with open(version_metadata_file, "w") as f:
            json.dump(metadata_serializable, f, ensure_ascii=False, indent=4, allow_nan=False)
        save_data_to_dvc(version_metadata_file, ds_root)

    global_metadata_file = os.path.join(ds_root, f"metadata_{ds_name}.json")
    if os.path.exists(global_metadata_file):
        with open(global_metadata_file, "r") as f:
            global_metadata = json.load(f)
    else:
        global_metadata = {}

    for key in metadata:
        if key != "versions":
            global_metadata[key] = metadata[key]

    existing_versions = global_metadata.get("versions", [])
    if existing_versions and isinstance(existing_versions[0], str):
        existing_versions = [{"version": v} for v in existing_versions]

    if version:
        author = (
            metadata.get("versions", [{}])[0].get("author", "unknown")
            if isinstance(metadata, dict)
            else "unknown"
        )
        version_entry = {
            "version": version,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "changes": "Updated dataset version.",
            "author": author
        }
        if not any(isinstance(v, dict) and v.get("version") == version for v in existing_versions):
            existing_versions.insert(0, version_entry)

    existing_versions.sort(key=lambda v: Version(v["version"]))
    global_metadata["versions"] = existing_versions

    global_metadata_serializable = convert_to_serializable(global_metadata)
    with open(global_metadata_file, "w") as f:
        json.dump(global_metadata_serializable, f, ensure_ascii=False, indent=4, allow_nan=False)
    save_data_to_dvc(global_metadata_file, ds_root)
    logger.info(f"✅ Metadata saved for dataset '{ds_name}' at version {version}.")

def get_latest_version(ds_root: str) -> str:
    version_dir = os.path.join(ds_root, "versions")
    if not os.path.exists(version_dir):
        return "1.0.0"
    versions = [v for v in os.listdir(version_dir) if v.replace(".", "").isdigit()]
    if not versions:
        return "1.0.0"
    versions.sort(key=lambda v: list(map(int, v.split("."))))
    major, minor, patch = map(int, versions[-1].split("."))
    return f"{major}.{minor}.{patch + 1}"

def get_dataset_index(ds_name: str, dvc_root: str) -> int:
    datasets = sorted([
        d for d in os.listdir(dvc_root) 
        if os.path.isdir(os.path.join(dvc_root, d)) and d != ".ipynb_checkpoints"
    ])
    if ds_name in datasets:
        return datasets.index(ds_name) + 1
    return len(datasets) + 1

@task(name="data_collect", log_prints=True)
def task_data_collect(cfg, dvc_ds_root, new_version):
    logger = get_run_logger()
    ds_cfg = cfg['dataset']
    file_path = ds_cfg.get('file_path')

    if not file_path:
        valid_extensions = ['.csv', '.xlsx', '.txt']
        for file in os.listdir(dvc_ds_root):
            ext = os.path.splitext(file)[-1].lower()
            if ext in valid_extensions:
                file_path = os.path.join(dvc_ds_root, file)
                logger.info(f"📂 Auto-detected file: {file_path}")
                break
        if not file_path:
            raise FileNotFoundError(f"❌ No CSV/XLSX/TXT file found in {dvc_ds_root}. Cannot proceed.")

    version_folder = os.path.join(dvc_ds_root, "versions", new_version)
    os.makedirs(version_folder, exist_ok=True)
    new_file_path = os.path.join(version_folder, os.path.basename(file_path))

    if os.path.exists(new_file_path):
        logger.info(f"✅ File already exists in version folder: {new_file_path}")
        return new_file_path

    shutil.copy2(file_path, new_file_path)
    logger.info(f"📁 Copied file to version folder: {new_file_path}")
    
    ds_file_format, data_raw, data_train = load_time_series_data(
        file_path=file_path,
        date_col=ds_cfg['date_col'],
        target_col=ds_cfg['target_col']
    )
    return new_file_path, data_train

# Task: Validate image dataset (output HTML report)
@task(name="validate_data", log_prints=True)
def task_data_validation(data_type: str, file_path: str, ds_name: str, dvc_ds_root: str):
    logger = get_run_logger()


    if data_type == "timeseries":
        # Read file
        if file_path.endswith(".csv"):
            df = pd.read_csv(file_path)
        elif file_path.endswith((".xlsx", ".xls")):
            df = pd.read_excel(file_path)
        elif file_path.endswith(".txt"):
            df = pd.read_csv(file_path, delimiter="\t")
        else:
            raise ValueError(f"Unsupported file format for validation: {file_path}")

        # Validate and save report
        report = validate_timeseries_data(df)
        json_report_path = os.path.join(dvc_ds_root, f"{data_type}_{ds_name}_validation.json")
        with open(json_report_path, "w", encoding="utf-8") as f:
            json.dump(convert_to_serializable(report), f, ensure_ascii=False, indent=4)

        save_data_to_dvc(json_report_path, dvc_ds_root)
        logger.info(f"📝 Timeseries validation report saved: {json_report_path}")
        return json_report_path

    else:
        logger.warning(f"⚠️ Validation for data_type '{data_type}' is not supported.")
        return None

@task(name="feature_engineering", log_prints=True)
def task_feature_engineering(file_path, cfg, dvc_ds_root, new_version):
    
    data_type = cfg['data_type']
    ds_cfg = cfg['dataset']
    ds_name = ds_cfg['ds_name']
    ds_author = ds_cfg['ds_author']
    
    logger = get_run_logger()
    logger.info(f"🔍 Loading and preprocessing file: {file_path}")

    ds_file_format, data_raw, data_train = load_time_series_data(
        file_path=file_path,
        date_col=ds_cfg['date_col'],
        target_col=ds_cfg['target_col']
    )

    metadata = generate_metadata_timeseries(data_raw, ds_name, ds_name, ds_author, data_type, ds_cfg, file_path)
    timestamps = pd.to_datetime(data_raw[ds_cfg['date_col']].dropna())
    if not timestamps.empty:
        metadata["timeRange"] = f"{timestamps.min().strftime('%Y-%m-%d %H:%M:%S')} ~ {timestamps.max().strftime('%Y-%m-%d %H:%M:%S')}"
        metadata["sampleRate"] = str(timestamps.sort_values().diff().dropna().median())
    else:
        metadata["timeRange"] = "Unknown"
        metadata["sampleRate"] = "Unknown"
    metadata["sensor"] = 0
    metadata["version"] = new_version
    metadata["format"] = ds_file_format
    metadata["versions"] = [{
        "version": new_version,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "changes": "Initial feature engineered.",
        "author": ds_author
    }]

    save_metadata_to_dvc(metadata, dvc_ds_root, ds_name, new_version)

    return metadata

@task(name="split_data", log_prints=True)
def task_data_split(data_train, cfg, dvc_ds_root, new_version, metadata=None):
    
    data_type = cfg['data_type']
    ds_cfg = cfg['dataset']
    ds_name = ds_cfg['ds_name']
    ds_author = ds_cfg['ds_author']
    model_cfg=cfg['model']
    
    logger = get_run_logger()
    logger.info(f"✂️ Splitting time series data with time sequences = {ds_cfg['sequences']}")
    
    X, y, scaler = prepare_time_series_data(
        data=data_train, 
        sequences=model_cfg[data_type]["sequences"], 
        target_col=ds_cfg['target_col']
    )
    X_train, X_val, X_test, y_train, y_val, y_test = split_time_series_data(X, y)
    
    if metadata is None:
        version_info = {
                        "version": new_version,
                        "date": datetime.now().strftime("%Y-%m-%d"),
                        "changes": "Updated dataset version.",
                        "author": ds_author
                        }
        
        ds_id=ds_name
        
        metadata = {
        "id": ds_id,
        "name": ds_name,
        "type": data_type,
        "size": 0,
        "rows": 0,
        "columns": 0,
        "status": "processing",
        "progress": 0,
        "tags": ds_cfg.get("dvc_tag", []),
        "description": ds_cfg.get("ds_description", "No description"),
        "version": new_version,
        "format": "CSV/TXT",
        "features": [],
        "split_ratio":{
            "train_set": 0,
            "val_set": 0,
            "test_set": 0,
            "outside_set": 0,
        },
        "statistics": {
            "numerical": {},
            "categorical": {}
        },
        "quality": {
            "completeness": 0,
            "consistency": 0,
            "balance": 0
        },
        "columns_list": [],
        "data": [],
        "versions": [version_info]
    }

    if metadata is not None:
        metadata["split_ratio"] = {
            "train_set": len(y_train),
            "val_set": len(y_val),
            "test_set": len(y_test),
            "outside_set": len(data_train) - len(y_train) - len(y_val) - len(y_test)
        }
        save_metadata_to_dvc(metadata, dvc_ds_root, ds_name, new_version)

    return {
        "X_train": X_train, "X_val": X_val, "X_test": X_test,
        "y_train": y_train, "y_val": y_val, "y_test": y_test,
        "scaler": scaler
    }

@flow(name="data_flow", log_prints=True)
def data_flow(cfg: Dict[str, Any]):
    logger = get_run_logger()
    flow_run_id = context.get_run_context().flow_run.id
    log_file_path = create_logs_file(flow_run_id, flow_type="data_flow")
    logger.info("Starting data processing flow...")
    logger.info(f"Log file saved to: {log_file_path}")

    data_type = cfg['data_type']
    ds_cfg = cfg['dataset']
    ds_name = ds_cfg['ds_name']
    ds_author = ds_cfg['ds_author']
    dvc_ds_root = os.path.join(DVC_DATA_STORAGE, ds_name)
    os.makedirs(dvc_ds_root, exist_ok=True)

    new_version = get_latest_version(dvc_ds_root)

    task_flags = cfg.get("enabled_tasks", {}).get("data_flow", {})
    enabled_tasks = [task for task, is_enabled in task_flags.items() if is_enabled]

    file_path = None
    if "collect" in enabled_tasks:
        file_path, data_train = task_data_collect(cfg, dvc_ds_root, new_version)

    if "validate" in enabled_tasks:
        if data_type == "timeseries" and file_path:
            task_data_validation(data_type, file_path, ds_name, dvc_ds_root)

    metadata = None
    if "feature_engineer" in enabled_tasks:
        metadata = task_feature_engineering(
            file_path, cfg, dvc_ds_root, new_version
        )

    if "split" in enabled_tasks:
        split_data = task_data_split(data_train, cfg, dvc_ds_root, new_version, metadata)
        version_folder = os.path.join(dvc_ds_root, "versions", new_version)
        os.makedirs(version_folder, exist_ok=True)

        for file_name, data in [
            ("X_train.npy", split_data["X_train"]),
            ("X_val.npy", split_data["X_val"]),
            ("X_test.npy", split_data["X_test"]),
            ("y_train.npy", split_data["y_train"]),
            ("y_val.npy", split_data["y_val"]),
            ("y_test.npy", split_data["y_test"])
        ]:
            processed_file_path = os.path.join(version_folder, file_name)
            np.save(processed_file_path, data)
            save_data_to_dvc(processed_file_path, dvc_ds_root)

        scaler_file = os.path.join(version_folder, "scaler.pkl")
        with open(scaler_file, "wb") as f:
            pickle.dump(split_data["scaler"], f)
        save_data_to_dvc(scaler_file, dvc_ds_root)

    logger.info("✅ Flow completed based on selected tasks.")
    return data_type, ds_name

def start(cfg):
    data_flow(cfg)

