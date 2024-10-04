# "Compiling" the frontend down to static html/css/js files
FROM node:16-alpine as builder
WORKDIR /frontend
COPY frontend .
RUN npm install
RUN npm run build

# Compiling the backend and importing the frontend static files
FROM python:3.9
ENV SQLX_OFFLINE=true
WORKDIR /frontend
COPY --from=builder /frontend/build ./build
WORKDIR /backend
COPY pythonBackend/requirements.txt .
RUN pip install --upgrade -r requirements.txt
COPY /pythonBackend/src /backend/src
# RUN chmod +x entrypoint.sh
# ENTRYPOINT["/backend/src/entrypoint.sh"]
CMD ["fastapi", "run", "/backend/src/main.py", "--host", "0.0.0.0", "--port", "8000"]