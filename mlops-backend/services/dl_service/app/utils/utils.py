import os
import cv2
import base64
import logging
import yaml
import numpy as np
import tensorflow as tf
from PIL import Image
from io import BytesIO
from tensorflow.keras.layers import Dense, Flatten, Conv2D, InputLayer
from tensorflow.keras.models import load_model, Model

import tensorflow.keras.backend as K
from tensorflow.keras.metrics import MeanAbsoluteError, MeanAbsolutePercentageError
from tasks.timeseries.utils.model_loader import build_model_by_type
import torch

def smape_keras(y_true, y_pred):
    epsilon = K.epsilon()
    denominator = K.abs(y_true) + K.abs(y_pred) + epsilon
    diff = K.abs(y_pred - y_true) / denominator
    return 200.0 * K.mean(diff)

CENTRAL_STORAGE_PATH = os.getenv('CENTRAL_STORAGE_PATH', '/service/central_storage')

logger = logging.getLogger('main')

# the best practice is to retrieve the model & config from a model registry service
# and this function will implement the logic to download files to local storage and read them
# def retrieve_metadata_file(model_metadata_file_path: str):
#     model_meta_path = os.path.join(CENTRAL_STORAGE_PATH, 'models', model_metadata_file_path)
#     logger.info(f'Loading the model metadata from {model_meta_path}')
#     with open(model_meta_path, 'r') as f:
#         metadata = yaml.safe_load(f)
#     return metadata
    
# def tf_load_model(model_metadata_file_path: str):
#     metadata = retrieve_metadata_file(model_metadata_file_path)
#     model_dir = os.path.join(CENTRAL_STORAGE_PATH, 'models', metadata['model_name'])
#     logger.info(f'Loading the model from {model_dir}')
#     model = load_model(model_dir)
#     logger.info('Loaded successfully')
#     return model, metadata

def retrieve_metadata_file(model_metadata_file_path: str, run_name: str):
    
    model_meta_path = os.path.join(CENTRAL_STORAGE_PATH, 'models','timeseries', run_name, model_metadata_file_path)
    # model_meta_path='/service/central_storage/models/timeseries/stock_prediction_BiLSTM_ver004/stock_prediction.yaml'
    logger.info(f'Loading the model metadata from {model_meta_path}')
    
    # Kiểm tra sự tồn tại của file
    if not os.path.exists(model_meta_path):
        logger.error(f"Metadata file not found: {model_meta_path}")
        raise FileNotFoundError(f"Metadata file not found: {model_meta_path}")

    with open(model_meta_path, 'r') as f:
        metadata = yaml.safe_load(f)

    logger.info(f'Metadata loaded successfully: {metadata}')
    return metadata

def tf_load_model(model_metadata_file_path: str, run_name: str):
    logger.info(f"[tf_load_model] run_name: {run_name}, metadata file: {model_metadata_file_path}")
    metadata = retrieve_metadata_file(model_metadata_file_path, run_name)
    
    # Lấy đường dẫn đến mô hình từ metadata
    model_dir = os.path.join(CENTRAL_STORAGE_PATH, 'models','timeseries', run_name)
    if not model_dir:
        logger.error("Missing 'saved_model_path' in metadata file.")
        raise KeyError("Missing 'saved_model_path' in metadata file.")

    # Kiểm tra sự tồn tại của model_dir
    if not os.path.exists(model_dir):
        logger.error(f"Model directory not found: {model_dir}")
        raise FileNotFoundError(f"Model directory not found: {model_dir}")

    logger.info(f'Loading the model from {model_dir}')
    custom_objects = {
                        "smape_keras": smape_keras,
                        "MeanAbsoluteError": MeanAbsoluteError,
                        "MeanAbsolutePercentageError": MeanAbsolutePercentageError
                    }
    model = load_model(model_dir, custom_objects=custom_objects)
    logger.info('Model loaded successfully')
    return model, metadata

