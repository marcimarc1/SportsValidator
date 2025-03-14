import uuid
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class BaseVideoDto(BaseModel):
    title: str
    sequenceNumber: int
    gameId: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

class VideoDto(BaseVideoDto):
    id: uuid.UUID
    ...

class UpdateVideoDto(BaseVideoDto):
    title: Optional[str]
    sequenceNumber: Optional[int]

class VideosDto(BaseModel):
    videos: List[VideoDto]
