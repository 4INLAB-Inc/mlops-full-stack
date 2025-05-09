# 📁 tasks/timeseries/data/dataset.py
import os, json
import time
import pandas as pd
import numpy as np
from typing import List, Tuple, Union, Dict, Any
from dvc.repo import Repo
from git import Git, GitCommandError
from prefect import task, get_run_logger
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from deepchecks.vision import classification_dataset_from_directory
from deepchecks.vision.suites import train_test_validation
from datetime import datetime

#======================TASKS FOR DATA VALIDATION AND PREPARATION===========================

    
# Validate time series data (check nulls, duplicates, outliers)
def validate_timeseries_data(df: pd.DataFrame):
    logger = get_run_logger()
    report = {}

    # 1. Check for nulls
    null_counts = df.isnull().sum().to_dict()
    report["null_counts"] = null_counts
    logger.info(f"🧪 Null value check: {null_counts}")

    # 2. Check for duplicate rows
    duplicate_count = df.duplicated().sum()
    report["duplicate_rows"] = duplicate_count
    logger.info(f"🔁 Duplicate rows: {duplicate_count}")

    # 3. Check for outliers (only on numerical columns)
    outlier_report = {}
    for col in df.select_dtypes(include=[np.number]).columns:
        q1 = df[col].quantile(0.25)
        q3 = df[col].quantile(0.75)
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        outliers = ((df[col] < lower_bound) | (df[col] > upper_bound)).sum()
        outlier_report[col] = int(outliers)
    report["outliers"] = outlier_report
    logger.info(f"📈 Outlier check: {outlier_report}")

    return report


# @task(name='prepare_dvc_dataset')
def prepare_dataset(ds_root: str, ds_name: str, dvc_tag: str, dvc_checkout: bool = True):
    logger = get_run_logger()
    logger.info(f"Dataset name: {ds_name} | DVC tag: {dvc_tag}")
    ds_repo_path = os.path.join(ds_root, ds_name)

    annotation_path = os.path.join(ds_repo_path, 'annotation_df.csv')
    annotation_df = pd.read_csv(annotation_path)

    if dvc_checkout:
        git_repo = Git(ds_repo_path)
        try:
            git_repo.checkout(dvc_tag)
        except GitCommandError:
            valid_tags = git_repo.tag().split("\n")
            raise ValueError(f'Invalid dvc_tag. Existing tags: {valid_tags}')
        
        dvc_repo = Repo(ds_repo_path)
        logger.info('Running dvc diff to check whether files changed recently')
        start = time.time()
        result = dvc_repo.diff()
        end = time.time()
        logger.info(f'dvc diff took {end - start:.3f}s')
        if not result:  # No changes detected
            logger.info('Dataset has no changes.')
            ans = input('[ACTION] Proceed with dvc checkout anyway? (y/N): ')
            if ans.lower() == 'y':
                logger.info('Running dvc checkout...')
                start = time.time()
                dvc_repo.checkout()
                end = time.time()
                logger.info(f'Checkout completed in {end - start:.3f}s')
        else:
            logger.info('Detected modifications. Running dvc checkout...')
            start = time.time()
            dvc_repo.checkout()
            end = time.time()
            logger.info(f'Checkout completed in {end - start:.3f}s')
    else:
        logger.warning(f'You set dvc_checkout to False for {ds_name}. Please ensure the dataset is correct.')

    return ds_repo_path, annotation_df


#======================TASKS FOR TIME SERIES===========================

