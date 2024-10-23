from pydantic import BaseModel


class UserDto(BaseModel):
    username: str
    email: str
    password: str

    class Config:
        orm_mode = True
