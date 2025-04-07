from fastapi import APIRouter, HTTPException, BackgroundTasks, File, UploadFile, Form, HTTPException
import os, json, shutil, time
from datetime import datetime
from typing import List, Dict
from utils.class_base import Dataset, DatasetFeature, DatasetStatistics, DatasetQuality, DatasetVersion
import logging
import subprocess
from api.workflow_run import check_if_flow_running, run_selected_flow  # Kiểm tra trạng thái task đang chạy
from utils.class_base import Dataset
from shlex import quote
# Tạo router cho API datasets
router = APIRouter()

# Định nghĩa đường dẫn lưu trữ dataset
DVC_DATA_STORAGE = os.getenv("DVC_DATA_STORAGE", "/home/ariya/central_storage/datasets/")


def load_metadata(ds_path: str) -> Dict:
    """Load metadata JSON file của dataset."""
    metadata_file = os.path.join(ds_path, f"metadata_{os.path.basename(ds_path)}.json")
    if not os.path.exists(metadata_file):
        return None
    with open(metadata_file, "r", encoding="utf-8") as f:
        return json.load(f)


def get_dataset_index(ds_name: str, dvc_root: str) -> int:
    """Trả về ID dataset dựa trên danh sách thư mục (int)."""
    datasets = sorted(
        [d for d in os.listdir(dvc_root) if os.path.isdir(os.path.join(dvc_root, d)) and d != ".ipynb_checkpoints"]
    )
    return datasets.index(ds_name) + 1 if ds_name in datasets else len(datasets) + 1


# ========================= API GET =========================


async def get_all_datasets_info():
    """Retrieve all datasets and sort by lastModified (newest first)."""
    
    datasets = {}

    for ds_name in os.listdir(DVC_DATA_STORAGE):
        ds_path = os.path.join(DVC_DATA_STORAGE, ds_name)
        if not os.path.isdir(ds_path) or ds_name == ".ipynb_checkpoints":
            continue  # Skip invalid directories

        metadata = load_metadata(ds_path)
        if not metadata:
            continue  # Skip if metadata is missing

        dataset_id = get_dataset_index(ds_name, DVC_DATA_STORAGE)
        
        # ✅ Xử lý giá trị mặc định nếu không có dữ liệu
        quality_data = metadata.get("quality", {})
        completeness = max(0, quality_data.get("completeness", 0))
        consistency = max(0, quality_data.get("consistency", 0))
        balance = max(0, quality_data.get("balance", 0))

        # ✅ Công thức tính `qualityScore`
        qualityScore = (completeness * 0.5) + (consistency * 0.3) + (balance * 0.2)
        
        createdAt = metadata.get("createdAt", datetime.fromtimestamp(os.path.getctime(ds_path)).isoformat())
        updatedAt = metadata.get("updatedAt", datetime.fromtimestamp(os.path.getmtime(ds_path)).isoformat())
        
        dataset = Dataset(
            # id=str(dataset_id),
            id=metadata.get("name", ds_name),
            name=metadata.get("name", ds_name),
            type=metadata.get("type", "Unknown"),
            version=metadata.get("version", "Unknown"),
            size=metadata.get("size", 0),
            lastModified=datetime.fromtimestamp(os.path.getmtime(ds_path)).strftime('%Y-%m-%d'),
            createdAt=createdAt,
            updatedAt=updatedAt,
            rows=metadata.get("rows", 0),
            records=metadata.get("rows", 0),
            columns=metadata.get("columns", 0),
            status=metadata.get("status", "unknown"),
            progress=metadata.get("progress", 0),
            tags=metadata.get("tags", []),
            description=metadata.get("description", "No description"),
            features=[DatasetFeature(**feat) for feat in metadata.get("features", [])],
            statistics=DatasetStatistics(**metadata.get("statistics", {})),
            quality=DatasetQuality(**metadata.get("quality", {})),
            qualityScore=round(qualityScore, 2)
        )

        # datasets.append(dataset)
        datasets[ds_name] = dataset.dict()  # ✅ Chuyển thành dict để trả về

    # ✅ **Sort datasets by `lastModified` (newest first)**
    sorted_datasets = dict(sorted(datasets.items(), key=lambda x: datetime.strptime(x[1]["lastModified"], "%Y-%m-%d"), reverse=True))
    
    return sorted_datasets