# @task(name='load_time_series_data')
def load_time_series_data(file_path: str, date_col: str, target_col: str):
    logger = get_run_logger()
    logger.info(f"Loading time series data from {file_path}...")

    try:
        # Determine file extension
        file_extension = os.path.splitext(file_path)[1].lower()

        # Load file based on its extension
        if file_extension == '.csv' or file_extension == '.txt':  # For CSV or TXT files
            data = pd.read_csv(file_path, delimiter=None if file_extension == '.csv' else '\t')
            file_format = "CSV/TXT"
        elif file_extension == '.xlsx':  # For Excel files
            data = pd.read_excel(file_path, engine='openpyxl')  # Use openpyxl engine for better compatibility
            file_format = "Excel"
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")

    except Exception as e:
        logger.error(f"❌ Error loading file: {e}")
        return None, None, None  # Return None if the file cannot be read

    # ✅ Check if the required columns exist
    missing_cols = []
    if date_col not in data.columns:
        missing_cols.append(date_col)
    if target_col not in data.columns:
        missing_cols.append(target_col)

    if missing_cols:
        logger.warning(f"⚠️ Warning: Missing columns {missing_cols}. Setting them to None.")
        for col in missing_cols:
            data[col] = None  # Assign None to missing columns

    # ✅ Convert the date column to datetime format if valid data exists
    if date_col in data.columns and data[date_col].notna().all():
        data[date_col] = pd.to_datetime(data[date_col], errors='coerce')

    # ✅ Sort by date_col, placing None values at the end
    data = data.sort_values(by=date_col, ascending=True, na_position='last')
    
    # ✅ Determine columns to exclude
    columns_to_exclude = [col for col in [date_col, target_col] if col in missing_cols]

    # ✅ Create a dataframe that excludes columns only if they were missing in the original file
    data_excluded = data.drop(columns=columns_to_exclude, errors='ignore')

    logger.info(f"✅ Loaded data with shape {data.shape}")
    return file_format, data_excluded, data[[date_col, target_col]] if target_col in data.columns else data[[date_col]]



# @task(name='prepare_time_series_data')
def prepare_time_series_data(data: pd.DataFrame, sequences: int, target_col: str) -> Tuple[np.ndarray, np.ndarray, MinMaxScaler]:

    logger = get_run_logger()
    logger.info(f"Preparing time series data with time squences={sequences} for column {target_col}...")

    if target_col not in data.columns:
        raise ValueError(f"❌ Error: Target column '{target_col}' not found in DataFrame.")

    # ✅ Handle NaN values
    if data[target_col].isnull().any():
        nan_count = data[target_col].isnull().sum()
        logger.warning(f"⚠️ Warning: Column '{target_col}' contains {nan_count} missing values. Filling with mean.")
        data[target_col] = data[target_col].fillna(data[target_col].mean())

    if data[target_col].isnull().all():
        logger.error(f"❌ Error: Column '{target_col}' contains only NaN values! Replacing with 0.")
        data[target_col] = data[target_col].fillna(0)

    # ✅ Ensure numeric
    if not np.issubdtype(data[target_col].dtype, np.number):
        logger.error(f"❌ Error: Column '{target_col}' must be numeric. Converting to float.")
        try:
            data[target_col] = data[target_col].astype(float)
        except ValueError:
            raise ValueError(f"❌ Error: Column '{target_col}' cannot be converted to numeric.")

    # ✅ Replace Inf values
    data[target_col] = data[target_col].replace([np.inf, -np.inf], np.nan)
    if data[target_col].isnull().any():
        logger.warning(f"⚠️ Warning: Column '{target_col}' contained infinite values. Filling with mean.")
        data[target_col] = data[target_col].fillna(data[target_col].mean())

    # ✅ Replace zeros with non-zero mean
    non_zero_values = data[target_col][data[target_col] != 0]
    if len(non_zero_values) > 0:
        non_zero_mean = non_zero_values.mean()
        zero_count = (data[target_col] == 0).sum()
        logger.info(f"Replacing {zero_count} zero values with non-zero mean: {non_zero_mean:.4f}")
        data[target_col] = data[target_col].replace(0, non_zero_mean)

    # ✅ Normalize
    scaler = MinMaxScaler(feature_range=(0, 1))
    target_values = scaler.fit_transform(data[[target_col]])

    # ✅ Sequence creation
    X, y = [], []
    for i in range(len(target_values) - sequences):
        X.append(target_values[i:i + sequences, 0])
        y.append(target_values[i + sequences, 0])

    X, y = np.array(X), np.array(y)
    X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)
    y = np.nan_to_num(y, nan=0.0, posinf=0.0, neginf=0.0)

    logger.info(f"✅ Data preparation complete: X shape={X.shape}, y shape={y.shape}")
    return X, y, scaler


