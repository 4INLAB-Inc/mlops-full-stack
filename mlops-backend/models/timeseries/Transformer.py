import torch
import torch.nn as nn

class TimeSeriesTransformer(nn.Module):
    def __init__(self, input_size, d_model=64, nhead=4, num_layers=2, dim_feedforward=128, dropout=0.1, output_size=1):
        super(TimeSeriesTransformer, self).__init__()
        self.input_projection = nn.Linear(input_size, d_model)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model, nhead=nhead,
            dim_feedforward=dim_feedforward, dropout=dropout, batch_first=True
        )
        self.transformer_encoder = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        self.decoder = nn.Linear(d_model, output_size)

    def forward(self, x):
        """
        x: (batch_size, seq_len, input_size)
        """
        x = self.input_projection(x)
        x = self.transformer_encoder(x)
        x = self.decoder(x[:, -1, :])  # Lấy embedding bước cuối
        return x

def build_model(input_shape, **kwargs):
    if isinstance(input_shape, (list, tuple)):
        input_size = input_shape[-1]
    else:
        input_size = input_shape
    
    # ✅ Remove output_size from kwargs to avoid duplication
    output_size = kwargs.pop("output_size", 1)
    
    kwargs.pop("batch_size", None)
    kwargs.pop("learning_rate", None)
    kwargs.pop("lstm_units", None)
    kwargs.pop("conv_filters", None)
    kwargs.pop("kernel_size", None)
    kwargs.pop("dropout_rate", None)
    kwargs.pop("epochs", None)
    
    return TimeSeriesTransformer(input_size=input_size, output_size=output_size, **kwargs)
