import uuid
from typing import List, Optional, Dict

from pydantic import BaseModel, ConfigDict

from pydantic_models.Search.SearchDto import BaseSearchDto


class BaseVideoDto(BaseModel):
    name: str
    sequence_number: int
    game_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

class VideoDto(BaseVideoDto):
    id: uuid.UUID
    ...


class CreateVideoDto(BaseVideoDto):
    ...

class UpdateVideoDto(BaseVideoDto):
    title: Optional[str]
    sequenceNumber: Optional[int]

class UpdateVideoSequencesDto(BaseModel):
    sequenceDict: Dict[uuid.UUID, int]

class VideosDto(BaseModel):
    videos: List[VideoDto]

class SearchVideoDto(BaseSearchDto):
    game_id: uuid.UUID