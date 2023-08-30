#!/bin/sh

# This script is supposed to be executed from the top level of the repository

npm run --prefix ./frontend build
rm -rf backend/react-app
mv frontend/build backend/react-app

docker compose up --build