# Compiling the pythonBackend
FROM python:3.11
WORKDIR /pythonBackend
COPY ./requirements.txt /pythonBackend/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /pythonBackend/requirements.txt
COPY ./src /pythonBackend/src
CMD["fastapi", "run", "src/main.py", "--port,", "80"]