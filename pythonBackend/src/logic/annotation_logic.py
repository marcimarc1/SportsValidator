import uuid

from sqlalchemy.orm import Session


from db.db_models.annotations import Annotation, AnnotationType
from pydantic_models.annotation import AnnotationsDto, AnnotationDto


async def get_annotations_by_video_id(db: Session, video_id: uuid.UUID, annotationType: AnnotationType):
    res = (
        db.query(Annotation)
           .filter(Annotation.video_id == video_id)
           .filter(Annotation.type == annotationType)
           .order_by(Annotation.frame_number)
           .all()
    )

    return AnnotationsDto(annotations=[AnnotationDto.model_validate(annotation) for annotation in res])


async def delete_annotations_by_video_id(db: Session, video_id: uuid.UUID):
    annotations = db.query(Annotation).filter_by(video_id=video_id).all()
    for annotation in annotations:
        db.delete(annotation)

    db.commit()
    return {"message": "annotations deleted"}





