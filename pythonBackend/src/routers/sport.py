import fastapi
from ..db.util.enums.sportType import sportTypeDict

router = fastapi.APIRouter(
    prefix="/sport"
)


@router.get("/sports/")
async def get():
    return sportTypeDict
