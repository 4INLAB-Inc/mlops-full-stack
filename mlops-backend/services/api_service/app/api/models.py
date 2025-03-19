from fastapi import FastAPI, HTTPException, BackgroundTasks, File, UploadFile, Form
from utils.mlflow_utils import get_registered_all_models, get_model_details, register_model, get_mlflow_and_datasets_info, get_latest_model_details
from utils.class_base import (
    ModelOptions,  # 5. Model Options for Registration
    ModelInfoAll, ModelInfoDetail,  # 7. Detailed Model Information
)

from typing import List

# API endpoint to get registered models
async def get_all_registered_models_info() -> List[ModelInfoAll]:
    models = get_registered_all_models()  # Fetch models from mlflow_utils.py
    return models  # Convert to ModelInfoAll objects

# API endpoint to get registered models
async def get_all_registered_models_performance():
    models_performance = get_latest_model_details()  # Fetch models from mlflow_utils.py
    return models_performance  # Convert to ModelInfoAll objects


async def get_model_detailed_info_by_id(model_id: str): #-> List[ModelInfoDetail]:
    models_all = get_registered_all_models()

    # Find model name using the model_id
    model_name = None
    for model in models_all:
        if model['id'] == model_id:
            model_name = model['name']
            break
    
    if not model_name:
        raise HTTPException(status_code=404, detail="Model ID not found")
    
    model_detail = get_model_details(model_name, model_id)
    
    if isinstance(model_detail, list) and len(model_detail) > 0:
        return model_detail[0] 
    
    return model_detail  # Return as a ModelInfoDetail object
    

# Endpoint to get options for model registration
async def get_model_register_options() -> ModelOptions:
    model_options = get_mlflow_and_datasets_info()
    return model_options  # Return as a list of ModelOptions objects


async def create_model_registration(
    model_name: str = Form("MNIST Classification", example="MNIST Classification"),  # Default value with example
    model_description: str = Form("Image Classification Model", example="Image Classification Model"),  # Default value with example
    framework: str = Form("Pytorch", example="Pytorch"),  # Default value with example
    dataset: str = Form("MNIST", example="MNIST"),  # Default value with example
    author: str = Form("4INLAB", example="4INLAB"),  # Default value with example
    model_file: UploadFile = File(...),  # UploadFile to receive the model file
    image_file: UploadFile = File(...),  # UploadFile to receive the thumbail image file
):
    """
    API endpoint to register a model with MLflow.
    Receives model details and files, then stores and registers them with MLflow.
    """
    try:
        # Call register_model function from mlflow_utils.py to register the model
        result = register_model(
            model_name=model_name,
            model_description=model_description,
            framework=framework,
            dataset=dataset,
            author=author,
            model_file=model_file,  # Pass the uploaded model file
            image_file=image_file,  # Pass the uploaded thumbail image file
        )

        # If registration is successful, return the result
        if result['status'] == 'success':
            return result
        else:
            # If there's an error, raise an HTTP exception with status code 400
            raise HTTPException(status_code=400, detail=result['message'])
    except Exception as e:
        # General exception handling
        raise HTTPException(status_code=500, detail=str(e))
