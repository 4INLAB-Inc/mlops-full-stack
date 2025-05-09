# 📁 tasks/timeseries/ai_models/model_loader.py
from models.timeseries.LSTM import build_model as build_lstm
from models.timeseries.GRU import build_model as build_gru
from models.timeseries.BiLSTM import build_model as build_bilstm
from models.timeseries.Conv1D_BiLSTM import build_model as build_conv1d_bilstm
from models.timeseries.Transformer import build_model as build_transformer
import logging
logger = logging.getLogger('main')

MODEL_BUILDERS = {
    "LSTM": build_lstm,
    "GRU": build_gru,
    "BiLSTM": build_bilstm,
    "Conv1D_BiLSTM": build_conv1d_bilstm,
    "Transformer": build_transformer,
}


# def build_model_by_type(model_type, input_shape, **kwargs):
#     if model_type not in MODEL_BUILDERS:
#         raise ValueError(f"Unsupported model type: {model_type}")
#     return MODEL_BUILDERS[model_type](input_shape, **kwargs)

SUPPORTED_ARGS_BY_MODEL = {
    "Transformer": ["d_model", "nhead", "num_layers", "dim_feedforward", "dropout", "output_size"],
    "LSTM": ["lstm_units", "dropout_rate", "learning_rate"],
    "GRU": ["lstm_units", "dropout_rate", "learning_rate"],
    "BiLSTM": ["lstm_units", "dropout_rate", "learning_rate"],
    "Conv1D_BiLSTM": ["conv_filters", "kernel_size", "dropout_rate", "lstm_units", "learning_rate"],
}

def build_model_by_type(model_type, input_shape, **kwargs):
    if model_type not in MODEL_BUILDERS:
        raise ValueError(f"Unsupported model type: {model_type}")

    supported_keys = SUPPORTED_ARGS_BY_MODEL.get(model_type, [])
    filtered_kwargs = {k: v for k, v in kwargs.items() if k in supported_keys}

    # ✅ Debug check
    logger.info(f"[DEBUG] Model type: {model_type}")
    logger.info(f"[DEBUG] Supported keys: {supported_keys}")
    logger.info(f"[DEBUG] Input kwargs: {kwargs}")
    logger.info(f"[DEBUG] Filtered kwargs: {filtered_kwargs}")
    logger.info(f"[DEBUG] Using build_model from: {MODEL_BUILDERS[model_type].__module__}")

    return MODEL_BUILDERS[model_type](input_shape, **filtered_kwargs)