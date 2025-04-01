from typing import List
from pydantic import BaseModel, ConfigDict


class Point(BaseModel):
    id: str
    x: float
    y: float

class PlayerBox(BaseModel):
    frame_no: int
    x_1: float
    y_1: float
    x_2: float
    y_2: float

    model_config = ConfigDict(from_attributes=True)

class PointUpdate(BaseModel):
    video_id: str
    points: List[Point]
    player_boxes: List[PlayerBox]
    start_frame: int
    end_frame: int

class TrackingResult(BaseModel):
    tracked_points: List[List[Point]]
    start_frame: int
    end_frame: int
