from typing import List
from pydantic import BaseModel

class Point(BaseModel):
    id: str
    x: float
    y: float

class PointUpdate(BaseModel):
    video_id: int
    points: List[Point]
    start_frame: int
    end_frame: int

    class Config:
        orm_mode = True

class TrackingResult(BaseModel):
    tracked_points: List[List[Point]]
    start_frame: int
    end_frame: int
