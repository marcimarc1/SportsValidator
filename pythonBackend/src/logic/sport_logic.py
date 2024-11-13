from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy.future import select
from ..db.db_models.sport import Sport
from ..pydantic_models.sport import SportDto

async def create_sport(dto: SportDto, db: Session):
    sport = Sport(**dto.model_dump())
    db.add(sport)
    db.commit()
    return sport

async def read_sport(sport_id: int, db: Session):
    qry = db.execute(select(Sport).filter(Sport.id == sport_id))
    sport = qry.scalars().first()

    if sport is None:
        raise HTTPException(status_code=404, detail="Sport not found")

    return sport

async def update_sport(sport_id: int, sport_dto: SportDto, db: Session):
    qry = db.execute(select(Sport).filter(Sport.id == sport_id))
    sport = qry.scalars().first()

    if sport is None:
        raise HTTPException(status_code=404, detail="Sport not found")

    for field, value in sport_dto.model_dump(exclude_unset=True).items():
        setattr(sport, field, value)
    db.commit()
    return sport


async def delete_sport(sport_id: int, db: Session):
    qry = db.execute(select(Sport).filter(Sport.id == sport_id))
    sport = qry.scalars().first()

    if sport is None:
        raise HTTPException(status_code=404, detail="Sport not found")

    db.delete(sport)
    db.commit()
