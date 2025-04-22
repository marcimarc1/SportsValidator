import shutil
import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.future import select
from db.db_models.annotations import Annotation
from db.db_models.videos import Video
from pydantic_models.Import.import_request_dto import ImportRequestDto
import os

from pydantic_models.video import VideosDto, VideoUploadDto, VideoDto


def add_video(dto: VideoUploadDto,db: Session,) -> uuid.UUID:
    video = Video(
        game_id = dto.game_id,
        sequence_number = dto.sequence_number,
        name = dto.name,
    )
    db.add(video)
    db.commit()
    videoId: uuid.UUID = video.id
    return videoId

def delete_video(video_id: uuid.UUID, db: Session):
    db_video = db.query(Video).filter(Video.id == video_id).one_or_none()

    if db_video:
        annotations = db.query(Annotation).filter(Annotation.video_id == video_id).all()
        for annotation in annotations:
            db.delete(annotation)
        game_id = db_video.game_id # For Path
        db.delete(db_video)
        db.commit()

        basePath = os.environ.get('APP_DATA_PATH', 'C:/SportsValidator')
        gamePath = os.path.join(basePath, str(game_id))
        videoPath = os.path.join(gamePath, str(video_id))
        # Delete Folder
        if os.path.exists(videoPath) and os.path.isdir(videoPath):
            shutil.rmtree(videoPath)

        return {"message": "success"}


    return {"message": "No Video for given Id"}


async def list_videos(game_id: uuid.UUID, db: Session)-> VideosDto:
    db_videos = db.query(Video).filter(Video.game_id == game_id).all()
    return  VideosDto(videos=[VideoDto.model_validate(video) for video in db_videos])


async def get_video_file(video_id: uuid.UUID, db: Session):
    db_video = db.query(Video).filter(Video.id == video_id).one_or_none()
    if not db_video:
        return {"message": "Video not found"}

    basePath = os.environ.get('APP_DATA_PATH', 'C:/SportsValidator')
    gamePath = os.path.join(basePath, str(db_video.game_id))
    videoPath = os.path.join(gamePath, str(video_id))
    filePath = os.path.join(videoPath, "video.mp4")

    if not os.path.exists(filePath):
        return {"message": "Video-File not found"}

    return FileResponse(filePath, media_type="video/mp4")



