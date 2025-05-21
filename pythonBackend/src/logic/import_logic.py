import csv
import gzip
import io
import os
import shutil
import uuid

from fastapi import UploadFile, File
from sqlalchemy.orm import Session

from config import settings
from db.db_models.annotations import Annotation
from db.db_models.videos import Video
from db.util.enums.annotationType import AnnotationType
from logic.data_logic.video_logic import VideoLogic
from pydantic_models.video import *

logic = VideoLogic(Video, VideoDto, VideosDto)

async def importVideo(
        dto: CreateVideoDto,
        db: Session,
        videoFile: UploadFile = File(...),
        playerAnnotationFile: UploadFile = File(...),
        ballAnnotationFile: UploadFile = File(...)
):

    # Validate file types using assert
    #assert videoFile.content_type == "video/mp4", "Invalid video file type"
    #assert playerAnnotationFile.content_type == "text/csv", "Invalid player file type"
    #assert not ballAnnotationFile or ballAnnotationFile.content_type == "text/csv", "Invalid ball file type"

    #Add Video To DB
    video = await logic.create(dto, db)
    print("Created video with id: {}".format(video.id))
    basePath = settings.APP_DATA_PATH
    gamePath = os.path.join(basePath, str(dto.game_id))
    videoPath = os.path.join(gamePath, str(video.id))
    vp,pp,bp= "","",""
    #Save Files
    try:
        #Returns paths of saves files
        vp, pp, bp = await saveFilesForVideo(videoPath, videoFile, playerAnnotationFile, ballAnnotationFile)

        # process Files
        if os.path.exists(pp):
            process_player_csv(video.id, dto.game_id, pp, db)
            os.remove(pp)
        if os.path.exists(bp):
            process_ball_csv(video.id, dto.game_id, bp, db)
            os.remove(bp)

    except Exception as error:
        print(error)
        await logic.delete(video.id, db)
        return{"message": error}

    return {"message": "Success"}


async def saveFilesForVideo(
        path: str,
        videoFile: UploadFile = File(...),
        playerAnnotationFile: UploadFile = File(...),
        ballAnnotationFile: UploadFile = File(...)
):
    os.makedirs(path, exist_ok=True)

    print("Saving files in {}".format(path))

    #Write VideoFile
    videoFilePath = os.path.join(path,"video.mp4")
    with open(videoFilePath, "wb") as f:
        while content := videoFile.file.read(1024):
            f.write(content)
    print("Saving Video file in {}".format(videoFilePath))

    #Write Player Annotations
    playerAnnotationPath = os.path.join(path, "processedPlayer.csv")
    with open(playerAnnotationPath, "wb") as f:
        while content := playerAnnotationFile.file.read(1024):
            f.write(content)
    print("Saving Player-Annotation file in {}".format(playerAnnotationPath))
    #Write Ball Annotations
    ballAnnotationPath = os.path.join(path, "processedBall.csv")
    with open(ballAnnotationPath, "wb") as f:
        while content := ballAnnotationFile.file.read(1024):
            f.write(content)
    print("Saving Ball-Annotation file in {}".format(ballAnnotationPath))

    return videoFilePath, playerAnnotationPath, ballAnnotationPath


def process_player_csv(video_id: uuid.UUID, game_id: uuid.UUID, csv_path: str, db: Session):
    print("Processing csv file {}".format(csv_path))

    with open(csv_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)

        for row in reader:
            annotation = Annotation(
                video_id=video_id,
                game_id=game_id,
                frame_number=int(float(row['FrameNo'])),
                displayName="Player " + str(int(float(row['PlayerKey']))),
                x=float(row['x']),
                y=float(row['y']),
                w=float(row['w']),
                h=float(row['h']),
                x2=float(row['x2']),
                y2=float(row['y2']),
                x1=float(row['x1']),
                y1=float(row['y1']),
                x_trans=float(row['x_trans']),
                y_trans=float(row['y_trans']),
                type=AnnotationType.Player,
                in_field=row['in_field'].strip().lower() == 'true'
            )
            db.add(annotation)

        db.commit()

def process_ball_csv(video_id: uuid.UUID, game_id: uuid.UUID, csv_path: str, db: Session):
    print("Processing csv file {}".format(csv_path))

    with open(csv_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)

        for row in reader:
            annotation = Annotation(
                video_id=video_id,
                game_id=game_id,
                frame_number=int(float(row['FrameNo'])),
                displayName="Ball"+ str(int(float(row['trackNo']))),
                x2=float(row['x2']),
                y2=float(row['y2']),
                x1=float(row['x1']),
                y1=float(row['y1']),
                x_trans=float(row['x_trans']),
                y_trans=float(row['y_trans']),
                type=AnnotationType.Ball,
                in_field=row['in_field'].strip().lower() == 'true'
            )
            db.add(annotation)

        db.commit()


def generate_csv_rows(annotations, is_player: bool):
    output = io.StringIO()
    if is_player:
        fieldnames = ['index', 'FrameNo', 'PlayerKey', 'x', 'y', 'w', 'h', 'x2', 'y2', 'x1', 'y1', 'x_trans', 'y_trans', 'in_field']
    else:
        fieldnames = ['index', 'FrameNo', 'trackNo', 'x1', 'y1', 'x2', 'y2', 'x_trans', 'y_trans', 'in_field']

    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()

    for idx, ann in enumerate(annotations):
        if is_player:
            writer.writerow({
                'index': idx,
                'FrameNo': ann.frame_number,
                'PlayerKey': ann.displayName,
                'x': ann.x,
                'y': ann.y,
                'w': ann.w,
                'h': ann.h,
                'x2': ann.x2,
                'y2': ann.y2,
                'x1': ann.x1,
                'y1': ann.y1,
                'x_trans': ann.x_trans,
                'y_trans': ann.y_trans,
                'in_field': ann.in_field
            })
        else:
            writer.writerow({
                'index': idx,
                'FrameNo': ann.frame_number,
                'trackNo': ann.displayName,
                'x1': ann.x1,
                'y1': ann.y1,
                'x2': ann.x2,
                'y2': ann.y2,
                'x_trans': ann.x_trans,
                'y_trans': ann.y_trans,
                'in_field': ann.in_field
            })

    output.seek(0)
    return output