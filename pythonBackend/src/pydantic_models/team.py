from pydantic import BaseModel


class TeamDto(BaseModel):
    id: int
    team_name: str
