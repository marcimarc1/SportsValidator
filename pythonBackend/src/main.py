from typing import List
import aiofiles
from fastapi import FastAPI, UploadFile

from .db.db_models import annotations, access_role, game_history, H_key, player, player_history, roles, sport, teams, users, videos
from .db.database import engine
from .routers import annotation
import logging

# Table initialization for each DB model.(replaced by alembic migrations)
annotations.Base.metadata.create_all(bind=engine)
access_role.Base.metadata.create_all(bind=engine)
game_history.Base.metadata.create_all(bind=engine)
H_key.Base.metadata.create_all(bind=engine)
player.Base.metadata.create_all(bind=engine)
player_history.Base.metadata.create_all(bind=engine)
roles.Base.metadata.create_all(bind=engine)
sport.Base.metadata.create_all(bind=engine)
teams.Base.metadata.create_all(bind=engine)
users.Base.metadata.create_all(bind=engine)
videos.Base.metadata.create_all(bind=engine)

logger = logging.getLogger('uvicorn.error')
logger.setLevel(logging.DEBUG)

# App Creation
app = FastAPI()

# Bind Routers from Router Directory
app.include_router(annotation.router)


@app.get("/")
async def check_app():
    return {"status": "App Running!"}

@app.post("/upload")
async def upload(files: List[UploadFile]):
    for file in files:
        # Todo: Add correct path for upload items
        async with aiofiles.open("path", 'wb') as out_file:
            while content := await file.read(1024):
                await out_file.write(content)

    return "Files successfully uploaded"