def load_model_from_metadata(model_metadata_file_path: str, run_name: str):
    logger.info(f"[load_model_from_metadata] run_name: {run_name}, metadata file: {model_metadata_file_path}")

    metadata = retrieve_metadata_file(model_metadata_file_path, run_name)
    framework = metadata.get("framework", "tensorflow").lower()

    model_dir = os.path.join(CENTRAL_STORAGE_PATH, 'models', 'timeseries', run_name)
    if not os.path.exists(model_dir):
        logger.error(f"❌ Model directory not found: {model_dir}")
        raise FileNotFoundError(f"Model directory not found: {model_dir}")

    if framework == "tensorflow":
        logger.info(f"🔁 Loading TensorFlow model from: {model_dir}")

        # Step 1: Find .h5 model file
        try:
            h5_files = [f for f in os.listdir(model_dir) if f.endswith(".h5")]
            if not h5_files:
                raise FileNotFoundError(f"No .h5 model file found in directory: {model_dir}")
            h5_path = os.path.join(model_dir, h5_files[0])
            logger.info(f"📂 Found model weights file: {h5_path}")
        except Exception as e:
            logger.error(f"❌ Error while locating .h5 file: {e}")
            raise

        # Step 2: Parse input shape
        try:
            input_size = metadata.get("input_size")
            if isinstance(input_size, dict):
                input_shape = (input_size["h"], input_size["w"])
            else:
                input_shape = input_size  # fallback
            logger.info(f"📐 Input shape resolved to: {input_shape}")
        except Exception as e:
            logger.error(f"❌ Error while parsing input shape: {e}")
            raise

        # Step 3: Get model type and hparams
        try:
            model_type = metadata.get("model_type")
            hparams = metadata.get("hparams", {}).copy()
            hparams.pop("batch_size", None)
            hparams.pop("epochs", None)
            hparams.pop("learning_rate", None)
            logger.info(f"⚙️  Building model: {model_type} with hparams: {hparams}")
        except Exception as e:
            logger.error(f"❌ Error while extracting model_type or hparams: {e}")
            raise

        # Step 4: Rebuild model and load weights
        model_instance = build_model_by_type(model_type, input_shape=input_shape, **hparams)
        logger.info(f"✅ Build model successfully from: {h5_path}")
        try:
            model_instance.load_weights(h5_path)
            logger.info(f"✅ Loaded TensorFlow weights successfully from: {h5_path}")
            model = model_instance
        except Exception as e:
            logger.error(f"❌ Error while building model or loading weights: {e}")
            raise
        
        
    elif framework == "pytorch":
        # model_file = os.path.join(model_dir, "saved_model.pth")
        model_files = [f for f in os.listdir(model_dir) if f.endswith(".pth")]
        if not model_files:
            raise FileNotFoundError(f"No .pth model file found in directory: {model_dir}")
        model_file = os.path.join(model_dir, model_files[0])
        if not os.path.exists(model_file):
            raise FileNotFoundError(f"❌ PyTorch model file not found at {model_file}")
        
        input_size = metadata.get("input_size")
        if isinstance(input_size, dict):
            input_size = (input_size["h"], input_size["w"])

        
        model_type = metadata.get("model_type")
        hparams = metadata.get("hparams", {})
        model_class = build_model_by_type(model_type, input_shape=input_size, **hparams)

        model_class.load_state_dict(torch.load(model_file, map_location=torch.device('cpu')))
        model_class.eval()
        model = model_class
        logger.info(f"🧠 Loaded PyTorch model from: {model_file}")
    else:
        raise ValueError(f"Unsupported framework: {framework}")

    logger.info("✅ Model loaded successfully")
    return model, metadata

def load_drift_detectors(model_metadata_file_path: str):
    metadata = retrieve_metadata_file(model_metadata_file_path)
    drift_cfg = metadata['drift_detection']
    uae_dir = os.path.join(CENTRAL_STORAGE_PATH, 'models', metadata['model_name'] + drift_cfg['uae_model_suffix'])
    bbsd_dir = os.path.join(CENTRAL_STORAGE_PATH, 'models', metadata['model_name'] + drift_cfg['uae_model_suffix'])
    logger.info(f'Loading the UAE model from {uae_dir}')
    uae = load_model(uae_dir)
    logger.info('Loaded UAE model successfully')
    logger.info(f'Loading the BBSD model from {bbsd_dir}')
    bbsd = load_model(bbsd_dir)
    logger.info('Loaded BBSD model successfully')
    return uae, bbsd

def array_to_encoded_str(image: np.ndarray):
    pil_img = Image.fromarray(cv2.cvtColor(image,cv2.COLOR_BGR2RGB))
    img_buffer = BytesIO()
    pil_img.save(img_buffer, format='PNG', optimize = True)
    byte_data = img_buffer.getvalue()
    # note: compare to base64.b64encode(byte_data).decode('utf-8')
    img_str = base64.encodebytes(byte_data).decode("utf-8")
    return img_str

def process_heatmap(heatmap: np.ndarray):
    # process heatmap: blur & thr for a more elegant heatmap
    out_heatmap = heatmap.copy()
    # thresholding
    thr = 0.05 * 255
    out_heatmap[out_heatmap<thr] = 0
    
    hm_size = out_heatmap.shape
    blur_ksize = (int(0.05*hm_size[0]),int(0.05*hm_size[1]))
    out_heatmap = cv2.blur(out_heatmap, blur_ksize)
    
    return out_heatmap
    