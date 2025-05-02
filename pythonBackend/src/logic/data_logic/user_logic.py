from db.db_models.users import User
from logic.base.base_crud_logic import BaseCrudLogic
from pydantic_models.user import *

class UserLogic(
    BaseCrudLogic[
        CreateUserDto,
        UserDto,
        UpdateUserDto,
        UsersDto,
        SearchUserDto,
        User
    ]):
    ...