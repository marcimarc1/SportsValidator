import fastapi
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from ..logic.video_logic import *
from ..db.database import get_db
from ..pydantic_models.Import.import_request_dto import ImportRequestDto

router = fastapi.APIRouter(
    prefix="/video"
)

@router.post("/addVideo")
async def upload(dto: ImportRequestDto,  db: Session = Depends(get_db)):
    try:
        await add_video(dto,db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{video_id}", response_model=dict)
async def delete(user_id: int, db: Session = Depends(get_db)):
    await delete_video(user_id, db)
    return {"message": "Video deleted successfully"}


@router.get("/list/{game_id}", response_model=List[VideoDto])
async def get_videos_by_game_id(game_id: int, db: Session = Depends(get_db)):
    return await get_videos_by_game_id(game_id, db)

