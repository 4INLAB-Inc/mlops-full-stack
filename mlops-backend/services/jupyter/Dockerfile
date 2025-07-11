# FROM ubuntu:20.04

# for use GPU in jupyter
FROM nvidia/cuda:11.8.0-cudnn8-devel-ubuntu20.04

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
        # for run docker cmd 
        docker.io \ 
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
        #for TensorRT (8.6.1.6-1+cuda11.8)
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

ARG NB_USER=$NB_USER
ARG NB_UID=$NB_UID
ARG NB_GID=100
ARG CONDA_DIR=$CONDA_DIR
ARG ARCH=$ARCH
ARG JUPYTER_PORT=$JUPYTER_PORT
ARG JUPYTER_API_PORT=$JUPYTER_API_PORT

ARG MLFLOW_ARTIFACT_ROOT=$MLFLOW_ARTIFACT_ROOT
ARG CENTRAL_STORAGE_PATH=$CENTRAL_STORAGE_PATH
ARG MAIN_CONDA_ENV_NAME=$MAIN_CONDA_ENV_NAME

# Add a new user and assign sudo privilege
RUN useradd --create-home --shell /bin/bash $NB_USER && \
    usermod -aG sudo $NB_USER
# disable password for sudo
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# Config path dir and permission anaconda
RUN mkdir -p $CONDA_DIR && \
    chown -R $NB_USER:$NB_USER $CONDA_DIR && \
    chmod -R go+rX $CONDA_DIR

# Config path dir and permission for mlflow artifacts storage
# NOTE: we don't need to do this for prefect storage since every file prefect produces
# they are stored in either postgresql or server's container itself
# but mlflow stores artifacts to client's container
RUN mkdir -p $MLFLOW_ARTIFACT_ROOT && \
    chown -R $NB_USER:$NB_USER $MLFLOW_ARTIFACT_ROOT && \
    chmod -R go+rX $MLFLOW_ARTIFACT_ROOT

# for model storage too!
RUN mkdir -p $CENTRAL_STORAGE_PATH/models $CENTRAL_STORAGE_PATH/ref_data && \
    chown -R $NB_USER:$NB_USER $CENTRAL_STORAGE_PATH && \
    chmod -R go+rX $CENTRAL_STORAGE_PATH


RUN mkdir -p /home/$NB_USER/.local/share/jupyter/runtime && \
    chown -R $NB_USER:$NB_USER /home/$NB_USER/.local && \
    chmod -R u+rwX /home/$NB_USER/.local

# Config permission user
USER $NB_USER
RUN chown $NB_USER /home/$NB_USER/
RUN chmod a+rwx /home/$NB_USER/
ENV HOME=/home/$NB_USER \
    SHELL=/bin/bash \
    NB_USER=$NB_USER \
    NB_UID=$NB_UID \
    NB_GID=$NB_GID
# this ENV is for installing pip package
ENV PATH=$HOME/.local/bin/:$PATH 
WORKDIR /home/$NB_USER

# Install conda
RUN curl -O https://repo.anaconda.com/miniconda/Miniconda3-py38_23.3.1-0-Linux-${ARCH}.sh && \
    bash Miniconda3-py38_23.3.1-0-Linux-${ARCH}.sh -f -b -p $CONDA_DIR


# Put conda in path 
# PIP_DEFAULT_TIMEOUT=100 to solve ReadTimeoutError when pip install large packages
ENV PATH=$CONDA_DIR/bin:$PATH \
    PIP_DEFAULT_TIMEOUT=100 

# update conda
RUN conda update -n base conda

# # add hdf5 here with conda is better than installing it with apt
# RUN sudo -E env "PATH=$PATH" conda install -c conda-forge -y notebook jupyterlab jupyterhub && \
#     jupyter notebook --generate-config --allow-root && \
#     echo 'c.ServerApp.root_dir = "/"' >> /home/$NB_USER/.jupyter/jupyter_notebook_config.py && \
#     echo 'c.ServerApp.ip = "0.0.0.0"' >> /home/$NB_USER/.jupyter/jupyter_notebook_config.py &&
#     # #password: 123456789
#     # echo "c.ServerApp.password = u'sha1:0ae9a92c3841:d81df7ba0b0224cae1230d0a9238df01e06953c9'" >> /home/$NB_USER/.jupyter/jupyter_notebook_config.py

