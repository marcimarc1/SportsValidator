import fastapi
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from ..logic.annotation_logic import get_annotations_by_video_id, save_annotation_by_csv_path
from ..db.database import get_db

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
