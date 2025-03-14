import shutil
import uuid

from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy.future import select
from db.db_models.videos import Video
from pydantic_models.Import.import_request_dto import ImportRequestDto
import os

from pydantic_models.video import VideosDto


def add_video(dto: ImportRequestDto, db: Session):
    video = Video(
        game_id = dto.game_id,
        video_path = "placeholder",
        uploaded_by = dto.upload_user,
        sequence_number = dto.sequence_number
    )
    db.add(video)
    db.commit()
    id_ = video.id
    path = os.environ.get('APP_DATA_PATH')
    path = os.path.join(path, dto.game_id)
    if os.path.exists(path):
        path = os.path.join(path,id_)
        if not os.path.exists(path):
            os.makedirs(path)
    assert os.path.exists(path)
    video.video_path = path
    db.commit()
    return video

def delete_video(video_id: int, db: Session):
    qry = db.execute(select(Video).filter(Video.id == video_id))
    video = qry.scalars().first()
    if video is None:
        raise HTTPException(status_code=404, detail="Game not found")

    game_id = video.game_id
    sequence_number = video.sequence_number
    path = video.video_path

    db.delete(video)
    db.commit()
    db.query(Video).\
        filter(Video.game_id == game_id and Video.sequence_number>sequence_number).\
        update({"sequence_number": Video.sequence_number-1})
    db.commit()

    # Delete Folder
    if os.path.exists(path):
        shutil.rmtree(path)

async def list_videos(game_id: uuid.UUID, db: Session)-> VideosDto:
    db_videos = db.query(Video).filter(Video.game_id == game_id).all()
    return  VideosDto(videos=[VideosDto.model_validate(video) for video in db_videos])

