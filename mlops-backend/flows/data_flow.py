import os, shutil, sys
import json, math
import subprocess
import pickle
import numpy as np
import pandas as pd
from typing import Dict, Any
from flows.utils import create_logs_file
from prefect import flow, get_run_logger, context
from datetime import datetime
from subprocess import run, CalledProcessError

from tasks.dataset import (
    load_time_series_data,
    prepare_time_series_data,
    split_time_series_data,
    prepare_dataset,
    validate_data,
    calculate_numerical_statistics,
    calculate_categorical_statistics,
    calculate_quality,
    generate_metadata_timeseries
)

# ✅ Path configuration for dataset storage in DVC
DVC_DATA_STORAGE = os.getenv("DVC_DATA_STORAGE", "/home/ariya/central_storage/datasets/")

# ✅ Check and initialize DVC repository if not present
def check_dvc_repo(ds_root: str):
    try:
        run(["dvc", "status"], cwd=ds_root, check=True)
    except CalledProcessError:
        run(["dvc", "init", "--no-scm"], cwd=ds_root, check=True)
        print("DVC repository initialized without SCM.")

def convert_to_serializable(obj):
    """
    Converts non-serializable objects (NumPy, Pandas types) into standard Python types for JSON storage.
    Also replaces NaN, Infinity, and -Infinity with None.
    """
    if isinstance(obj, np.integer):  # Convert NumPy int64 → int
        return int(obj)
    elif isinstance(obj, np.floating):  # Convert NumPy float → float
        return None if math.isnan(obj) or math.isinf(obj) else float(obj)
    elif isinstance(obj, float):  # Convert pure Python float
        return None if math.isnan(obj) or math.isinf(obj) else obj
    elif isinstance(obj, np.ndarray):  # Convert NumPy array → list
        return [convert_to_serializable(item) for item in obj.tolist()]
    elif isinstance(obj, pd.Timestamp):  # Convert Pandas Timestamp → string
        return obj.strftime('%Y-%m-%d %H:%M:%S')
    elif isinstance(obj, pd.DataFrame):  # Convert DataFrame → dict (records format)
        return obj.replace({np.nan: None, np.inf: None, -np.inf: None}).to_dict(orient="records")
    elif isinstance(obj, pd.Series):  # Convert Series → list
        return obj.replace({np.nan: None, np.inf: None, -np.inf: None}).tolist()
    elif isinstance(obj, dict):  # Recursively process dictionary
        return {key: convert_to_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, list):  # Recursively process list
        return [convert_to_serializable(item) for item in obj]
    return obj  # Return as is if not handled


# ✅ Save dataset files to DVC
def save_data_to_dvc(file_path: str, ds_root: str):
    check_dvc_repo(ds_root)
    try:
        run(["dvc", "add", file_path], cwd=ds_root)
        run(["git", "add", file_path + ".dvc"], cwd=ds_root)
        run(["git", "commit", "-m", f"Add {file_path} to DVC"], cwd=ds_root)
    except CalledProcessError as e:
        print(f"Error occurred while adding file to DVC: {e}")

def save_metadata_to_dvc(metadata, ds_root, ds_name, version):
    """
    Saves metadata as JSON, ensuring proper serialization.
    """
    check_dvc_repo(ds_root)  # Ensure DVC repository is initialized
    
    # ✅ Convert metadata to JSON-safe format
    metadata_serializable = convert_to_serializable(metadata)

    # ✅ Save metadata for the specific version
    version_folder = os.path.join(ds_root, "versions", version)  # Không thêm 'v' vào thư mục
    os.makedirs(version_folder, exist_ok=True)
    version_metadata_file = os.path.join(version_folder, f"metadata_{ds_name}_{version}.json")

    with open(version_metadata_file, "w") as f:
        json.dump(metadata_serializable, f, ensure_ascii=False, indent=4, allow_nan=False)
    save_data_to_dvc(version_metadata_file, ds_root)

    # ✅ Load existing metadata.json (if available) to update versions list
    global_metadata_file = os.path.join(ds_root, f"metadata_{ds_name}.json")
    if os.path.exists(global_metadata_file):
        with open(global_metadata_file, "r") as f:
            global_metadata = json.load(f)
    else:
        global_metadata = {}  # If no existing metadata, start fresh

    # ✅ Convert global metadata before saving
    global_metadata.update(metadata_serializable)
    version_path = os.path.join(ds_root, "versions")
    if os.path.exists(version_path):
        global_metadata["versions"] = sorted(
            [v for v in os.listdir(version_path) if os.path.isdir(os.path.join(version_path, v))],
            reverse=True
        )
    else:
        global_metadata["versions"] = []

    # ✅ Convert metadata before saving again
    global_metadata_serializable = convert_to_serializable(global_metadata)

    # ✅ Save updated global metadata
    with open(global_metadata_file, "w") as f:
        json.dump(global_metadata_serializable, f, ensure_ascii=False, indent=4, allow_nan=False)
    save_data_to_dvc(global_metadata_file, ds_root)




