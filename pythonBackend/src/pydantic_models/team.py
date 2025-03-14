from pydantic import BaseModel, ConfigDict
from typing import Optional, List
import uuid


class TeamBase(BaseModel):
    team_name: str

class CreateTeamDto(TeamBase):
    ...

class TeamDto(TeamBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

class TeamUpdate(TeamBase):
    team_name: Optional[str]=None

class TeamsDto(BaseModel):
    teams: List[TeamDto]