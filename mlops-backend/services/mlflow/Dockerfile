FROM python:3.9.17-slim

RUN apt-get update && apt-get install -y git

ARG MLFLOW_PORT=$MLFLOW_PORT

COPY requirements.txt .

RUN pip install -r requirements.txt

EXPOSE $MLFLOW_PORT

CMD mlflow server \
    --host 0.0.0.0 --port ${MLFLOW_PORT} \
    --backend-store-uri ${BACKEND_STORE_URI} \
    --default-artifact-root file://${MLFLOW_ARTIFACT_ROOT} \
    --serve-artifacts