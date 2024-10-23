#!/bin/sh

export PATH="${PATH}":/backend
export PYTHONPATH="${PYTHONPATH}":/backend/src

cd /backend
cd src && alembic upgrade head

#Development Command:
exec fastapi dev --host 0.0.0.0 --port 80

#Production Command:
exec fastapi run --host 0.0.0.0 --port 80