# ✅ Retrieve dataset version
def get_new_version(ds_name: str, ds_root: str):
    metadata_file = os.path.join(ds_root, f"{ds_name}_metadata.json")

    if os.path.exists(metadata_file):
        with open(metadata_file, "r") as f:
            metadata = json.load(f)
        versions = metadata.get("versions", [])
        
        if versions:
            last_version = versions[-1]["version"]
            major, minor, patch = map(int, last_version.split("."))
            new_version = f"{major}.{minor}.{patch + 1}"
        else:
            new_version = "1.0.0"
    else:
        new_version, versions = "1.0.0", []

    return new_version, versions

def get_latest_version(ds_root: str) -> str:
    version_dir = os.path.join(ds_root, "versions")
    if not os.path.exists(version_dir):
        return "1.0.0"  # Không có 'v' ở đầu

    versions = [
        v for v in os.listdir(version_dir) if v.replace(".", "").isdigit()  # Lọc các thư mục phiên bản
    ]
    if not versions:
        return "1.0.0"  # Nếu không có phiên bản nào

    # Sắp xếp phiên bản đúng cách
    versions.sort(key=lambda v: list(map(int, v.split("."))))  # Xóa 'v' và sắp xếp theo định dạng version
    latest_version = versions[-1]

    # Tăng số thứ tự bản vá
    major, minor, patch = map(int, latest_version.split("."))
    new_version = f"{major}.{minor}.{patch + 1}"  # Tăng phiên bản

    return new_version


# ✅ Get dataset index as "id"
def get_dataset_index(ds_name: str, dvc_root: str) -> int:
    """python run_flow.py --config configs/data_flow_config.yaml
    Returns the index of the dataset in the DVC root directory.
    The index is determined based on alphabetical sorting.
    """
    datasets = sorted([
        d for d in os.listdir(dvc_root) 
        if os.path.isdir(os.path.join(dvc_root, d)) and d != ".ipynb_checkpoints"
    ])
    
    if ds_name in datasets:
        return datasets.index(ds_name) + 1  # Index starts from 1
    return len(datasets) + 1  # If new dataset, assign the next available number



