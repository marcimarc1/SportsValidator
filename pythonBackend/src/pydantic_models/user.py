import uuid
from typing import Optional, List

from pydantic import BaseModel, ConfigDict

from pydantic_models.Search.SearchDto import BaseSearchDto


class BaseUserDto(BaseModel):
    username: str
    email: str
    password: str

    model_config = ConfigDict(from_attributes=True)

class CreateUserDto(BaseUserDto):
    ...

class UserDto(BaseUserDto):
    id: uuid.UUID

class UpdateUserDto(BaseUserDto):
    username: Optional[str]
    email: Optional[str]
    password: Optional[str]

class UsersDto(BaseModel):
    users: List[UserDto]
    model_config = ConfigDict(from_attributes=True)

class SearchUserDto(BaseSearchDto):
    ...