# Cài đặt các gói cần thiết từ conda-forge
RUN conda install -c conda-forge -y notebook
RUN conda install -c conda-forge -y jupyterlab
RUN conda install -c conda-forge mamba -y
RUN mamba install -c conda-forge -y jupyterhub

# Tạo cấu hình Jupyter notebook
RUN jupyter notebook --generate-config --allow-root

# Cập nhật cấu hình Jupyter (PW = '4inlab')
RUN echo 'c.ServerApp.root_dir = "/"' >> /home/$NB_USER/.jupyter/jupyter_notebook_config.py
RUN echo 'c.ServerApp.ip = "0.0.0.0"' >> /home/$NB_USER/.jupyter/jupyter_notebook_config.py
RUN echo "c.ServerApp.token = ''">> /home/$NB_USER/.jupyter/jupyter_notebook_config.py
RUN echo "c.ServerApp.password = u'sha1:fd7abac89c07:434664d3a20ef0f4bb0bf7d88ee1947518beebc8'" >> /home/$NB_USER/.jupyter/jupyter_notebook_config.py

# Đảm bảo quyền cho thư mục .jupyter
RUN chown -R $NB_USER:$NB_USER /home/$NB_USER/.jupyter
RUN chmod -R a+rwx /home/$NB_USER/.jupyter


COPY ./requirements.txt $HOME/requirements.txt
RUN conda init bash && \
    # if it's not your 1st build, sometimes conda will reuse cache which is stored in /opt/anaconda3
    # at this stage, we are not root, so it can cause permission error. the next line's served to prevent this
    conda clean --all --force-pkgs-dirs && \
    conda create -n ${MAIN_CONDA_ENV_NAME} python=3.9

RUN conda run -n ${MAIN_CONDA_ENV_NAME} pip install -r requirements.txt && \
    conda run -n ${MAIN_CONDA_ENV_NAME} pip install jupyter -U && \
    conda run -n ${MAIN_CONDA_ENV_NAME} pip install gunicorn && \
    conda run -n ${MAIN_CONDA_ENV_NAME} ipython kernel install --name ${MAIN_CONDA_ENV_NAME} --user
    
RUN sudo mkdir -m 777 -p ./workspace/docker_workspace ./workspace/Python-Practices

# Jupyter listens to specified port
EXPOSE $JUPYTER_PORT
EXPOSE $JUPYTER_API_PORT


# Thêm biến môi trường toàn cục
ENV LD_PRELOAD=/usr/lib/${ARCH}-linux-gnu/libGLdispatch.so.0

# NVIDIA Container Runtime
ENV NVIDIA_VISIBLE_DEVICES=all
ENV NVIDIA_DRIVER_CAPABILITIES=compute,utility
ENV LD_LIBRARY_PATH=/usr/local/cuda-11.8/lib64:$LD_LIBRARY_PATH
ENV PATH=/usr/local/cuda-11.8/bin:$PATH

# ✅ Thêm biến môi trường TensorFlow để tránh lỗi GPU bị đầy
ENV TF_DISABLE_MKL=1
ENV TF_ENABLE_ONEDNN_OPTS=0
ENV LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu/:$LD_LIBRARY_PATH
ENV TF_TRT_ALLOW_ENGINE_NATIVE_SEGMENT_EXECUTION=1

# Disable NUMA warnings in TensorFlow
ENV TF_NUMA_NODE_OVERRIDE=0

# Enable TensorFlow Memory Growth to prevent full GPU allocation
ENV TF_FORCE_GPU_ALLOW_GROWTH=true

# Thêm vào .bashrc của người dùng
RUN echo "export LD_PRELOAD=/usr/lib/${ARCH}-linux-gnu/libGLdispatch.so.0" >> /home/$NB_USER/.bashrc

# Run Jupyter lab as Docker main process
# CMD jupyter lab --port ${JUPYTER_PORT}

# Run Jupyter and api of run_flow together
# RUN pip install fastapi==0.101.1 pydantic==1.7.4 uvicorn[standard]==0.23.2 gunicorn==20.1.0
WORKDIR /home/$NB_USER/workspace
ENV JUPYTER_RUNTIME_DIR=/tmp/jupyter_runtime
RUN mkdir -p $JUPYTER_RUNTIME_DIR && chmod -R 777 $JUPYTER_RUNTIME_DIR
CMD jupyter lab --port ${JUPYTER_PORT} --allow-root --no-browser
# & gunicorn -w 1 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:${JUPYTER_API_PORT} api_flow:app --timeout 1200
