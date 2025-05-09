# 📁 models/__init__.py
from .LSTM import build_model as build_lstm
from .GRU import build_model as build_gru
from .BiLSTM import build_model as build_bilstm
from .Conv1D_BiLSTM import build_model as build_conv1d_bilstm
from .Transformer import build_model as build_transformer

# Registry of model builders
MODEL_BUILDERS = {
    "LSTM": build_lstm,
    "GRU": build_gru,
    "BiLSTM": build_bilstm,
    "Conv1D_BiLSTM": build_conv1d_bilstm,
    "Transformer": build_transformer,
}

def get_model_builder(model_type):
    if model_type not in MODEL_BUILDERS:
        raise ValueError(f"Unsupported model type: {model_type}")
    return MODEL_BUILDERS[model_type]