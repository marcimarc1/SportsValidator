from typing import List
import fastapi
from fastapi import Depends
from pydantic.v1 import parse_obj_as

from logic.team_logic import *
from db.database import get_db
from pydantic_models.team import *

router = fastapi.APIRouter(
    prefix="/team"
)

@router.get("/list", response_model=TeamsDto, tags=["team"])
async def get_list(db: Session = Depends(get_db)):
    return list_teams(db=db)


@router.get("/{team_id}", response_model=TeamDto, tags=["team"])
async def get(team_id: int, db: Session = Depends(get_db)):
    team = await get_team(team_id, db)
    return team


# Create
@router.post("/", response_model= TeamDto, tags=["team"])
async def create(dto: CreateTeamDto, db: Session = Depends(get_db)):
    return create_team(dto, db)


# Update
@router.put("/{team_id}", response_model=TeamDto, tags=["team"])
async def update_points(team_id: int, dto: TeamDto, db: Session = Depends(get_db)):
    team = await update_team(team_id, dto, db)
    return team


@router.delete("/{team_id}", response_model=dict, tags=["team"])
async def delete(team_id: int, db: Session = Depends(get_db)):
    await delete_team(team_id, db)
    return {"message": "Game deleted successfully"}