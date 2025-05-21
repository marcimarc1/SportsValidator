import uuid

import fastapi
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from db.db_models.games import Game
from logic.data_logic.game_logic import GameLogic
from pydantic_models.game import *


router = fastapi.APIRouter(
    prefix="/game"
)

logic = GameLogic(Game, GameDto, GamesDto)

@router.post("/list", response_model=GamesDto, tags=["game"])
async def get_list(searchDto: SearchGameDto, db: Session = Depends(get_db)):
    return await logic.get_many(search_dto=searchDto, db=db)

@router.get("/{game_id}", response_model=GameDto, tags=["game"])
async def get(game_id: uuid.UUID, db: Session = Depends(get_db)):
    game = await logic.get(game_id, db)
    return game

# Create
@router.post("/",response_model=GameDto, tags=["game"])
async def create(dto: CreateGameDto, db: Session = Depends(get_db)):
    return await logic.create(dto, db)

# Update
@router.post("/{game_id}", response_model=GameDto, tags=["game"])
async def update_points(game_id: uuid.UUID, dto: UpdateGameDto, db: Session = Depends(get_db)):
    game = await logic.update(game_id, dto, db)
    return game

@router.get("/delete/{game_id}", response_model=dict, tags=["game"])
async def delete(game_id: uuid.UUID, db: Session = Depends(get_db)):
    response = await logic.delete(game_id, db)
    return response
