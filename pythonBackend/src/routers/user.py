import fastapi
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from ..logic.user_logic import *
from ..db.database import get_db
from ..pydantic_models.user import UserDto

router = fastapi.APIRouter(
    prefix="/user"
)


@router.get("/{user_id}", response_model=UserDto)
async def get(user_id: int, db: Session = Depends(get_db)):
    user = await read_user(user_id, db)
    return user

# Create
@router.post("/",response_model=UserDto)
async def create(dto: UserDto, db: Session = Depends(get_db)):
    user = await create_user(dto, db)
    return user

# Update
@router.put("/{user_id}", response_model=UserDto)
async def update_points(user_id: int, dto: UserDto, db: Session = Depends(get_db)):
    user = await update_user(user_id, dto, db)
    return user

@router.delete("/{user_id}", response_model=dict)
async def delete(user_id: int, db: Session = Depends(get_db)):
    await delete(user_id, db)
    return {"message": "User deleted successfully"}