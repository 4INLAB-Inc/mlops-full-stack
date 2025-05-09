from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class FlowConfig(BaseModel):
    model_type: str
    epochs: int



#=========================Class for MLflow Experiment==========================
# Define Metrics class for the experiment
class Metrics_Value(BaseModel):
    accuracy: float = 0.0  # Accuracy value
    loss: float = 0.0  # Loss value

class Metrics_Graph(BaseModel):
    trainAcc: Optional[List[float]] = [1, 2, 3, 4, 5]
    valAcc: Optional[List[float]] = [1, 2, 3, 4, 5]
    trainLoss: Optional[List[float]] = [0.1, 0.12, 0.13, 0.14, 0.15]
    valLoss: Optional[List[float]] = [0.11, 0.12, 0.13, 0.14, 0.15]

# Define Experiment class
class Experiment(BaseModel):
    id: str               # Experiment ID (experiment_id)
    name: str             # Experiment name
    status: str
    dataset: str = "Stock_product"  # Dataset name, allows default value
    model: str = "LSTM"  # Model type, allows default value
    version: str="v1.0.1"
    framework: str="Tensorflow"
    metrics: Metrics_Value = Metrics_Value(accuracy=0.0, loss=0.0)  # Metrics such as accuracy, loss...
    metrics_history: Metrics_Graph
    hyperparameters: Dict[str, Any] = {"learningRate": 0.001, "batchSize": 16, "epochs": 50}  # Hyperparameters like learningRate, batchSize, epochs
    startTime: str='2025-02-20T10:00:00Z',
    endTime: str='2025-02-20T18:00:00Z',
    createdAt: str='2025-02-20T10:00:00Z',
    updatedAt: str='2025-02-20T10:00:00Z'
    runtime: str = "0h 1m 14s"  # Update date (string format)
    timestamp: str = "2025-02-20 14:25"  # Description of the run
    updatedAt: str = "2025-02-20"  # Update date (string format)
    description: str = "No Description"  # Description of the run

# Define the latest experiment data model
class Experiment_Lastest(BaseModel):
    id: str = "1"  # Experiment ID (experiment_id)
    name: str = "Timeseries Stock Prediction Training"  # Experiment name
    dataset: str = "Stock_product"  # Dataset name, allows default value
    model: str = "LSTM"  # Model type, allows default value
    status: str = "FINISHED"  # Status of the run
    accuracy: float = 0.0  # Accuracy value
    f1Score: float = 0.0  # F1 score value (if any, can add function to calculate)
    loss: float = 0.0  # Loss value
    runtime: str = "0h 1m 14s"  # Runtime
    created: str = "2025-02-20 14:25"  # Creation time
    hyperparameters: Dict[str, Any] = {"learningRate": 0.001, "batchSize": 16, "epochs": 50}  # Hyperparameters like learningRate, batchSize, epochs
    metrics: Metrics_Graph = {"trainAcc": [1, 2, 3, 4, 5], "valAcc": [1, 2, 3, 4, 5], "trainLoss": [1, 2, 3, 4, 5], "valLoss": [1, 2, 3, 4, 5]}  # Metrics such as accuracy, loss...

# Define the Run class for each run
class Run(BaseModel):
    id: str = "1"  # Run ID (experiment_id)
    run_id: str = "ed6c6d46b1b343f2bc724932d2f8b668"  # Run ID
    run_name: str = "stock_prediction_Conv1D_BiLSTM_ver001"  # Run name
    dataset: str = "Stock_product"  # Dataset name, allows default value
    model: str = "LSTM"  # Model type, allows default value
    status: str = "FINISHED"  # Run status
    accuracy: Optional[float] = 0.0  # Default value set to 0.0
    f1Score: Optional[float] = 0.0  # Default value set to 0.0
    loss: Optional[float] = 0.0  # Default value set to 0.0
    runtime: str = "0h 1m 14s"  # Runtime
    created: str = "2025-02-20 14:25"  # Creation time
    hyperparameters: Dict[str, Any] = {"learningRate": 0.001, "batchSize": 16, "epochs": 50}  # Hyperparameters like learningRate, batchSize, epochs
    metrics: Metrics_Graph = {"trainAcc": [1, 2, 3, 4, 5], "valAcc": [1, 2, 3, 4, 5], "trainLoss": [1, 2, 3, 4, 5], "valLoss": [1, 2, 3, 4, 5]}  # Metrics such as accuracy, loss...
    updatedAt: str = "2025-02-20"  # Update date (string format)
    description: str = "No Description"  # Description of the run

# Define Run_ID class to retrieve the run ID of each experiment
class Run_ID(BaseModel):
    id: str = "1"  # Run ID (experiment_id)
    run_id: str = "ed6c6d46b1b343f2bc724932d2f8b668"  # Run ID
    run_name: str = "stock_prediction_Conv1D_BiLSTM_ver001"  # Run name
    status: str = "FINISHED"  # Run status
    runtime: str = "0h 1m 14s"  # Runtime
    created: str = "2025-02-20 14:25"  # Creation time
    updatedAt: str = "2025-02-20"  # Update date (string format)
    description: str = "No Description"


