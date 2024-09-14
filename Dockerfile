# "Compiling" the frontend down to static html/css/js files
FROM node:16-alpine as builder
WORKDIR /frontend
COPY frontend .
RUN npm install
RUN npm run build

# Compiling the backend and importing the frontend static files
FROM rust:latest
ENV SQLX_OFFLINE=true
WORKDIR /frontend
COPY --from=builder /frontend/build ./build
WORKDIR /backend
COPY backend .
RUN mkdir -p uploads
RUN cargo build --release
CMD ["./target/release/backend"]