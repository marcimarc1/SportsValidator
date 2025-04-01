import json
import time
import uuid
from time import sleep
from typing import Annotated

import fastapi
from fastapi import HTTPException, Depends, Request, UploadFile, File, Form
from sqlalchemy.orm import Session

from logic.import_logic import importVideo
from pydantic_models.video import VideoDto
from logic.video_logic import *
from db.database import get_db
from pydantic_models.Import.import_request_dto import ImportRequestDto

router = fastapi.APIRouter(
    prefix="/video"
)


@router.post("/addVideo", tags=["video"])
async def addVideo(
        videoInfo: Annotated[str, Form()],
        videoFile: UploadFile = File(...),
        playerAnnotationFile: UploadFile = File(...),
        ballAnnotationFile: UploadFile = File(...),
        db: Session = Depends(get_db)
):
    videoInfo = json.loads(videoInfo)
    videoDto = VideoUploadDto(
        game_id=uuid.UUID(videoInfo["game_id"]),
        sequence_number=int(videoInfo["sequence_number"]),
        name=videoInfo["name"],
    )
    try:
        return await importVideo(videoDto, db, videoFile, playerAnnotationFile, ballAnnotationFile)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/delete/{video_id}", response_model=dict, tags=["video"])
async def delete(video_id: uuid.UUID, db: Session = Depends(get_db)):
    msg = delete_video(video_id, db)
    return msg


@router.get("/list/{game_id}", response_model=VideosDto, tags=["video"])
async def get_videos_by_game_id(game_id: uuid.UUID, db: Session = Depends(get_db)):
    return await list_videos(game_id, db)

@router.get("/get_video_file/{video_id}", response_model=UploadFile, tags=["video"])
async def get_video_file_by_id(video_id: uuid.UUID, db: Session = Depends(get_db)):
    return await get_video_file(video_id, db)

