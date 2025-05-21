import uuid

import fastapi
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from db.db_models.users import User
from logic.data_logic.user_logic import UserLogic
from pydantic_models.user import *

router = fastapi.APIRouter(
    prefix="/user"
)

logic = UserLogic(User, UserDto, UsersDto)

@router.get("/{user_id}", response_model=UserDto, tags=["user"])
async def get(user_id: uuid.UUID, db: Session = Depends(get_db)):
    user = await logic.get(user_id, db)
    return user


# Create
@router.post("/",response_model=UserDto, tags=["user"])
async def create(dto: CreateUserDto, db: Session = Depends(get_db)):
    user = await logic.create(dto, db)
    return user


# Update
@router.post("/{user_id}", response_model=UserDto, tags=["user"])
async def update_points(user_id: uuid.UUID, dto: UpdateUserDto, db: Session = Depends(get_db)):
    user = await logic.update(user_id, dto, db)
    return user


@router.get("/delete/{user_id}", response_model=dict, tags=["user"])
async def delete(user_id: uuid.UUID, db: Session = Depends(get_db)):
    await logic.delete(user_id, db)
    return {"message": "User deleted successfully"}