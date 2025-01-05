from pydantic import BaseModel


class TeamDto(BaseModel):
    id: str | None
    team_name: str

    class Config:
        orm_mode = True

