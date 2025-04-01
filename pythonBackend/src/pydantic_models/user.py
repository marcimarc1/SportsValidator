import uuid

from pydantic import BaseModel, ConfigDict


class BaseUserDto(BaseModel):
    username: str
    email: str
    password: str

    model_config = ConfigDict(from_attributes=True)

class UserDto(BaseUserDto):
    id: uuid.UUID


