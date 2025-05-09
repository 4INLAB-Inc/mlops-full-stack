import os
import cv2
import base64
import time
import logging
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import load_model
from typing import Optional
from fastapi import FastAPI, Request, UploadFile, BackgroundTasks, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict
from utils import (GradCAM, tf_load_model, array_to_encoded_str, process_heatmap, 
                   prepare_db, load_drift_detectors, commit_results_to_db, 
                   commit_only_api_log_to_db, check_db_healthy,
                   load_model_from_metadata)
from typing import List
from sklearn.preprocessing import MinMaxScaler

# define Pydantic models for type validation
class Message(BaseModel):
    message: str

class PredictionResult(BaseModel):
    model_name: str
    prediction: List[float]    #Dict[str, float]
    overlaid_img: Optional[str] = None
    raw_hm_img: Optional[str] = None
    message: str

FORMAT = logging.Formatter(
    '%(asctime)s | %(levelname)-8s | %(filename)s:%(lineno)-3d | %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
print(f'Created logger with name {__name__}')
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
ch.setFormatter(FORMAT)
logger.addHandler(ch)

app = FastAPI()

# init model to None
model: tf.keras.models.Model = None
model_meta = None

# init drift detector models to None too
uae: tf.keras.models.Model = None
bbsd: tf.keras.models.Model = None

# prepare database
prepare_db()

@app.get("/health_check", response_model=Message, responses={404: {"model": Message}})
def health_check(request: Request):
    resp_code = 200
    resp_message = "Service is ready and healthy."
    try:
        check_db_healthy()
    except:
        resp_code = 404
        resp_message = "DB is not functional. Service is unhealthy."
    return JSONResponse(status_code=resp_code, content={"message": resp_message})

@app.put("/update_model/{run_name}/{model_metadata_file_path}", response_model=Message, responses={404: {"model": Message}}, tags=["Deploy trained model"])
def update_model(request: Request, model_metadata_file_path: str, run_name: str, background_tasks: BackgroundTasks):
    global model
    global model_meta
    global uae
    global bbsd
    start_time = time.time()
    logger.info('Updating model')
    try:
        # prepare drift detectors along with the model here
        # model, model_meta = tf_load_model(model_metadata_file_path, run_name)
        model, model_meta = load_model_from_metadata(model_metadata_file_path, run_name)
        # model, model_meta = tf_load_model('')
        # uae, bbsd = load_drift_detectors(model_metadata_file_path)
    except Exception as e:
        logger.error(f'Loading model failed with exception:\n {e}')
        time_spent = round(time.time() - start_time, 4)
        resp_code = 404
        resp_message = f"Updating model failed due to failure in model loading method with path parameter: {model_metadata_file_path}"
        background_tasks.add_task(commit_only_api_log_to_db, request, resp_code, resp_message, time_spent)
        return JSONResponse(status_code=resp_code, content={"message": resp_message})
    
    time_spent = round(time.time() - start_time, 4)
    resp_code = 200
    resp_message = "Update the model successfully"
    background_tasks.add_task(commit_only_api_log_to_db, request, resp_code, resp_message, time_spent)
    return {"message": resp_message}


@app.post('/predict_image', response_model=PredictionResult, responses={404: {"model": Message}}, tags=["Prediction UI"])
async def predict(request: Request, file: UploadFile, background_tasks: BackgroundTasks):
    start_time = time.time()
    logger.info('NEW REQUEST')
    if model is None:
        logger.error('There is no model loaded. You have to setup model with the /update_model endpoint first.')
        time_spent = round(time.time() - start_time, 4)
        resp_code = 404
        resp_message = "No model. You have to setup model with the /update_model endpoint first."
        background_tasks.add_task(commit_only_api_log_to_db, request, resp_code, resp_message, time_spent)
        return JSONResponse(status_code=resp_code, content={"message": resp_message})
    
    try:
        image_bytes = file.file.read()
        image_array = np.frombuffer(image_bytes, np.uint8)
        ori_image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        if ori_image is None:
            raise ValueError("Reading input image return None")
    except Exception as e:
        logger.error(f'Reading image file failed with exception:\n {e}')
        time_spent = round(time.time() - start_time, 4)
        resp_code = 404
        resp_message = "Reading input image file failed. Incorrect or unsupported image types."
        background_tasks.add_task(commit_only_api_log_to_db, request, resp_code, resp_message, time_spent)
        return JSONResponse(status_code=resp_code, content={"message": resp_message})
        
    # preprocess
    logger.info('Start input Preprocessing')
    image = cv2.resize(ori_image, (model_meta['input_size']['w'], model_meta['input_size']['h']))
    image = image / 255.0
    image = np.expand_dims(image, axis=0)
    logger.info('Finished input preprocessing')

    # predict
    logger.info('Start predicting')
    pred = model.predict(image)
    pred = pred[0]
    pred_idx = np.argmax(pred)
    logger.info('Obtained prediction')

    logger.info('Extracting features with drift detectors')
    # by default postgresql store array in 'double precision' which is equivalent to float64
    uae_feats = uae.predict(image)[0].astype(np.float64)
    # if bbsd's already used the last layer meaning it has the same output as our main classifier
    # so there is no need to predict again.
    if model_meta['drift_detection']['bbsd_layer_idx'] in (-1, len(model.layers)):
        bbsd_feats = pred.copy().astype(np.float64)
    else:
        bbsd_feats = bbsd.predict(image)[0].astype(np.float64)
    logger.info('Extracted features')

    # create heatmap (gradcam)
    logger.info('Computing heatmap')
    try:
        cam = GradCAM(model, pred_idx)
        heatmap = cam.compute_heatmap(image)
    except Exception as e:
        logger.error(f'Computing GradCAM failed with exception:\n {e}')
        time_spent = round(time.time() - start_time, 4)
        resp_code = 404
        resp_message = "Computing GradCAM failed. Model architecture might not be able to apply GradCAM."
        background_tasks.add_task(commit_only_api_log_to_db, request, resp_code, resp_message, time_spent)
        return JSONResponse(status_code=resp_code, content={"message": resp_message})
    logger.info('Obtained heatmap')
    
    # post-process & overlay
    logger.info('Overlaying heatmap onto the input image')
    heatmap = cv2.resize(heatmap, (ori_image.shape[1], ori_image.shape[0]))
    heatmap = process_heatmap(heatmap)
    (heatmap, overlaid_img) = cam.overlay_heatmap(heatmap, ori_image, alpha=0.2)
    logger.info('Finished overlaying heatmap')
    
    # format prediction
    pred_dict = dict(zip(model_meta['classes'], pred.tolist()))
    overlaid_str = array_to_encoded_str(overlaid_img)
    raw_hm_str = array_to_encoded_str(heatmap)
    ori_img_str = array_to_encoded_str(ori_image) # this is used for logging only
    logger.info('SUCCESS')

    time_spent = round(time.time() - start_time, 4)
    resp_code = 200
    resp_message = "Success"
    background_tasks.add_task(commit_results_to_db, request, resp_code, resp_message, time_spent,
                              model_meta['model_name'], ori_img_str, raw_hm_str, overlaid_str, pred_dict,
                              uae_feats, bbsd_feats)
    
    return {'model_name': model_meta['model_name'], 'prediction': pred_dict, 'overlaid_img': overlaid_str, 'raw_hm_img': raw_hm_str, 'message': resp_message}



# @app.post('/predict_timeseries', response_model=PredictionResult, responses={404: {"model": PredictionResult}})
# async def predict_timeseries():#input_data: List[float]):
#     start_time = time.time()
#     input_data=[0.2553731473997033, 0.38911381923638555, 0.22703723166940448, 
#              0.5661436997242244, 0.37795856939489314, 0.5587811252689093, 
#              0.580056889772573, 0.007304623031855528, 0.6204412497908085, 
#              0.8509335287075362, 0.685410140945885, 0.09784586826664143, 
#              0.33823983799383484, 0.4004021675399967, 0.5637511745424482, 
#              0.5090618427091982, 0.7760193531957557, 0.5514843081642373, 
#              0.16647747468801988, 0.9326450611187295, 0.21211768009127974, 
#              0.11643935023823782, 0.47359056848800773, 0.2973714070294379, 
#              0.22736091099133415, 0.18139237847048828, 0.4842742972887477, 
#              0.3176104791602834, 0.9176824923494071, 0.4688956983272786]
    
#     logger.info("Received a request for time series prediction")

#     if model is None:
#         error_message = "No model loaded. Please set up a model with the /update_model endpoint first."
#         logger.error(error_message)
#         time_spent = round(time.time() - start_time, 4)
#         return JSONResponse(status_code=404, content={"message": error_message})

#     try:
#         # Validate input length
#         expected_length = model_meta["input_size"]["h"]
#         if len(input_data) != expected_length:
#             raise ValueError(
#                 f"Invalid input format. Expected a list of {expected_length} lists, each containing one float."
#             )

#         # Convert input data to numpy array with the correct shape
#         timeseries_data = np.array(input_data).reshape(1, expected_length, 1).tolist()
#         # logger.info(f"Input data reshaped to: {timeseries_data.shape}")

#         # Perform prediction
#         predictions = model.predict(timeseries_data)
#         predicted_value = float(predictions[0][0])
#         logger.info(f"Predicted value: {predicted_value}")

#         time_spent = round(time.time() - start_time, 4)
#         return {
#             "model_name": model_meta["model_name"],
#             "prediction": predicted_value,
#             "message": "Prediction successful"
#         }
#     except Exception as e:
#         logger.error(f"Prediction failed with exception: {e}")
#         time_spent = round(time.time() - start_time, 4)
#         error_message = f"Prediction failed: {str(e)}"
#         return JSONResponse(status_code=404, content={"message": error_message})

class PredictionInput(BaseModel):
    input_data: List[float]
    prediction_step: int

class PredictionTimeSeriesResult(BaseModel):
    model_name: str
    prediction: List[float]    #Dict[str, float]
    message: str
    
@app.post('/predict_timeseries', response_model=PredictionTimeSeriesResult, responses={404: {"model": PredictionTimeSeriesResult}}, tags=["Prediction UI"])
async def predict_timeseries(
    request_data: PredictionInput
):
    start_time = time.time()
    input_data = request_data.input_data
    prediction_step = request_data.prediction_step
    logger.info("Received a request for time series prediction")

    if model is None:
        error_message = "No model loaded. Please set up a model with the /update_model endpoint first."
        logger.error(error_message)
        time_spent = round(time.time() - start_time, 4)
        return JSONResponse(status_code=404, content={"message": error_message})

    try:
        # Validate input length
        expected_length = model_meta["input_size"]["h"]
        # if len(input_data) != expected_length:
        #     raise ValueError(
        #         f"Invalid input format. Expected a list of {expected_length} floats."
        #     )
            
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_data = scaler.fit_transform(pd.DataFrame(input_data))
        # Convert input data to numpy array with the correct shape
        # 
        # logger.info(f"Input data reshaped to: {timeseries_data.shape}")

        # Perform prediction
        # Make predictions
        
        # timeseries_data = np.array(scaled_data).reshape(1, expected_length, 1).tolist()
        # predictions = model.predict(timeseries_data)
        # predicted_value = float(predictions[0][0])
        predictions=[]
        if len(scaled_data) >= (expected_length + prediction_step):
            for start_index in range(len(scaled_data) - expected_length - prediction_step + 1):
                model_input_data = scaled_data[start_index:start_index + expected_length].reshape(1, expected_length, 1)
                predicted_values = []
                

                for _ in range(prediction_step):
                    predicted_stock = model.predict(model_input_data)
                    predicted_values.append(predicted_stock[0, 0])
                    model_input_data = np.append(model_input_data[:, 1:, :], [[[predicted_stock[0, 0]]]], axis=1)

                # Save predicted values
                predictions.extend(scaler.inverse_transform(np.array(predicted_values).reshape(-1, 1)).flatten())
        elif len(scaled_data) < (expected_length + prediction_step):
            model_input_data = scaled_data[0:0 + expected_length].reshape(1, expected_length, 1)
            predicted_values = []
        
            for _ in range(prediction_step):
                predicted_stock = model.predict(model_input_data)
                predicted_values.append(predicted_stock[0, 0])
                model_input_data = np.append(model_input_data[:, 1:, :], [[[predicted_stock[0, 0]]]], axis=1)

            # Save predicted values
            predictions.extend(scaler.inverse_transform(np.array(predicted_values).reshape(-1, 1)).flatten())
            
        logger.info(f"predicted value: {predictions}")
            

        time_spent = round(time.time() - start_time, 4)
        
        logger.info(f"Time Spend for Predict: {time_spent}")
        
        return {
            "model_name": model_meta["model_name"],
            "prediction": predictions,
            "message": "Prediction successful"
        }
        
        
    except Exception as e:
        logger.error(f"Prediction failed with exception: {e}")
        time_spent = round(time.time() - start_time, 4)
        error_message = f"Prediction failed: {str(e)}"
        return JSONResponse(status_code=404, content={"message": error_message})


