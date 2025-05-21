import uuid

import fastapi
from fastapi import Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from db.database import get_db
from db.db_models.H_key import H_Key
from db.db_models.annotations import Annotation
from db.util.enums.annotationType import AnnotationType
from logic.import_logic import generate_csv_rows

router = fastapi.APIRouter(
    prefix="/imexport",
    tags=["Import/Export"]
)

@router.get("/GetPlayerCSV/{video_id}")
def export_player_csv(video_id: uuid.UUID, db: Session = Depends(get_db)):
    annotations = db.query(Annotation).filter(
        Annotation.video_id == video_id,
        Annotation.type == AnnotationType.Player
    ).order_by(Annotation.frame_number).all()

    csv_file = generate_csv_rows(annotations, is_player=True)
    return StreamingResponse(csv_file, media_type="text/csv", headers={
        "Content-Disposition": f"attachment; filename=player_annotations_{video_id}.csv"
    })

@router.get("/GetBallCSV/{video_id}")
def export_ball_csv(video_id: uuid.UUID, db: Session = Depends(get_db)):
    print("Exporting Ball CSV")
    annotations = db.query(Annotation).filter(
        Annotation.video_id == video_id,
        Annotation.type == AnnotationType.Ball
    ).order_by(Annotation.frame_number).all()

    csv_file = generate_csv_rows(annotations, is_player=False)
    return StreamingResponse(csv_file, media_type="text/csv", headers={
        "Content-Disposition": f"attachment; filename=ball_annotations_{video_id}.csv"
    })

def export_homographieJSON(video_id: uuid.UUID, db: Session = Depends(get_db)):
    homographies = db.query(H_Key).filter(H_Key.video_id == video_id).all()