class ExperimentOptions(BaseModel):
    dataset: List[str]
    model: List[str]
    
    
    
#=========================Class for MLflow Model==========================


# Define ModelOptions class for model registration
class ModelOptions(BaseModel):
    framework: List[str]
    dataset: List[str]

class ServingStatusAll(BaseModel):
    isDeployed: bool
    health: str
    
class ModelInfoAll(BaseModel):
    id: str
    name: str = "LSTM"
    description: str = "Version 3 of BiLSTM model based time-series stock prediction"
    framework: str = ""
    version: str = "3.0"
    status: str = 'Ready'
    accuracy: float = 98.7
    trainTime: str = "1h 15m 34s"
    dataset: str
    createdAt: str
    updatedAt: str
    thumbnail: str
    servingStatus: ServingStatusAll



class ModelResources(BaseModel):
    instanceType: str
    autoScaling: bool
    minInstances: int
    maxInstances: int
    memoryLimit: int
    timeout: int


class ModelMetrics(BaseModel):
    requestsPerMinute: int
    averageLatency: int
    errorRate: float
    successRate: float


class ModelDeploy(BaseModel):
    id: str
    name: str
    status: str
    url: str
    version: str
    createdAt: str  # ISO 8601 string, e.g., "2025-04-11T01:02:03+09:00"
    resources: ModelResources
    metrics: ModelMetrics



# Định nghĩa lớp để chứa thông tin của Dataset
class DatasetInfo(BaseModel):
    name: str
    size: str
    split: str
    format: str

# Định nghĩa lớp để chứa thông tin về Serving Status
class ServingStatusDetail(BaseModel):
    isDeployed: bool
    health: str
    requirements: Dict[str, str]
    latency: str
    throughput: str
    uptime: str

# Định nghĩa lớp để chứa các thông số Metric
class Metrics(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1Score: float
    auc: float
    latency: int
    throughput: int

# Định nghĩa lớp TrainingHistory
class TrainingHistory(BaseModel):
    epoch: int
    trainAccuracy: float
    trainLoss: float
    valAccuracy: float
    valLoss: float

# Định nghĩa lớp Version
class Version(BaseModel):
    version: str
    status: str
    createdAt: str
    metrics: Metrics
    trainingHistory: List[TrainingHistory]

# Định nghĩa lớp ModelInfo
class ModelInfoDetail(BaseModel):
    id: str
    name: str
    description: str
    framework: str
    version: str
    previousVersion: str
    status: str
    accuracy: float
    previousAccuracy: float
    trainTime: str
    dataset: DatasetInfo
    createdAt: str
    updatedAt: str
    deployedAt: str
    author: str
    task: str
    thumbnail: str
    servingStatus: ServingStatusDetail
    metrics: Metrics
    previousMetrics: Metrics
    versions: List[Version]


# Define ModelOptions class for model registration
class ModelOptions(BaseModel):
    framework: List[str]
    dataset: List[str]
    
    
    
    
#=========================Class for Datasets==========================


class DatasetFeature(BaseModel):
    name: str
    type: str
    missing: int
    
class DatasetSplit(BaseModel):
    train_set: int = 12500
    val_set: int = 2500
    test_set: int = 5000
    outside_set: int = 8000


class DatasetStatistics(BaseModel):
    numerical: Optional[Dict[str, List[Optional[float]]]] = None
    categorical: Optional[Dict[str, List]] = None


class DatasetQuality(BaseModel):
    completeness: float
    consistency: float
    balance: float


class Dataset(BaseModel):
    id: str
    name: str
    type: str
    version: str
    size: int
    lastModified: str
    createdAt: str
    updatedAt: str
    rows: int
    records: int
    columns: int
    status: str
    progress: int
    tags: List[str]
    description: str
    features: List[DatasetFeature]
    split_ratio: DatasetSplit
    statistics: DatasetStatistics
    quality: DatasetQuality
    qualityScore: float
    
    
# Dataset 버전 정보를 위한 데이터 모델 정의
class Quality(BaseModel):
    completeness: float  # 데이터 완전성
    consistency: float   # 데이터 일관성
    balance: float       # 데이터 균형

class Metadata(BaseModel):
    rows: int            # 행 수
    columns: int         # 열 수
    format: str          # 데이터 포맷

class DatasetVersion(BaseModel):
    version: str         # 버전
    date: str            # 수정 날짜
    changes: str         # 변경 사항
    author: str          # 작성자
    status: str          # 상태 (예: stable, deprecated)
    size: int            # 데이터 크기
    quality: Quality     # 데이터 품질
    metadata: Metadata   # 데이터 메타 정보 

