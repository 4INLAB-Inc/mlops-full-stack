from tasks.timeseries.data.dataset import prepare_time_series_data
from tasks.timeseries.train.train_model import train_timeseries_model
# from tasks.image.data.dataset import prepare_image_data
# from tasks.image.train.train_model import train_image_model

LOAD_DATA_FUNCS = {
    "timeseries": prepare_time_series_data,
    # "image": prepare_image_data,
    # ...
}

TRAIN_MODEL_FUNCS = {
    "timeseries": train_timeseries_model,
    # "image": train_image_model,
    # ...
}
