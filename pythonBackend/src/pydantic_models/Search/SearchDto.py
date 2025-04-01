from pydantic import BaseModel


class SearchDto(BaseModel):
    filter: str
    skip: int
    take: int
    desc: bool = False
    hasFilter: bool = False

