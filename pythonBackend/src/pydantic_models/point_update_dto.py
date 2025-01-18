from typing import List, Optional
from pydantic import BaseModel

class Point(BaseModel):
    label: Optional[str] = None
    id: str
    x: float
    y: float

class PlayerBox(BaseModel):
    frame_no: int
    x_1: float
    y_1: float
    x_2: float
    y_2: float

class PointUpdate(BaseModel):
    video_id: str
    points: List[Point]
    player_boxes: List[PlayerBox]
    start_frame: int
    end_frame: int

    class Config:
        orm_mode = True

class TrackingResult(BaseModel):
    tracked_points: List[List[Point]]
    start_frame: int
    end_frame: int
