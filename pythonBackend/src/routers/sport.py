from typing import Dict

import fastapi
from db.util.enums.sportType import SportType
from logic.helper.enum_helper import *
from pydantic_models.sport import SportsDto

router = fastapi.APIRouter(
    prefix="/sport"
)


@router.get("/list", response_model=SportsDto, tags=["sport"])
async def get():
    return SportsDto(sports=get_enum_list(SportType))
