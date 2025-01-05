import fastapi
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from ..logic.game_logic import *
from ..db.database import get_db
from ..pydantic_models.user import UserDto

router = fastapi.APIRouter(
    prefix="/game"
)


@router.get("/{game_id}", response_model=GameDto, tags=["game"])
async def get(game_id: int, db: Session = Depends(get_db)):
    game = await read_game(game_id, db)
    return game

# Create
@router.post("/",response_model=GameDto, tags=["game"])
async def create(dto: GameDto, db: Session = Depends(get_db)):
    game = await create_game(dto, db)
    return game

# Update
@router.put("/{game_id}", response_model=GameDto, tags=["game"])
async def update_points(game_id: int, dto: GameDto, db: Session = Depends(get_db)):
    game = await update_game(game_id, dto, db)
    return game

@router.delete("/{game_id}", response_model=dict, tags=["game"])
async def delete(game_id: int, db: Session = Depends(get_db)):
    await delete_game(game_id, db)
    return {"message": "Game deleted successfully"}