from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic_csv import BasemodelCSVReader
import os

from ..db.db_models.annotations import Annotation, AnnotationType
from ..db.db_models.videos import Video

from ..pydantic_models.Import.import_request_dto import (ImportRequestDto)
from ..pydantic_models.Export.export_dto import ExportDto
from .game_logic import read_game
from .video_logic import add_video

async def save_annotation_by_csv_path(db: Session, path: str):
    with open(path) as csv:
        reader = BasemodelCSVReader(csv, Annotation)
        try:
            for annotation in reader:
                db.add(annotation)
        except HTTPException as e:
            return HTTPException(status_code=500, detail="Upload Failed")
        finally:
            db.commit()


async def get_annotations_by_video_id(db: Session, video_id: int):
    res = (db.query(Annotation)
           .where(Annotation.video_id == video_id)
           .order_by(Annotation.frame_numer))

    return res

def import_annotation(dto: ImportRequestDto, db: Session):
    game = read_game(dto.game_id, db)
    video = add_video(dto, game, db)
    save_files(dto, video)
    process_file(video, db)

def save_files(dto: ImportRequestDto, video: Video):
    files = dto.files
    exceptions = List[Exception]
    for file in files:
        try:
            file_path = os.path.join(video.path, file.filename)
            with open(file_path, "wb") as f:
                f.write(file.file.read())
        except Exception as e:
            exceptions.append(e)
    if exceptions.__len__() > 0:
        return HTTPException(status_code=500, detail="upload failed")


def process_file(video: Video, db: Session):
    try:
        process_player_file = os.path.join(video.path, "processed_players.csv")
        import_annotation_from_csv(process_player_file, AnnotationType.PLAYER)
        process_ball_file = os.path.join(video.path, "processed_ball.csv")
        import_annotation_from_csv(process_ball_file, AnnotationType.BALL)

        db.commit()
    except Exception as e:
        db.rollback()

def import_annotation_from_csv(csv_file_path, type : AnnotationType):
    if os.path.exists(csv_file_path):
        data = load_data(csv_file_path)

        for i in data:
            annotation = Annotation(**{
                "video_id": video.id,
                "game_id": video.game_id,
                "player_key": i[3],
                "frame_numer": i[4],
                "x": i[5],
                "y": i[6],
                "w": i[7],
                "h": i[8],
                "x2": i[9],
                "y2": i[10],
                "x1": i[11],
                "y1": i[12],
                "x_trans": i[13],
                "y_trans": i[14],
                "in_field": i[15],
                "type": type
            })
            db.add(annotation)


def load_data(file_name):
    data = genfromtxt(file_name, delimiter=',', skip_header=1, converters={0: lambda s: str(s)})
    return data.tolist()

def export_annotation_by_game_id(game_id: int, db: Session):

    game = db.query(Game).filter(Game.id == game_id).first()
    if game is None:
        return HTTPException(status_code=500, detail="Game not found")
    data_path = os.environ.get('APP_DATA_PATH')
    if data_path is None:
        return HTTPException(status_code=500, detail="Path not defined")

    file_path = os.path.join(data_path, str(game_id))

    # Create Files
    player_qry = db.query(Annotation).filter(Annotation.game_id == game_id and Annotation.type == AnnotationType.PLAYER)
    player_file_name = os.path.join(file_path, "processed_player.csv")
    player_file = create_csv_for_export(player_qry, player_file_name, db)

    ball_qry = db.query(Annotation).filter(Annotation.game_id == game_id and Annotation.type == AnnotationType.BALL)
    ball_file_name = os.path.join(file_path, "processed_ball.csv")
    ball_file = create_csv_for_export(ball_qry, ball_file_name, db)

    # Create Dto
    response = ExportDto(
        processed_player = FileResponse(player_file) if player_file is not None else None,
        processed_ball = FileResponse(ball_file) if ball_file is not None else None,
    )
    return response

def export_annotation_by_video_id(video_id: int,  db: Session):
    video = db.query(Video).filter(Video.id == video_id).first()
    if video is None:
        return HTTPException(status_code=500, detail="Video not found")

    # Updates processed_player.csv and processed_ball.csv(if exists)
    player_qry = db.query(Annotation).filter(Annotation.game_id == game_id and Annotation.type == AnnotationType.PLAYER)
    player_file_name = os.path.join(video.video_path, "processed_player.csv")
    create_csv_for_export(player_qry, player_file_name, db)

    ball_qry = db.query(Annotation).filter(Annotation.game_id == game_id and Annotation.type == AnnotationType.BALL)
    ball_file_name = os.path.join(video.video_path, "processed_ball.csv")
    create_csv_for_export(ball_qry, ball_file_name, db)

    # Create Zip
    with ZipFile(video_id + ".zip", "w") as zip_file:
        zip_file.write(video.video_path)
    response = FileResponse(path = video_id + '.zip', filename = video_id + '.zip')
    return response

def create_csv_for_export(qry,file_name: str, db: Session):

    annotations = db.all()

    if annotations is None or annotations.__len__() == 0:
        return None

    if os.path.exists(file_name):
        os.remove(file_name)

    with open(file_name, 'w', newline='') as f:
        out_csv = csv.writer(f, delimiter=',')
        out_csv.writerow(["","Unnamed: 0","PlayerKey","FrameNo","x","y","w","h","x2","y2","x1","y1","x_trans","y_trans","in_field"])
        for i, annotation in enumerate(annotations):
            out_csv.writerow(
                [i,
                 i,
                 annotation.player_key,
                 annotation.frame_number,
                 annotation.x,
                 annotation.y,
                 annotation.w,
                 annotation.h,
                 annotation.x2,
                 annotation.y2,
                 annotation.x1,
                 annotation.y1,
                 annotation.x_trans,
                 annotation.y_trans,
                 annotation.in_field
                 ])
        f.close()
    return file_name
