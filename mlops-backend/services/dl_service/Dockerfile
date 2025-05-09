FROM python:3.9.17-slim

ARG DL_SERVICE_PORT=$DL_SERVICE_PORT

# for using curl in health check
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        curl \
        tzdata \
        # for hdf5
        # look like a new version of hdf5 require 'libhdf5-dev' package
        pkg-config \
        build-essential \
        libhdf5-dev \
        && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /service

COPY services/dl_service/requirements.txt .

RUN pip install -r requirements.txt

COPY services/dl_service/app/ app/
COPY tasks/ tasks/ 
COPY models/ models/ 

ENV PYTHONPATH=/service

EXPOSE $DL_SERVICE_PORT

WORKDIR /service/app

CMD gunicorn main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:${DL_SERVICE_PORT}