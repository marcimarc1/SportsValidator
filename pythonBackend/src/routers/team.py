import fastapi
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from ..logic.team_logic import *
from ..db.database import get_db
from ..pydantic_models.team import TeamDto

router = fastapi.APIRouter(
    prefix="/team"
)


@router.get("/{team_id}", response_model=TeamDto)
async def get(team_id: int, db: Session = Depends(get_db)):
    team = await read_team(team_id, db)
    return team

# Create
@router.post("/",response_model=TeamDto)
async def create(dto: TeamDto, db: Session = Depends(get_db)):
    team = await create_team(dto, db)
    return team

# Update
@router.put("/{team_id}", response_model=TeamDto)
async def update_points(team_id: int, dto: TeamDto, db: Session = Depends(get_db)):
    team = await update_team(team_id, dto, db)
    return team

@router.delete("/{team_id}", response_model=dict)
async def delete(team_id: int, db: Session = Depends(get_db)):
    await delete_team(team_id, db)
    return {"message": "Game deleted successfully"}