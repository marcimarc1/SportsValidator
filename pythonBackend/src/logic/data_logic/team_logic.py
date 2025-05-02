from db.db_models.teams import Team
from logic.base.base_crud_logic import BaseCrudLogic
from pydantic_models.team import *

class TeamLogic(
    BaseCrudLogic[
        CreateTeamDto,
        TeamDto,
        UpdateTeamDto,
        TeamsDto,
        None,
        Team
    ]):
    ...
