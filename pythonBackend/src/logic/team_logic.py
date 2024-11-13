from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy.future import select
from ..db.db_models.teams import Team
from ..pydantic_models.team import TeamDto

async def create_team(dto: TeamDto, db: Session):
    team = Team(**dto.model_dump())
    db.add(team)
    db.commit()
    return team

async def read_team(team_id: int, db: Session):
    qry = db.execute(select(Team).filter(Team.id == team_id))
    team = qry.scalars().first()

    if team is None:
        raise HTTPException(status_code=404, detail="Team not found")

    return team

async def update_team(team_id: int, team_dto: TeamDto, db: Session):
    qry = db.execute(select(Team).filter(Team.id == team_id))
    team = qry.scalars().first()

    if team is None:
        raise HTTPException(status_code=404, detail="Team not found")

    for field, value in team_dto.model_dump(exclude_unset=True).items():
        setattr(team, field, value)
    db.commit()
    return team


async def delete_team(team_id: int, db: Session):
    qry = db.execute(select(Team).filter(Team.id == team_id))
    team = qry.scalars().first()

    if team is None:
        raise HTTPException(status_code=404, detail="Team not found")

    db.delete(team)
    db.commit()
