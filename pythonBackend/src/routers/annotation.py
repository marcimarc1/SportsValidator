import uuid

import fastapi
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from logic.annotation_logic import *
from db.database import get_db
from pydantic_models.point_update_dto import PointUpdate
from logic.tracking.tracking_logic import track_points_logic

router = fastapi.APIRouter(
    prefix="/annotation"
)

@router.post("/track")
async def track_points(dto: PointUpdate, db: Session = Depends(get_db)):
    try:
        return await track_points_logic(dto)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/getPlayers/{video_id}")
async def get_player_annotations_by_video_id(video_id: uuid.UUID, db: Session = Depends(get_db)):
    annotations = await get_annotations_by_video_id(db, video_id, AnnotationType.Player)
    return annotations

@router.get("/getBalls/{video_id}")
async def get_ball_annotations_by_video_id(video_id: uuid.UUID, db: Session = Depends(get_db)):
    annotations = await get_annotations_by_video_id(db, video_id, AnnotationType.Ball)
    return annotations



