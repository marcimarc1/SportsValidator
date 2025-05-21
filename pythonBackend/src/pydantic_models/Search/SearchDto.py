from pydantic import BaseModel


class BaseSearchDto(BaseModel):
    skip: int
    take: int
    desc: bool = False

