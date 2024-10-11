from pydantic import BaseModel


class AnnotationDto(BaseModel):
    id: int
    video_id: int
    track_id: int
    frame_number: int
    x: float
    y: float
    w: float
    h: float
    x2: float
    y2: float
    x1: float
    y1: float
    x_trans: float
    y_trans: float

    class Config:
        orm_mode = True
