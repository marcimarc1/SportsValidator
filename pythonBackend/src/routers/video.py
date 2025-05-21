import json
import time
import uuid
from time import sleep
from typing import Annotated

import fastapi
from fastapi.responses import StreamingResponse, FileResponse
from fastapi import HTTPException, Depends, Request, UploadFile, File, Form
from sqlalchemy.orm import Session

from db.db_models.videos import Video
from logic.data_logic.video_logic import VideoLogic
from logic.import_logic import importVideo
from pydantic_models.video import *
from db.database import get_db
from pydantic_models.Import.import_request_dto import ImportRequestDto

router = fastapi.APIRouter(
    prefix="/video"
)

logic = VideoLogic(Video, VideoDto, VideosDto)

@router.post("/addVideo", tags=["video"])
async def addVideo(
        videoInfo: Annotated[str, Form()],
        videoFile: UploadFile = File(...),
        playerAnnotationFile: UploadFile = File(...),
        ballAnnotationFile: UploadFile = File(...),
        db: Session = Depends(get_db)
):
    videoInfo = json.loads(videoInfo)
    videoDto = CreateVideoDto(
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
    msg = await logic.delete(video_id, db)
    return msg

@router.get("/{video_id}", response_model=VideoDto, tags=["video"])
async def get(video_id: uuid.UUID, db: Session = Depends(get_db)):
    video = await logic.get(video_id, db)
    return video

@router.post("/list/", response_model=VideosDto, tags=["video"])
async def get_videos_by_game_id(searchDto: SearchVideoDto, db: Session = Depends(get_db)):
    return await logic.get_many(searchDto, db)

@router.get("/get_video_file/{video_id}",tags=["video"])
async def get_video_file_by_id(video_id: uuid.UUID, db: Session = Depends(get_db)) -> FileResponse:
    return await logic.get_video_file(video_id, db)

