from typing import List
from pydantic import BaseModel

class Point(BaseModel):
    id: int
    x: int
    y: int

class PointUpdate(BaseModel):
    video_id: int
    points: List[Point]
    start_frame: int
    end_frame: int

    class Config:
        orm_mode = True



