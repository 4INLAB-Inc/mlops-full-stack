# 📁 models/conv1d_bilstm.py
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv1D, MaxPooling1D, LSTM, Bidirectional, Dropout, Dense
from tensorflow.keras.optimizers import Adam
from keras import backend as K
from tensorflow.keras.metrics import MeanAbsoluteError, MeanAbsolutePercentageError

def smape_keras(y_true, y_pred):
    epsilon = K.epsilon()
    denominator = K.abs(y_true) + K.abs(y_pred) + epsilon
    diff = K.abs(y_pred - y_true) / denominator
    return 200.0 * K.mean(diff)

def build_model(input_shape, conv_filters=128, kernel_size=3, lstm_units=128, dropout_rate=0.2, learning_rate=0.001):
    model = Sequential([
        Conv1D(conv_filters, kernel_size=kernel_size, activation="relu", input_shape=input_shape),
        MaxPooling1D(pool_size=2),
        Bidirectional(LSTM(lstm_units, return_sequences=True)),
        Dropout(dropout_rate),
        Bidirectional(LSTM(lstm_units // 2)),
        Dropout(dropout_rate),
        Dense(1)
    ])
    model.compile(
        optimizer=Adam(learning_rate=learning_rate),
        loss='mse',
        metrics=[
            MeanAbsoluteError(name="mae"),
            MeanAbsolutePercentageError(name="mape"),
            smape_keras
        ]
    )
    return model
