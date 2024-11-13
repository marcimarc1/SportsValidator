from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy.future import select
from ..db.db_models.users import User
from ..pydantic_models.user import UserDto

async def create_user(dto: UserDto, db: Session):
    user = User(**dto.model_dump())
    db.add(user)
    db.commit()
    return user

async def read_user(user_id: int, db: Session):
    qry = db.execute(select(User).filter(User.id == user_id))
    user = qry.scalars().first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user

async def update_user(user_id: int, user_dto: UserDto, db: Session):
    qry = db.execute(select(User).filter(User.id == user_id))
    user = qry.scalars().first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    for field, value in user_dto.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    return user


async def delete_user(user_id: int, db: Session):
    qry = db.execute(select(User).filter(User.id == user_id))
    user = qry.scalars().first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
