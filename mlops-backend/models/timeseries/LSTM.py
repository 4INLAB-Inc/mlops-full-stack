from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dropout, Dense
from tensorflow.keras.optimizers import Adam
from keras import backend as K
from tensorflow.keras.metrics import MeanAbsoluteError, MeanAbsolutePercentageError

def smape_keras(y_true, y_pred):
    epsilon = K.epsilon()
    denominator = K.abs(y_true) + K.abs(y_pred) + epsilon
    diff = K.abs(y_pred - y_true) / denominator
    return 200.0 * K.mean(diff)

def build_model(input_shape, lstm_units=128, dropout_rate=0.2, learning_rate=0.001):
    model = Sequential([
        LSTM(lstm_units, return_sequences=True, input_shape=input_shape),
        Dropout(dropout_rate),
        LSTM(lstm_units),
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