async def get_dataset_detail_info(dataset_id: str):
    """Lấy thông tin chi tiết của một dataset."""
    dataset_folder = os.path.join(DVC_DATA_STORAGE, dataset_id)
    metadata = load_metadata(dataset_folder)
    
    if not metadata:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # Xử lý thời gian
    created_at = metadata.get("createdAt", datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ'))
    updated_at = metadata.get("lastModified", datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ'))

    # Chuẩn bị phản hồi đúng format
    dataset_detail = {
        "id": dataset_id,
        "name": metadata.get("name", dataset_id),
        "description": metadata.get("description", ""),
        "type": metadata.get("type", "Unknown"),
        "createdAt": created_at,
        "updatedAt": updated_at,
        "size": metadata.get("size", 0),
        "format": metadata.get("format", "Unknown"),
        "status": metadata.get("status", "unknown"),
        "version": metadata.get("version", "Unknown"),
        "tags": metadata.get("tags", []),
        "quality": metadata.get("quality", {}),
        "stats": {
            "rows": metadata.get("rows", 0),
            "columns": metadata.get("columns", 0),
            "timeRange": metadata.get("timeRange", "Unknown"),
            "sampleRate": metadata.get("sampleRate", "Unknown"),
            "sensors": metadata.get("sensors", 0),
        },
        "features": [
            {
                "name": feat.get("name", ""),
                "type": feat.get("type", "Unknown"),
                "missing": feat.get("missing", 0),
                "description": feat.get("description", "")
            }
            for feat in metadata.get("features", [])
        ],
        "data": metadata.get("data", [])[-50:], # Lấy 50 dòng dữ liệu cuoi cung
        "columns": metadata.get("columns_list", []),
        "versions": metadata.get("versions", []),
    }

    return dataset_detail

async def get_dataset_detail_client(dataset_id: str):
    """Fetch detailed information of the dataset for the client."""
    
    # Define the path to the dataset folder
    dataset_folder = os.path.join(DVC_DATA_STORAGE, dataset_id)
    
    # Load metadata for the dataset
    metadata = load_metadata(dataset_folder)
    
    # Check if metadata is found
    if not metadata:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # Process timestamps for created and updated times
    created_at = metadata.get("createdAt", datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ'))
    updated_at = metadata.get("lastModified", datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ'))

    # Get the previous version of the dataset
    previous_version = metadata.get("previousVersion", "Unknown")
    
    # Extract the current status and system requirements from metadata
    status = metadata.get("status", "unknown")
    system_requirements = metadata.get("systemRequirements", {
        "cpu": "warning", "memory": "warning", "storage": "warning"
    })

    # Get quality metrics and previous quality from metadata
    quality = metadata.get("quality", {})
    previous_quality = metadata.get("previousQuality", {})

    # Prepare the client response structure
    dataset_detail_client = {
        "id": dataset_id,  # The unique identifier for the dataset
        "name": metadata.get("name", dataset_id),  # Dataset name
        "description": metadata.get("description", ""),  # Description of the dataset
        "type": metadata.get("type", "Unknown"),  # Type of dataset (e.g., TimeSeries)
        "version": metadata.get("version", "Unknown"),  # Current version of the dataset
        "previousVersion": previous_version,  # Previous version (if available)
        "status": status,  # The current status of the dataset (e.g., "completed")
        "size": metadata.get("size", 0),  # Size of the dataset in bytes
        "rows": metadata.get("rows", 0),  # Number of rows in the dataset
        "columns": metadata.get("columns", 0),  # Number of columns in the dataset
        "lastModified": updated_at,  # Last modified timestamp
        "createdAt": created_at,  # Creation timestamp
        "thumbnail": metadata.get("thumbnail", "/dataset-thumbnails/default.png"),  # Thumbnail image path
        "quality": {
            "completeness": quality.get("completeness", 0),  # Dataset completeness percentage
            "consistency": quality.get("consistency", 0),  # Dataset consistency percentage
            "balance": quality.get("balance", 0),  # Dataset balance percentage
            "previous": previous_quality  # Previous quality metrics (if available)
        },
        "systemRequirements": system_requirements,  # Required system specs (CPU, memory, storage)
        "features": [
            {
                "name": feat.get("name", ""),  # Feature name
                "type": feat.get("type", "Unknown"),  # Feature type (e.g., float32, datetime)
                "missing": feat.get("missing", 0),  # Number of missing values for this feature
                "description": feat.get("description", "")  # Description of the feature
            }
            for feat in metadata.get("features", [])  # Extract each feature from the metadata
        ],
        "statistics": metadata.get("statistics", {}),  # Statistical information (e.g., numerical/categorical stats)
        "versions": metadata.get("versions", []),  # Versions history of the dataset
        "tags": metadata.get("tags", []),  # Tags associated with the dataset (e.g., ["time series", "sensor"])
    }

    # Return the detailed dataset information
    return dataset_detail_client


# 모든 버전 폴더에서 메타데이터 파일 읽기
async def get_versions_info_from_dataset(dataset_id: str) -> List[dict]:
    # Define the path to the dataset folder
    versions_folder = os.path.join(DVC_DATA_STORAGE, dataset_id, "versions")
    versions = []
    
    # 버전 폴더 내 모든 파일 탐색
    for version_folder in os.listdir(versions_folder):
        version_path = os.path.join(versions_folder, version_folder)
        
        if os.path.isdir(version_path):  # 폴더인지 확인
            # 메타데이터 파일 이름 생성 (예: metadata_Stock_product_01_1.0.1.json)
            metadata_filename = f"metadata_{dataset_id}_{version_folder}.json"  
            metadata_file_path = os.path.join(version_path, metadata_filename)
            
            if os.path.exists(metadata_file_path):  # 메타데이터 파일 존재 확인
                with open(metadata_file_path, "r", encoding="utf-8") as f:
                    metadata = json.load(f)  # JSON 파일 읽기
                    
                    # Dataset 버전 정보 구성
                    version_data = {
                        "version": version_folder,  # 버전
                        "date": metadata["lastModified"],  # 수정 날짜
                        "changes": metadata.get("changes", "No changes available"),  # 변경 사항
                        "author": metadata.get("author", "Unknown"),  # 작성자
                        "status": metadata.get("status", "stable"),  # 상태 (기본값 stable)
                        "size": metadata["size"],  # 데이터 크기
                        "quality": {
                            "completeness": metadata["quality"]["completeness"],  # 완전성
                            "consistency": metadata["quality"]["consistency"],  # 일관성
                            "balance": metadata["quality"]["balance"],  # 균형
                        },
                        "metadata": {
                            "rows": metadata["rows"],  # 행 수
                            "columns": metadata["columns"],  # 열 수
                            "format": metadata["format"],  # 데이터 포맷
                        }
                    }
                    versions.append(version_data)  # 버전 데이터 리스트에 추가
    
    # 버전 정보를 내림차순으로 정렬 (버전 번호 기준)
    versions.sort(key=lambda x: [int(i) for i in x["version"].split(".")], reverse=True)
    
    return versions  # 모든 버전 데이터 반환




async def dataset_create_and_run(
    background_tasks: BackgroundTasks,
    dataset_file: UploadFile = File(...),
    ds_name: str = Form(..., example="Stock_product_06"),
    ds_description: str = Form(..., example="Train a model for stock prediction"),
    dvc_tag: str = Form(..., example="제조, 센서, 실시간")
):
    """Tải lên file dataset và chạy flow xử lý dữ liệu."""

     # ✅ Kiểm tra xem flow có đang chạy không
    if await check_if_flow_running():
        raise HTTPException(status_code=400, detail="Another data flow is currently running. Please wait.")

    # ✅ Lưu file vào thư mục dataset tương ứng
    dataset_dir = os.path.join(DVC_DATA_STORAGE, ds_name)
    os.makedirs(dataset_dir, exist_ok=True)
    file_path = os.path.join(dataset_dir, dataset_file.filename)
    
    
    # ✅ Kiểm tra và xóa các file nếu tồn tại
    file_extensions_to_delete = [".csv", ".xlsx", ".xls", ".txt"]
    for existing_file in os.listdir(dataset_dir):
        if any(existing_file.endswith(ext) for ext in file_extensions_to_delete):
            existing_file_path = os.path.join(dataset_dir, existing_file)
            try:
                os.remove(existing_file_path)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error deleting old file: {str(e)}")


    # ✅ Save the new file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(dataset_file.file, buffer)
        print(f"✅ New file saved at: {file_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

    # ✅ Xử lý `dvc_tag`: Chuyển chuỗi `"제조, 센서, 실시간"` thành danh sách `["제조", "센서", "실시간"]`
    dvc_tag_list = " ".join(tag.strip() for tag in dvc_tag.split(",") if tag.strip())

    if not dvc_tag_list:
        raise HTTPException(status_code=400, detail="Invalid format for dvc_tag. Must be a comma-separated list.")

    # ✅ Chạy flow xử lý dữ liệu trong nền
    # If no flow is running, start a new flow
    name=None
    description=None
    data_type=None
    model_name=None
    ds_description=quote(ds_description)
    dvc_tag=dvc_tag_list
    file_path=file_path
    model=None
    learningRate=None
    batchSize=None
    epochs=None
    data_flow=1   #only run data pipline
    train_flow=0
    eval_flow=0
    deploy_flow=0
    
    background_tasks.add_task(run_selected_flow, name, description, 
    data_type, ds_name, ds_description, dvc_tag, file_path,
    model_name, model, learningRate, batchSize, epochs, 
    data_flow, train_flow, eval_flow, deploy_flow) 
    
    # Wait for task to start
    for _ in range(5):  # Check for 3 seconds
        time.sleep(1)  # Checking every 1 second
        if await check_if_flow_running():
            return {
                "status": "started",
                "message": f"Dataset {ds_name} uploaded successfully and processing started.",
                "file_path": file_path,
                "dvc_tag": dvc_tag_list
            }
        else:
            return {"status": "started", "message": "Please wait, flow is being added, not started yet!"}

    
    