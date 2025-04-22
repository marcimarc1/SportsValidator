import uuid

from typing import Optional, List
from pydantic import BaseModel, ConfigDict

from db.util.enums.annotationType import AnnotationType


class AnnotationBase(BaseModel):
    video_id: uuid.UUID
    game_id: uuid.UUID
    frame_number: int
    displayName: str
    x: Optional[float]
    y: Optional[float]
    w: Optional[float]
    h: Optional[float]
    x2: float
    y2: float
    x1: float
    y1: float
    x_trans: float
    y_trans: float
    in_field: bool
    type: AnnotationType

    model_config = ConfigDict(from_attributes=True)

class AnnotationDto(AnnotationBase):
    ...
    id: uuid.UUID

class UpdateAnnotationDto(AnnotationDto):
    video_id: Optional[uuid.UUID]
    frame_number: int
    x: Optional[float] = None
    y: Optional[float] = None
    w: Optional[float] = None
    h: Optional[float] = None
    x2: Optional[float] = None
    y2: Optional[float] = None
    x1: Optional[float] = None
    y1: Optional[float] = None
    x_trans: Optional[float] = None
    y_trans: Optional[float] = None

class AnnotationsDto(BaseModel):
    annotations: List[AnnotationDto]
