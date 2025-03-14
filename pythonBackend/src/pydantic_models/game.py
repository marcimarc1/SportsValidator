from typing import List
from pydantic import BaseModel, ConfigDict
from datetime import datetime
import uuid

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

class GamesDto(BaseModel):
    games: List[GameDto]
