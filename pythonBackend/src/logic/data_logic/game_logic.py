import shutil

from sqlalchemy import exists
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from db.db_models.games import Game
from db.db_models.teams import Team
from db.db_models.videos import Video
from logic.base.base_crud_logic import BaseCrudLogic, SearchDtoType, CreateDtoType, DBModelType
from pydantic_models.game import *
import os

class GameLogic(
    BaseCrudLogic[
        CreateGameDto,
        GameDto,
        UpdateGameDto,
        GamesDto,
        SearchGameDto,
        Game
    ]):

    def apply_filters(self, query, search_dto: SearchDtoType):
        if search_dto.filter:
            query = query.where(Game.name.contains(search_dto.filter))

        return query

    def generate_db_obj(self, dto: CreateDtoType, db: Session) -> DBModelType:
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
        return game

    def post_create(self, db_obj, db: Session):
        path = os.environ.get('APP_DATA_PATH', 'C:/SportsValidator')
        if path is not None:
            path = os.path.join(path,str(db_obj.id))
            if not os.path.exists(path):
                os.makedirs(path)
        assert os.path.exists(path)

    def can_delete(self, game: Game, db: Session):
        has_games = db.execute(select(exists().where(Video.game_id == game.id))).scalar()
        if has_games:
            return False, {"message": "The game still contains Videos"}

        return True, {}

    def post_delete(self, obj_id: uuid.UUID, db: Session):
        # Delete directory from file-system
        path = os.environ.get('APP_DATA_PATH', 'C:/SportsValidator')
        if path is not None:
            path = os.path.join(path, str(obj_id))
            if os.path.exists(path):
                print(f"deleting files")
                shutil.rmtree(path)