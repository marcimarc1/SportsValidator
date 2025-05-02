from contextlib import asynccontextmanager
import os
import uvicorn
import logging
from fastapi import FastAPI, UploadFile
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

from config import settings
from routers import annotation, user, game, sport, team, video
from alembic.config import Config
from alembic import command

log = logging.getLogger('uvicorn')

def run_migrations():
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option('script_location', "migrations")
    alembic_cfg.set_main_option('sqlalchemy.url', settings.DATABASE_URL)
    alembic_cfg.set_main_option('prepend_sys_path', '.')
    command.upgrade(alembic_cfg, 'head')

@asynccontextmanager
async def lifespan(app_: FastAPI):
    log.info("Starting up...")
    log.info("run migration")
    run_migrations()
    yield
    log.info("Shutting down...")

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000",
]

middleware =[
    Middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )]

app = FastAPI(lifespan=lifespan, debug=True, middleware=middleware)


# Bind Routers from Router Directory
app.include_router(annotation.router)
app.include_router(user.router)
app.include_router(game.router)
app.include_router(sport.router)
app.include_router(team.router)
app.include_router(video.router)



@app.get("/")
async def check_app():
    return {"status": "App Running!"}

if __name__ == "__main__":
    uvicorn.run(app, host=settings.HOSTNAME, port=settings.PORT)