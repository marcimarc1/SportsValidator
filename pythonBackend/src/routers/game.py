import fastapi
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from logic.game_logic import *
from db.database import get_db
from pydantic_models.Search.SearchDto import SearchDto
from pydantic_models.game import CreateGameDto, GamesDto


router = fastapi.APIRouter(
    prefix="/game"
)


@router.post("/list", response_model=GamesDto, tags=["game"])
async def get_list(searchDto: SearchDto, db: Session = Depends(get_db)):
    return list_games(searchDto=searchDto, db=db)

@router.get("/{game_id}", response_model=GameDto, tags=["game"])
async def get(game_id: str, db: Session = Depends(get_db)):
    game = await read_game(game_id, db)
    return game

# Create
@router.post("/",response_model=GameDto, tags=["game"])
async def create(dto: CreateGameDto, db: Session = Depends(get_db)):
    return await create_game(dto, db)

# Update
@router.put("/{game_id}", response_model=GameDto, tags=["game"])
async def update_points(game_id: str, dto: GameDto, db: Session = Depends(get_db)):
    game = await update_game(game_id, dto, db)
    return game

@router.get("/delete/{game_id}", response_model=dict, tags=["game"])
async def delete(game_id: str, db: Session = Depends(get_db)):
    response = await delete_game(game_id, db)
    return response