# @task(name='split_time_series_data')
def split_time_series_data(X: np.ndarray, y: np.ndarray, test_size: float = 0.2, val_size: float = 0.1):
    logger = get_run_logger()
    logger.info("Splitting time series data...")

    if len(X) < 10:
        raise ValueError("Dataset is too small to split. Ensure it contains enough samples.")

    X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=test_size, shuffle=False)
    val_split = val_size / (1 - test_size)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=val_split, shuffle=False)

    logger.info(f"Split completed: Train {X_train.shape}, Val {X_val.shape}, Test {X_test.shape}")
    return X_train, X_val, X_test, y_train, y_val, y_test


#======================TASKS FOR CALCULATING STATISTICS AND QUALITY===========================

# @task(name='calculate_numerical_statistics')
def calculate_numerical_statistics(df: pd.DataFrame) -> Dict[str, Any]:
    logger = get_run_logger()
    logger.info("Calculating numerical statistics...")

    numerical_cols = df.select_dtypes(include=['number']).columns
    stats = {
        'mean': df[numerical_cols].mean().tolist(),
        'std': df[numerical_cols].std().tolist(),
        'min': df[numerical_cols].min().tolist(),
        'max': df[numerical_cols].max().tolist()
    }

    logger.info("Numerical statistics calculated successfully.")
    return stats


# @task(name='calculate_categorical_statistics')
def calculate_categorical_statistics(df: pd.DataFrame) -> Dict[str, Any]:
    logger = get_run_logger()
    logger.info("Calculating categorical statistics...")

    categorical_cols = df.select_dtypes(include=['object']).columns
    stats = {
        'unique': [df[col].nunique() for col in categorical_cols],
        'top': [df[col].mode().iloc[0] if not df[col].mode().empty else None for col in categorical_cols],
        'freq': [df[col].value_counts().iloc[0] if not df[col].value_counts().empty else None for col in categorical_cols],
    }

    logger.info("Categorical statistics calculated successfully.")
    return stats


def calculate_quality(df: pd.DataFrame) -> Dict[str, Any]:
    logger = get_run_logger()
    logger.info("🔍 Calculating data quality metrics...")

    # COMPLETENESS: % non-null values across all columns
    completeness = (1 - df.isnull().mean().mean()) * 100

    # CONSISTENCY: 1 - average uniqueness ratio across columns
    avg_unique_ratio = (df.nunique() / df.count()).mean()
    consistency = (1 - avg_unique_ratio) * 100

    # BALANCE: average entropy-like score per column
    balance_scores = []
    for col in df.columns:
        col_counts = df[col].value_counts(normalize=True)
        if len(col_counts) <= 1:
            balance_scores.append(0.0)
            continue
        std_dev = col_counts.std()
        balance_score = (1 - std_dev) * 100
        balance_scores.append(balance_score)

    balance = sum(balance_scores) / len(balance_scores)

    # Compose quality metrics
    quality_metrics = {
        "completeness": round(completeness, 2),
        "consistency": round(consistency, 2),
        "balance": round(balance, 2)
    }

    logger.info(f"📊 Quality Scores → Completeness: {quality_metrics['completeness']}%, "
                f"Consistency: {quality_metrics['consistency']}%, "
                f"Balance: {quality_metrics['balance']}%")

    return quality_metrics


# @task(name='calculate_features')
def calculate_features(df: pd.DataFrame) -> List[Dict[str, Union[str, int]]]:
    """
    Calculate the features in the dataset.
    For each column in the dataset, return its name, type, and the number of missing values.

    Args:
        df (pd.DataFrame): The dataset.

    Returns:
        List[Dict[str, Union[str, int]]]: List of dictionaries containing feature information.
    """
    logger = get_run_logger()
    logger.info("Calculating features information...")

    features = []
    for col in df.columns:
        feature_info = {
            'name': col,
            'type': str(df[col].dtype),
            'missing': df[col].isna().sum(),
            'description': f'Feature {col}'  # You can extend this with custom descriptions if needed
        }
        features.append(feature_info)

    logger.info("Feature information calculated successfully.")
    return features

