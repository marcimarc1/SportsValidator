import io
import shutil
import uuid
import gzip

from fastapi import HTTPException
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse

from config import settings
from db.db_models.annotations import Annotation
from db.db_models.videos import Video
import os

from logic.base.base_crud_logic import BaseCrudLogic, DBModelType, SearchDtoType
from pydantic_models.video import *

class VideoLogic(
    BaseCrudLogic[
        CreateVideoDto,
        VideoDto,
        UpdateVideoDto,
        VideoDto,
        SearchVideoDto,
        Video
    ]):

    def can_delete(self, db_obj: DBModelType, db: Session):
        annotations = db.query(Annotation).filter(Annotation.video_id == db_obj.id).all()
        for annotation in annotations:
            db.delete(annotation)
        db.commit()
        return True, {}

    def post_delete(self, db_obj: DBModelType, db: Session):
        basePath = settings.APP_DATA_PATH
        gamePath = os.path.join(basePath, str(db_obj.game_id))
        videoPath = os.path.join(gamePath, str(db_obj.id))
        # Delete Folder
        if os.path.exists(videoPath) and os.path.isdir(videoPath):
            shutil.rmtree(videoPath)

    def apply_filters(self, query, search_dto: SearchDtoType):
        if search_dto.game_id:
            query = query.where(Video.game_id == search_dto.game_id)

        return query

    async def get_video_file(self, video_id: uuid.UUID, db: Session):
        db_video = db.query(Video).filter(Video.id == video_id).one_or_none()
        if not db_video:
            return {"message": "Video not found"}

        basePath = settings.APP_DATA_PATH
        gamePath = os.path.join(basePath, str(db_video.game_id))
        videoPath = os.path.join(gamePath, str(video_id))
        filePath = os.path.join(videoPath, "video.mp4.gz")

        if not os.path.exists(filePath):
            return {"message": "Video-File not found"}

        try:
            # Open and decompress the .gz file in memory
            with gzip.open(filePath, 'rb') as f:
                video_data = f.read()

            return StreamingResponse(
                io.BytesIO(video_data),
                media_type="video/mp4",
                headers={"Content-Disposition": "inline; filename=video.mp4"}
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to read gzipped video: {str(e)}")



