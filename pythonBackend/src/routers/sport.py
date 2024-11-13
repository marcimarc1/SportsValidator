import fastapi
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from ..logic.sport_logic import *
from ..db.database import get_db
from ..pydantic_models.sport import SportDto

router = fastapi.APIRouter(
    prefix="/sport"
)


@router.get("/{sport_id}", response_model=SportDto)
async def get(sport_id: int, db: Session = Depends(get_db)):
    sport = await read_sport(sport_id, db)
    return sport

# Create
@router.post("/",response_model=SportDto)
async def create(dto: SportDto, db: Session = Depends(get_db)):
    sport = await create_sport(dto, db)
    return sport

# Update
@router.put("/{sport_id}", response_model=SportDto)
async def update_points(sport_id: int, dto: SportDto, db: Session = Depends(get_db)):
    sport = await update_sport(sport_id, dto, db)
    return sport

@router.delete("/{sport_id}", response_model=dict)
async def delete(sport_id: int, db: Session = Depends(get_db)):
    await delete_sport(sport_id, db)
    return {"message": "Game deleted successfully"}