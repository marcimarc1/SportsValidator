import uuid

from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy.future import select
from db.db_models.users import User
from pydantic_models.user import UserDto, UpdateUserDto


async def create_user(dto: UserDto, db: Session)->UserDto:
    db_user = User(
        username=dto.username,
        email=dto.email,
        password=dto.password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return UserDto.model_validate(db_user)

async def get_user(user_id: uuid.UUID, db: Session)->UserDto:
    db_user = db.query(User).filter(User.id == user_id).first()
    return UserDto.model_validate(db_user)

async def update_user(user_id: uuid.UUID, user_dto: UpdateUserDto, db: Session)->UserDto:
    db_user = db.execute(select(User).filter(User.id == user_id)).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = user_dto.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    return UserDto.model_validate(db_user)


async def delete_user(user_id: uuid.UUID, db: Session)->dict[str, str]:
    db_user = db.execute(select(User).filter(User.id == user_id)).first()
    if db_user:
        db.delete(db_user)
        db.commit()
        return {"message": "success"}
    else:
        raise HTTPException(status_code=404, detail="User not found")
