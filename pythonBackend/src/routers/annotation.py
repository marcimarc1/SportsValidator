import fastapi
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from ..logic.annotation_logic import get_annotations_by_video_id, save_annotation_by_csv_path, \
    save_homography_model_soccer
from ..db.database import get_db
from ..pydantic_models.point_update_dto import PointUpdate
from ..logic.tracking.tracking_logic import track_points_logic
from ..logic.active_learning import filter_annotation_data_by_score, quality_function
from ..pydantic_models.homography import HomographyModelSoccer, HomographyModelSoccerAsList, HomographyModelTennis, \
    HomographyModelTennisAsList

# These imports must be kept here, to allow the annotation to work
from ..logic.tennis_module import *  # noqa # pylint: disable=unused-import
from ..logic.soccer_module import *  # noqa # pylint: disable=unused-import

router = fastapi.APIRouter(
    prefix="/annotation"
)


@router.post("/upload")
async def save_annotations(path: str, db: Session = Depends(get_db)):
    await save_annotation_by_csv_path(db, path)


@router.get("/{video_id}")
async def get_annotations(video_id: int, db: Session = Depends(get_db)):
    annotations = await get_annotations_by_video_id(db, video_id)
    if not annotations:
        raise HTTPException(status_code=404, detail="No annotations for video")
    return annotations

@router.post("/track")
async def track_points(dto: PointUpdate, db: Session = Depends(get_db)):
    try:
        return await track_points_logic(dto)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/quality-refine/Soccer/{video_id}")
async def refine_soccer(video_id: str, data: FieldSectionSoccer):
    try:
        return quality_function(data, "Soccer")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/refine/Soccer/{video_id}")
async def refine_soccer(video_id: str, data: HomographyModelSoccer):
    try:
        return filter_annotation_data_by_score(data, "Soccer")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/save-refine/Soccer/{video_id}")
async def save_refine_soccer(video_id: str, data: HomographyModelSoccerAsList, db: Session = Depends(get_db)):
    try:
        await save_homography_model_soccer(db, video_id, data)
        return True
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/quality-refine/Tennis/{video_id}")
async def refine_tennis(video_id: str, data: FieldSectionTennis):
    try:
        return quality_function(data, "Tennis")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/refine/Tennis/{video_id}")
async def refine_tennis(video_id: str, data: HomographyModelTennis):
    try:
        return filter_annotation_data_by_score(data, "Tennis")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Tennis
@router.post("/save-refine/Tennis/{video_id}")
async def save_refine_tennis(video_id: str, data: HomographyModelTennisAsList, db: Session = Depends(get_db)):
    try:
        print(f"Got refinement data for id: {video_id}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
