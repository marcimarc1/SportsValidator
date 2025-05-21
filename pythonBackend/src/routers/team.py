import uuid
from typing import List
import fastapi
from fastapi import Depends
from pydantic.v1 import parse_obj_as
from sqlalchemy.orm import Session

from db.database import get_db
from db.db_models.teams import Team
from logic.data_logic.team_logic import TeamLogic
from pydantic_models.team import *

logic = TeamLogic(Team, TeamDto, TeamsDto)

router = fastapi.APIRouter(
    prefix="/team"
)

@router.get("/list", response_model=TeamsDto, tags=["team"])
async def get_list(db: Session = Depends(get_db)):
    return await logic.get_many(search_dto=None, db=db)


@router.get("/{team_id}", response_model=TeamDto, tags=["team"])
async def get(team_id: uuid.UUID, db: Session = Depends(get_db)):
    team = await logic.get(team_id, db)
    return team


# Create
@router.post("/", response_model= TeamDto, tags=["team"])
async def create(dto: CreateTeamDto, db: Session = Depends(get_db)):
    return await logic.create(dto, db)


# Update
@router.put("/{team_id}", response_model=TeamDto, tags=["team"])
async def update_points(team_id: uuid.UUID, dto: TeamDto, db: Session = Depends(get_db)):
    team = await logic.update(team_id, dto, db)
    return await team


@router.delete("/{team_id}", response_model=dict, tags=["team"])
async def delete(team_id: uuid.UUID,db : Session = Depends(get_db)):
    msg = await logic.delete(team_id, db)
    return msg