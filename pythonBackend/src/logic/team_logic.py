from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy.future import select
from db.db_models.teams import Team
from pydantic_models.team import *


def list_teams(db: Session) -> TeamsDto:
    db_teams = db.query(Team).all()
    return TeamsDto(teams =[TeamDto.model_validate(team) for team in db_teams])


def create_team(dto: CreateTeamDto, db: Session)-> TeamDto:
    db_team = Team(
        team_name=dto.team_name,
    )
    db.add(db_team)
    db.commit()
    return TeamDto.model_validate(db_team)


async def get_team(team_id: int, db: Session):
    team = db.query(Team).filter(Team.id == team_id).first()

    if team is None:
        raise HTTPException(status_code=504, detail="Team not found")

    return team


async def update_team(team_id: int, team_dto: Team, db: Session):
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
