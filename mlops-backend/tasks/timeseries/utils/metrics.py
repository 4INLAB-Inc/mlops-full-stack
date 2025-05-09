# 📁 tasks/timeseries/utils/metrics.py
import numpy as np
import tensorflow.keras.backend as K
import torch


#For Tensorflow
def smape(y_true, y_pred):
    return 100 / len(y_true) * np.sum(2 * np.abs(y_pred - y_true) / (np.abs(y_true) + np.abs(y_pred)))

def smape_keras(y_true, y_pred):
    epsilon = K.epsilon()
    denominator = K.abs(y_true) + K.abs(y_pred) + epsilon
    diff = K.abs(y_pred - y_true) / denominator
    return 200.0 * K.mean(diff)


#For Torch
def mean_absolute_error(y_true, y_pred):
    return torch.mean(torch.abs(y_true - y_pred)).item()

def symmetric_mean_absolute_percentage_error(y_true, y_pred):
    epsilon = 1e-8
    denominator = (torch.abs(y_true) + torch.abs(y_pred)) + epsilon
    smape = torch.mean(2.0 * torch.abs(y_pred - y_true) / denominator)
    return (smape * 100).item()
