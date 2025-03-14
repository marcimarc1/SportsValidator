import shutil
from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy.future import select
from db.db_models.games import Game
from db.db_models.teams import Team
from pydantic_models.Search.SearchDto import SearchDto
from pydantic_models.game import GameDto, CreateGameDto, GamesDto
import os


def list_games(searchDto: SearchDto, db: Session)-> GamesDto:
    db_games = {}
    if not searchDto.hasFilter:
        db_games = db.query(Game).all()
    else:
        db_games = db.query(Game).where(Game.name.contains(searchDto.filter)or Game.team1_name.contains(searchDto.filter) or Game.team2_name.contains(searchDto.filter)).all()

    return  GamesDto(games=[GameDto.model_validate(game) for game in db_games])


async def create_game(dto: CreateGameDto, db: Session) -> GameDto:
    team1 = db.query(Team).filter(Team.id == dto.team1_id).first()
    team2 = db.query(Team).filter(Team.id == dto.team2_id).first()
    game = Game(
        name=dto.name,
        team1_id=dto.team1_id,
        team1_name=team1.team_name,
        team2_name=team2.team_name,
        team2_id=dto.team2_id,
        sportType=dto.sportType,
        date_played=dto.date_played,
    )
    db.add(game)
    db.commit()
    id_ = str(game.id)

    path = os.environ.get('APP_DATA_PATH', 'C:/SportsValidator')
    if path is not None:
        path = os.path.join(path,id_)
        if not os.path.exists(path):
            os.makedirs(path)
    assert os.path.exists(path)

    return GameDto.model_validate(game)

async def read_game(game_id: str, db: Session):
    db_game = db.query(Game).filter(Game.id == game_id).first()

    if db_game is None:
        raise HTTPException(status_code=404, detail="Game not found")

    return GameDto.model_validate(db_game)

async def update_game(game_id: str, game_dto: GameDto, db: Session):
    qry = db.execute(select(Game).filter(Game.id == game_id))
    game = qry.scalars().first()

    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")

    for field, value in game_dto.model_dump(exclude_unset=True).items():
        setattr(game, field, value)
    db.commit()
    return game


async def delete_game(game_id: str, db: Session):
    # Delete DB-Entry
    qry = db.execute(select(Game).filter(Game.id == game_id))
    game = qry.scalars().first()
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    id_ = str(game.id)
    db.delete(game)
    db.commit()

    # Delete directory from file-system
    path = os.environ.get('APP_DATA_PATH')
    if path is not None:
        path = os.path.join(path, id_)
        if os.path.exists(path):
            shutil.rmtree(path)