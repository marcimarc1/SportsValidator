FROM python:3.9
ENV SQLX_OFFLINE=true
WORKDIR /backend
COPY /pythonBackend/requirements.txt .
COPY /pythonBackend/active_learning_config.json .
RUN pip install --upgrade -r requirements.txt
COPY /pythonBackend/src /backend/src
WORKDIR /backend/src
RUN pip install .
WORKDIR /backend
CMD ["fastapi", "dev", "/backend/src/main.py","--host", "0.0.0.0", "--port", "80"]