#======================TASK FOR GENERATING FULL METADATA===========================

# Function to increment the version
def increment_version(version: str) -> str:
    major, minor, patch = map(int, version.split('.'))

    patch += 1

    if patch > 9:
        # Tính số lần vượt qua mỗi nhóm 10
        group = patch // 10
        minor += group
        patch = patch % 10

    if minor > 9:
        major += minor // 10
        minor = minor % 10

    return f"{major}.{minor}.{patch}"


# @task(name='generate_metadata_timeseries')
# Function to generate metadata for time series datasets
def generate_metadata_timeseries(df: pd.DataFrame, ds_id, ds_name: str, ds_author: str, data_type: str, ds_cfg: Dict[str, Any], updated_file_path: str) -> Dict[str, Any]:
    """
    Generates metadata for time series datasets, including statistics, quality measures, and sample data.
    """
    # Log process
    print(f"Generating metadata for dataset: {ds_name}")
    
     # Kiểm tra nếu df là None hoặc DataFrame trống
    if df is None or df.empty:
        raise ValueError("❌ DataFrame is empty or None. Cannot generate metadata.")

    # Compute dataset statistics and quality metrics
    numerical_stats = calculate_numerical_statistics(df)
    categorical_stats = calculate_categorical_statistics(df)
    quality_metrics = calculate_quality(df)

    # Extract feature details (column names and missing values)
    features = [{"name": col, "type": str(df[col].dtype), "missing": df[col].isna().sum()} for col in df.columns]

    # Get dataset file size and last modification date
    file_path = updated_file_path if updated_file_path else ds_cfg.get('file_path', '')
    size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
    last_modified = time.strftime("%Y-%m-%d", time.localtime(os.path.getmtime(file_path))) if os.path.exists(file_path) else "N/A"

    # Prepare versioning information
    version_info = ds_cfg.get("versions", [])
    ds_author = "Author"  # Change this if necessary

    if not version_info:  # If no version exists yet
        version_info = [{
            "version": "1.0.0",  # Initialize the first version as 1.0.0
            "date": datetime.now().strftime("%Y-%m-%d"),
            "changes": "Initial dataset setup.",
            "author": ds_author
        }]
    else:
        # Get the largest existing version
        # last_version = max(version_info, key=lambda x: x["version"])["version"]
        last_version = max(
                version_info,
                key=lambda x: list(map(int, x["version"].split(".")))
            )["version"]

        
        # Increment the version based on the largest existing version
        new_version = increment_version(last_version)
        
        version_info.append({
            "version": new_version,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "changes": "Updated dataset version.",
            "author": ds_author
        })
        

    # Prepare metadata dictionary
    metadata = {
        "id": ds_id,
        "name": ds_name,
        "type": data_type,
        "size": size,
        "lastModified": last_modified,
        "rows": len(df),
        "columns": len(df.columns),
        "status": "completed",
        "progress": 100,
        "tags": ds_cfg.get("dvc_tag", []),
        "description": ds_cfg.get("ds_description", "No description"),
        "version": "1.0.0",
        "format": "CSV/TXT",
        "features": features,
        "split_ratio":{
            "train_set": 12500,
            "val_set": 2500,
            "test_set": 5000,
            "outside_set": 8000,
        },
        "statistics": {
            "numerical": numerical_stats,
            "categorical": categorical_stats
        },
        "quality": quality_metrics,
        "columns_list": df.columns.tolist(),
        "data": df.head(50).to_dict(orient='records'),  # Store first 50 rows for preview
        "versions": version_info
    }

    print("Metadata generation complete.")
    return metadata


