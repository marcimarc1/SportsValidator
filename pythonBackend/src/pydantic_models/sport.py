from pydantic import BaseModel


class SportDto(BaseModel):
    id: int
    name: str
