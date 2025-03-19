import os
import requests
from fastapi import FastAPI, Request, HTTPException, Form
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse
from typing import List
from pydantic import BaseModel

import plotly.express as px
import plotly.io as pio
from utils.prefect_client import fetch_flow_runs, get_flow_runs_dataframe
import asyncio

from datetime import datetime, timedelta
import pytz  # Dùng để chuyển đổi múi giờ

from fastapi.middleware.cors import CORSMiddleware

# Lấy URL endpoint dự đoán từ biến môi trường
PREDICT_ENDPOINT = os.getenv("PREDICT_ENDPOINT", "http://nginx:${NGINX_PORT}/predict_timeseries/")
# PREDICT_ENDPOINT = "http://192.168.219.52:4242/predict_timeseries"

# Khởi tạo FastAPI
app = FastAPI()

# Mount static files và templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Endpoint GET: Giao diện chính
@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("predict_timeseries.html", {"request": request})

@app.post("/call_api")
async def call_timeseries_api(request: Request, timeseries: str = Form(...)):
    # Convert the input timeseries from a comma-separated string to a list of floats
    timeseries_data = [float(x.strip()) for x in timeseries.split(",")]
    
    # Prepare the payload
    payload = {
        "input_data": timeseries_data,
        "prediction_step": 7
    }

    try:
        # Call the prediction API
        response = requests.post(PREDICT_ENDPOINT, 
                                 json=payload,
                                 headers={"Content-Type": "application/json"})
        response.raise_for_status()
        result = response.json()
        
        print(result)

        # Extract predictions and model name
        pred_result = result.get("prediction")
        model_name = result.get("model_name")
        
        print("Predicted Result:", pred_result)

        # Render the template with predictions
        return templates.TemplateResponse(
            "predict_timeseries.html",
            {
                "request": request,  # Đảm bảo rằng request được truyền vào đây
                "model_name": model_name,
                "pred_result": pred_result,
            }
        )
    except requests.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to call prediction endpoint: {PREDICT_ENDPOINT} {str(e)}"
        )
        
        
        
@app.get("/flow-monitoring", response_class=HTMLResponse)
def flow_monitoring(request: Request):
    """
    Render the main HTML page with the placeholder for the graph.
    """
    return templates.TemplateResponse("flow_monitoring.html", {"request": request})