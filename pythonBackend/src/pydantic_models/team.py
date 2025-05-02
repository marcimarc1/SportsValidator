from pydantic import BaseModel, ConfigDict
from typing import Optional, List
import uuid

from pydantic_models.Search.SearchDto import BaseSearchDto


class TeamBase(BaseModel):
    team_name: str

class CreateTeamDto(TeamBase):
    ...

class TeamDto(TeamBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

class UpdateTeamDto(TeamBase):
    team_name: Optional[str]=None

class TeamsDto(BaseModel):
    teams: List[TeamDto]

class SearchTeamDto(BaseSearchDto):
    ...