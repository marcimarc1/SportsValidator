from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy.future import select
from ..db.db_models.games import Game
from ..pydantic_models.game import GameDto
import os

async def create_game(dto: GameDto, db: Session):
    game = Game(**dto.model_dump())
    db.add(game)
    db.commit()
    id_ = game.id
    path = os.environ.get('APP_DATA_PATH')
    if path is not None:
        path = os.path.join(path,id_)
        if not os.path.exists(path):
            os.makedirs(path)
        else:
            throw(HTTPException(status_code=500, detail="UUID already exists"))
    assert os.path.exists(path)

    return game

async def read_game(game_id: int, db: Session):
    qry = db.execute(select(Game).filter(Game.Id == game_id))
    game = qry.scalars().first()

    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")

    return game

async def update_game(game_id: int, game_dto: GameDto, db: Session):
    qry = db.execute(select(Game).filter(Game.id == game_id))
    game = qry.scalars().first()

    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")

    for field, value in game_dto.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    return game


async def delete_game(game_id: int, db: Session):
    # Delete DB-Entry
    qry = db.execute(select(Game).filter(Game.id == game_id))
    game = qry.scalars().first()
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")

    db.delete(game)
    db.commit()

    # Delete directory from file-system
    path = os.environ.get('APP_DATA_PATH')
    if path is not None:
        path = os.path.join(path, id_)
        if os.path.exists(path):
            shutil.rmtree(path)