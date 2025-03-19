
# Step 1: Start from the base Python image
# FROM python:3.9.17-slim

# # Step 2: Install dependencies for nvidia-smi and CUDA
FROM nvidia/cuda:11.8.0-cudnn8-devel-ubuntu20.04 

USER root

ARG API_SERVICE_PORT=$API_SERVICE_PORT
ARG DVC_DATA_STORAGE=$DVC_DATA_STORAGE

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        nvidia-container-toolkit \
        build-essential \
        curl \
        libfreetype6-dev \
        libpng-dev \
        libzmq3-dev \
        pkg-config \
        python3 \
        python3-dev \
        python3-pip \
        python3-setuptools \
        rsync \
        software-properties-common \
        unzip \
        git \
        zip \
        wget \
        vim \
        nano \
        sudo \
        npm \
        libgl1 \ 
        # for run cmd
        tini \ 
        # for DeepChecks
        libxml2-dev \
        libxslt-dev \
        # for prefect
        tzdata \
        # for opencv
        libsm6 \
        libxrender1 \
        libfontconfig1 \
        # for hdf5
        libhdf5-dev \
        # for TensorRT (8.6.1.6-1+cuda11.8)
        libnvinfer8=8.6.1.6-1+cuda11.8 \
        libnvinfer-plugin8=8.6.1.6-1+cuda11.8 \
        libnvonnxparsers8=8.6.1.6-1+cuda11.8 \
        libnvparsers8=8.6.1.6-1+cuda11.8 \
        libnvinfer-dev=8.6.1.6-1+cuda11.8 \
        libnvinfer-plugin-dev=8.6.1.6-1+cuda11.8 \
        libnvonnxparsers-dev=8.6.1.6-1+cuda11.8 \
        libnvparsers-dev=8.6.1.6-1+cuda11.8 \
        libnvinfer-headers-dev=8.6.1.6-1+cuda11.8 \
        libnvinfer-headers-plugin-dev=8.6.1.6-1+cuda11.8 \
        && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*


WORKDIR /service

COPY requirements.txt .

RUN pip install -r requirements.txt


RUN mkdir -p /home/ariya/central_storage/datasets && chmod -R 777 /home/ariya/central_storage/datasets
RUN mkdir -p /service/central_storage && chmod -R 777 /service/central_storage
RUN chown -R 1000:1000 /home/ariya/central_storage/datasets


# # Install conda
# RUN curl -O https://repo.anaconda.com/miniconda/Miniconda3-py38_23.3.1-0-Linux-${ARCH}.sh && \
#     bash Miniconda3-py38_23.3.1-0-Linux-${ARCH}.sh -f -b -p $CONDA_DIR


# # Put conda in path 
# # PIP_DEFAULT_TIMEOUT=100 to solve ReadTimeoutError when pip install large packages
# ENV PATH=$CONDA_DIR/bin:$PATH \
#     PIP_DEFAULT_TIMEOUT=100 

# NVIDIA Container Runtime
ENV NVIDIA_VISIBLE_DEVICES=all
ENV NVIDIA_DRIVER_CAPABILITIES=compute,utility
ENV LD_LIBRARY_PATH=/usr/local/cuda-11.8/lib64:$LD_LIBRARY_PATH
ENV PATH=/usr/local/cuda-11.8/bin:$PATH
ENV PYTHONPATH=/flows:$PYTHONPATH

COPY app/ app/

EXPOSE $API_SERVICE_PORT

WORKDIR /service/app

ENV GIT_DISCOVERY_ACROSS_FILESYSTEM=1

CMD umask 000 && chmod -R 777 /home/ariya/central_storage/datasets && chown -R 1000:1000 /home/ariya/central_storage/datasets && gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:${API_SERVICE_PORT} --timeout 120
