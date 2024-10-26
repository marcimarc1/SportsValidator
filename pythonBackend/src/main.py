from contextlib import asynccontextmanager
import os
# import aiofiles
import logging
from typing import List
from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from .routers import annotation, user
from alembic.config import Config
from alembic import command

log = logging.getLogger('uvicorn')

def run_migrations():
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option('script_location', "src/alembic")
    alembic_cfg.set_main_option('sqlalchemy.url',
                                os.getenv('DATABASE_URL', 'postgresql://user:pass@localhost:5432/db'))
    alembic_cfg.set_main_option('prepend_sys_path', '.')
    command.upgrade(alembic_cfg, 'head')

@asynccontextmanager
async def lifespan(app_: FastAPI):
    log.info("Starting up...")
    log.info("run migration")
    # run_migrations()
    yield
    log.info("Shutting down...")

# App Creation
app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Bind Routers from Router Directory
app.include_router(annotation.router)
app.include_router(user.router)


@app.get("/")
async def check_app():
    return {"status": "App Running!"}

# @app.post("/upload")
# async def upload(files: List[UploadFile]):
#     for file in files:
#         # Todo: Add correct path for upload items
#         async with aiofiles.open("path", 'wb') as out_file:
#             while content := await file.read(1024):
#                 await out_file.write(content)
#
#     return "Files successfully uploaded"
