from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime
import uuid

from pydantic_models.Search.SearchDto import BaseSearchDto


class BaseGameDto(BaseModel):
    team1_id: uuid.UUID
    team2_id: uuid.UUID
    sportType: str
    date_played: datetime
    name: str

    model_config = ConfigDict(from_attributes=True)

class CreateGameDto(BaseGameDto):
    ...

class GameDto(BaseGameDto):
    id: uuid.UUID
    team1_name: str
    team2_name: str

class UpdateGameDto(BaseGameDto):
    team1_id: Optional[uuid.UUID]
    team2_id: Optional[uuid.UUID]
    sportType: Optional[str]
    date_played: Optional[datetime]
    name: Optional[str]

class GamesDto(BaseModel):
    games: List[GameDto]

class SearchGameDto(BaseSearchDto):
    filter: str
