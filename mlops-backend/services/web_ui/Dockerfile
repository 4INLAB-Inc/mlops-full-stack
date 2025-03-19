FROM python:3.9.17-slim

ARG WEB_UI_PORT=$WEB_UI_PORT

USER root

RUN apt-get update && apt-get install -y curl

WORKDIR /service

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

# RUN pip install griffe

COPY app/ app/

EXPOSE $WEB_UI_PORT

WORKDIR /service/app

CMD uvicorn main:app --host 0.0.0.0 --port ${WEB_UI_PORT}