# ✅ Main data processing flow
@flow(name='data_flow')
def data_flow(cfg: Dict[str, Any]):
    flow_run_id = context.get_run_context().flow_run.id
    log_file_path = create_logs_file(flow_run_id,flow_type="data_flow")
    logger = get_run_logger()
    logger.info("Starting data processing flow...")
    logger.info(f"Log file saved to: {log_file_path}")

    data_type = cfg['data_type']
    ds_cfg = cfg['dataset']
    ds_name = ds_cfg['ds_name']
    ds_author = ds_cfg['ds_author']
    dvc_ds_root = os.path.join(DVC_DATA_STORAGE, ds_name)
    os.makedirs(dvc_ds_root, exist_ok=True)


    # ✅ Retrieve dataset version
    new_version, version_history = get_new_version(ds_name, dvc_ds_root)
    version_history.append({
        "version": new_version,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "changes": "Updated dataset version.",
        "author": ds_author
    })
    
    # ds_id = get_dataset_index(ds_name, DVC_DATA_STORAGE)  #case ds_is is int number
    ds_id=ds_name #case ds_is is ds_name
 
    # ✅ Initialize metadata
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
        "version": "1.0.0",
        "format": "CSV/TXT",
        "features": [],
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
        "data": [],  # Store first 50 rows for preview
        "versions": version_history
    }

    if data_type == 'image':
        # **1️⃣ Load Image dataset**
        ds_repo_path, annotation_df = prepare_dataset(
            ds_root=ds_cfg['ds_root'],
            ds_name=ds_name,
            dvc_tag=ds_cfg['dvc_tag'],
            dvc_checkout=ds_cfg['dvc_checkout']
        )

        # **2️⃣ Run Data Validation**
        report_path = f"files/{ds_name}_{ds_cfg['dvc_tag']}_validation.html"
        validate_data(ds_repo_path, img_ext='jpeg', save_path=report_path)
        save_data_to_dvc(report_path, dvc_ds_root)

        # **3️⃣ Update metadata**
        metadata.update({
            "size": os.path.getsize(ds_repo_path),
            "rows": len(annotation_df),
            "columns": len(annotation_df.columns),
            "status": "completed",
            "progress": 100,
            "features": [{"name": col, "type": "string", "missing": annotation_df[col].isna().sum()} for col in annotation_df.columns],
            "statistics": {
                "numerical": calculate_numerical_statistics(annotation_df),
                "categorical": calculate_categorical_statistics(annotation_df)
            },
            "quality": calculate_quality(annotation_df),
            "columns_list": [],
            "data": [],  # Store first 50 rows for preview
            "versions": version_history
        })

        # **4️⃣ Save metadata**
        save_metadata_to_dvc(metadata, dvc_ds_root, ds_name)

        return {"ds_repo_path": ds_repo_path, "annotation_df": annotation_df}

    elif data_type == 'timeseries':
        
        file_check=False
        valid_extensions = ['.csv', '.xlsx', '.txt']
        for file in os.listdir(dvc_ds_root):
            file_path_check = os.path.join(dvc_ds_root, file)
            if os.path.isfile(file_path_check) and any(file.lower().endswith(ext) for ext in valid_extensions):
                file_check=True
                file_path=file_path_check
                
        logger.info(f"{file_path}")
                
        
        # if file_check==True:
            
        #     # get dataset version newest in dvc_ds_root
        #     ds_versions_dir = os.path.join(DVC_DATA_STORAGE, ds_name, "versions")
        #     ds_version_folders=[f for f in os.listdir(ds_versions_dir) if os.path.isdir(os.path.join(ds_versions_dir, f))]
        #     ds_version_folders.sort(reverse=True)
        #     latest_version_folder = ds_version_folders[0] if ds_version_folders else None
    
        #     logger.info(f"Lastest version of {ds_name} is {latest_version_folder}, will be used for training process")
        
        #Check if have no data file in folder, the new file will be uploaded and processed.
        if file_check==False:
            file_path = ds_cfg['file_path']
            
        # ✅ Ensure versioning folder exists & get the latest version number
        version = get_latest_version(dvc_ds_root)  # Retrieve new version
        version_folder = os.path.join(dvc_ds_root, "versions", version.lstrip("/"))

        os.makedirs(version_folder, exist_ok=True)  # Ensure directory exists
        
        # ✅ Define the new file path inside the version folder
        new_file_path = os.path.join(version_folder, os.path.basename(file_path))

        # ✅ If the file already exists in the latest version, **skip processing**
        if os.path.exists(new_file_path):
            print(f"✅ File already exists in version: {new_file_path}")
            return new_file_path  # Exit the flow immediately

        # ✅ Copy the source file into the version folder (without deleting the original)
        if os.path.exists(file_path):
            shutil.copy2(file_path, new_file_path)  # Copy file to version folder
            if os.path.exists(new_file_path):
                print(f"✅ File copied successfully to: {new_file_path}")
            else:
                print(f"⚠️ Warning: Failed to copy file to {new_file_path}")
                sys.exit(1)
        else:
            print(f"❌ Error: Source file does not exist - {file_path}")
            sys.exit(1)

        # ✅ Update file path to the new versioned location
        file_path = new_file_path
                

        # ✅ Load dataset from the updated path
        ds_file_format, data_raw, data_use = load_time_series_data(
            file_path=file_path,
            date_col=ds_cfg['date_col'],
            target_col=ds_cfg['target_col']
        )
        
        # ✅ Calculate time range & sample rate
        if ds_cfg['date_col'] in data_raw.columns:
            timestamps = pd.to_datetime(data_raw[ds_cfg['date_col']].dropna())
            if not timestamps.empty:
                time_min = timestamps.min()
                time_max = timestamps.max()
                time_range = f"{time_min.strftime('%Y-%m-%d %H:%M:%S')} ~ {time_max.strftime('%Y-%m-%d %H:%M:%S')}"
                # Calculate median sampling interval
                deltas = timestamps.sort_values().diff().dropna()
                median_delta = deltas.median()
                sample_rate = str(median_delta)
            else:
                time_range = "Unknown"
                sample_rate = "Unknown"
        else:
            time_range = "Unknown"
            sample_rate = "Unknown"
        

        # **2️⃣ Generate metadata for the new version**
        metadata = generate_metadata_timeseries(data_raw, ds_id, ds_name, ds_author, data_type, ds_cfg, file_path)
        metadata["timeRange"] = time_range
        metadata["sampleRate"] = sample_rate
        metadata["sensor"] = 0

        # ✅ Load the existing global metadata file (or initialize if missing)
        main_metadata_file = os.path.join(dvc_ds_root, f"metadata_{ds_name}.json")
        if os.path.exists(main_metadata_file):
            with open(main_metadata_file, "r") as f:
                main_metadata = json.load(f)
        else:
            main_metadata = {
                "dataset": ds_name,
                "versions": []
            }

        # ✅ Append the new version information to the global metadata
        version_info = {
            "version": version,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "changes": "Updated dataset version.",
            "author": ds_author
        }
        main_metadata["versions"].append(version_info)

        # **3️⃣ Save raw data to DVC**
        save_data_to_dvc(file_path, dvc_ds_root)

        # **4️⃣ Process & save transformed time series data**
        X, y, scaler = prepare_time_series_data(data=data_use, time_step=ds_cfg['time_step'], target_col=ds_cfg['target_col'])
        X_train, X_val, X_test, y_train, y_val, y_test = split_time_series_data(X, y)

        # ✅ Save processed files into the **version folder**
        for file_name, data in [("X_train.npy", X_train), ("X_val.npy", X_val), ("X_test.npy", X_test),
                                ("y_train.npy", y_train), ("y_val.npy", y_val), ("y_test.npy", y_test)]:
            processed_file_path = os.path.join(version_folder, file_name)
            np.save(processed_file_path, data)
            save_data_to_dvc(processed_file_path, dvc_ds_root)

        # **6️⃣ Save scaler in the version folder**
        scaler_file = os.path.join(version_folder, "scaler.pkl")
        with open(scaler_file, "wb") as f:
            pickle.dump(scaler, f)
        save_data_to_dvc(scaler_file, dvc_ds_root)

        # **7️⃣ Save metadata for this version in `versions/{version}/metadata.json`**
        metadata["version"]=version
        metadata["format"]=ds_file_format
        metadata["versions"] = [version_info]
        save_metadata_to_dvc(metadata, dvc_ds_root, ds_name, version)

        # **8️⃣ Update & save the global metadata file (`metadata.json` in dataset root)**
        global_metadata = metadata.copy()  # Copy latest metadata
        global_metadata["versions"] = main_metadata["versions"]  # Keep all version history
        
        global_metadata_serializable = convert_to_serializable(global_metadata)


        with open(main_metadata_file, "w") as f:
            json.dump(global_metadata_serializable, f, ensure_ascii=False, indent=4, allow_nan=False)
        save_data_to_dvc(main_metadata_file, dvc_ds_root)
        
        #if already have data file in folder, the lastest version of data will be used.

        return data_type, ds_name

    else:
        raise ValueError(f"Unsupported data_type: {data_type}")


# ✅ Start the processing flow
def start(cfg):
    data_flow(cfg)
