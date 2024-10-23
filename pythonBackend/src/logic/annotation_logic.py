from sqlalchemy.orm import Session
from fastapi import HTTPException
from pydantic_csv import BasemodelCSVReader

from ..db.db_models.annotations import Annotation


async def save_annotation_by_csv_path(db: Session, path: str):
    with open(path) as csv:
        reader = BasemodelCSVReader(csv, Annotation)
        try:
            for annotation in reader:
                db.add(annotation)
        except HTTPException as e:
            return HTTPException(status_code=500, detail="Upload Failed")
        finally:
            db.commit()


async def get_annotations_by_video_id(db: Session, video_id: int):
    res = (db.query(Annotation)
           .where(Annotation.video_id == video_id)
           .order_by(Annotation.frame_numer))

    return res
