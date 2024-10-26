import fastapi
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from ..logic.annotation_logic import *
from ..db.database import get_db
from ..pydantic_models.point_update_dto import PointUpdate

router = fastapi.APIRouter(
    prefix="/annotation"
)


@router.post("/upload")
async def save_annotations(path: str, db: Session = Depends(get_db)):
    await save_annotation_by_csv_path(db, path)


@router.get("/{video_id}")
async def get_annotations(video_id: int, db: Session = Depends(get_db)):
    annotations = await get_annotations_by_video_id(db, video_id)
    if not annotations:
        raise HTTPException(status_code=404, detail="No annotations for video")
    return annotations

@router.post("/update_points")
async def update_points(dto: PointUpdate):
    if dto is not None:
        return "received"

@router.post("/upload")
async def upload(dto: ImportRequestDto,  db: Session = Depends(get_db)):
    if dto is not None:
        return

@router.get("export_game/{game_id}")
async def export_by_game_id(game_id: int, db: Session = Depends(get_db)):
    return export_annotation_by_game_id(game_id, db)

@router.get("export_video/{video_id}")
async def export_by_video_id(video_id: int, db: Session = Depends(get_db)):
    return export_annotation_by_video_id(video_id, db)

