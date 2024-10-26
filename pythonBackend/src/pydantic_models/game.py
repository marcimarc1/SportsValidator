from pydantic import BaseModel
from datetime import datetime

class GameDto(BaseModel):
    id: int = None
    team1_id: int = None
    team2_id: int = None
    sport_id: int = None
    date_played: datetime = None