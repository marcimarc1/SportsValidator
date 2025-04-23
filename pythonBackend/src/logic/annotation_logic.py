import uuid

from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy.orm import Session
from pydantic_csv import BasemodelCSVReader

from ..db.db_models.annotations import Annotation
from ..db.db_models.homography import HomographyModelSoccerORM
from ..pydantic_models.homography import HomographyModelSoccerAsList, FieldSectionSoccer, Point, HomographyModelSoccer, HomographyModelTennisAsList

from db.db_models.annotations import Annotation, AnnotationType
from pydantic_models.annotation import AnnotationsDto, AnnotationDto


async def get_annotations_by_video_id(db: Session, video_id: uuid.UUID, annotationType: AnnotationType):
    res = (
        db.query(Annotation)
           .filter(Annotation.video_id == video_id)
           .filter(Annotation.type == annotationType)
           .order_by(Annotation.frame_number)
           .all()
    )

    return AnnotationsDto(annotations=[AnnotationDto.model_validate(annotation) for annotation in res])


async def delete_annotations_by_video_id(db: Session, video_id: uuid.UUID):
    annotations = db.query(Annotation).filter_by(video_id=video_id).all()
    for annotation in annotations:
        db.delete(annotation)

    db.commit()
    return {"message": "annotations deleted"}


async def save_homo_simple(
        session: Session,
        video_id: int,
        homography_model: HomographyModelSoccer,
):
    homography_orm = HomographyModelSoccerORM(
        video_id=video_id,
        frame=1,
        outer_area=[],
        penalty_area_left=[],
        penalty_area_right=[],
        goal_area_left=[],
        goal_area_right=[],
        middle_line=[],
        penalty_spot=[]
    )

    session.add(homography_orm)


async def save_homography_model_soccer(
        session: Session,
        video_id: str,
        homography_model: HomographyModelSoccerAsList
):
    """
    Save a HomographyModelSoccerAsList Pydantic model to the database.

    Args:
        session: SQLAlchemy session
        video_id: ID of the video these homography models belong to
        homography_model: Pydantic model containing homography data for multiple frames
    """
    # Start a transaction
    try:
        # Process each frame in the homography model
        for frame_tuple in homography_model.root:
            frame_number, field_section = frame_tuple

            # Check if this frame already exists for this video
            existing = session.query(HomographyModelSoccerORM).filter_by(
                video_id=video_id,
                frame=frame_number
            ).first()

            if existing:
                # Delete existing entry to replace it
                session.delete(existing)
                session.flush()

            # Helper function to serialize Point objects to dictionaries
            def serialize_points(points_list):
                return [
                    {
                        "id": point.id,
                        "x": point.x,
                        "y": point.y,
                        "originalCoords": list(point.originalCoords)
                    }
                    for point in points_list
                ]

            # Create new homography model for this frame with all points as JSON
            homography_orm = HomographyModelSoccerORM(
                video_id=video_id,
                frame=frame_number,
                outer_area=serialize_points(field_section.outerArea),
                penalty_area_left=serialize_points(field_section.penaltyAreaLeft),
                penalty_area_right=serialize_points(field_section.penaltyAreaRight),
                goal_area_left=serialize_points(field_section.goalAreaLeft),
                goal_area_right=serialize_points(field_section.goalAreaRight),
                middle_line=serialize_points(field_section.middleLine),
                penalty_spot=serialize_points(field_section.penaltySpot),
            )

            session.add(homography_orm)

        # Commit the transaction
        session.commit()
        return True

    except Exception as e:
        # Rollback in case of error
        session.rollback()
        raise e


async def save_homography_model_tennis(
        session: Session,
        video_id: str,
        homography_model: HomographyModelTennisAsList
):
    """
    Save a HomographyModelSoccerAsList Pydantic model to the database.

    Args:
        session: SQLAlchemy session
        video_id: ID of the video these homography models belong to
        homography_model: Pydantic model containing homography data for multiple frames
    """
    # Start a transaction
    try:
        # Process each frame in the homography model
        for frame_tuple in homography_model.root:
            frame_number, field_section = frame_tuple

            # Check if this frame already exists for this video
            existing = session.query(HomographyModelSoccerORM).filter_by(
                video_id=video_id,
                frame=frame_number
            ).first()

            if existing:
                # Delete existing entry to replace it
                session.delete(existing)
                session.flush()

            # Helper function to serialize Point objects to dictionaries
            def serialize_points(points_list):
                return [
                    {
                        "id": point.id,
                        "x": point.x,
                        "y": point.y,
                        "originalCoords": list(point.originalCoords)
                    }
                    for point in points_list
                ]

            # Create new homography model for this frame with all points as JSON
            homography_orm = HomographyModelSoccerORM(
                video_id=video_id,
                frame=frame_number,
                outer_area=serialize_points(field_section.outerArea),
                penalty_area_left=serialize_points(field_section.penaltyAreaLeft),
                penalty_area_right=serialize_points(field_section.penaltyAreaRight),
                goal_area_left=serialize_points(field_section.goalAreaLeft),
                goal_area_right=serialize_points(field_section.goalAreaRight),
                middle_line=serialize_points(field_section.middleLine),
                penalty_spot=serialize_points(field_section.penaltySpot),
            )

            session.add(homography_orm)

        # Commit the transaction
        session.commit()
        return True

    except Exception as e:
        # Rollback in case of error
        session.rollback()
        raise e


def get_homography_model(session: Session, video_id: str) -> HomographyModelSoccerAsList:
    """
    Retrieve homography data for a video and convert it back to a HomographyModelSoccerAsList
    """
    # Query all frames for this video
    results = session.query(HomographyModelSoccerORM).filter_by(video_id=video_id).all()

    # Convert each ORM object to a FieldSectionSoccer
    frame_data = []
    for result in results:
        # Helper function to convert JSON data back to Point objects
        def deserialize_points(points_json):
            return [
                Point(
                    id=point["id"],
                    x=point["x"],
                    y=point["y"],
                    originalCoords=tuple(point["originalCoords"])
                )
                for point in points_json
            ]

        # Create a FieldSectionSoccer for this frame
        field_section = FieldSectionSoccer(
            frame=result.frame,
            outerArea=deserialize_points(result.outer_area),
            penaltyAreaLeft=deserialize_points(result.penalty_area_left),
            penaltyAreaRight=deserialize_points(result.penalty_area_right),
            goalAreaLeft=deserialize_points(result.goal_area_left),
            goalAreaRight=deserialize_points(result.goal_area_right),
            middleLine=deserialize_points(result.middle_line),
            penaltySpot=deserialize_points(result.penalty_spot),
            middleCircle=deserialize_points(result.middle_circle)
        )

        # Add to the list as a tuple (frame, field_section)
        frame_data.append((result.frame, field_section))

    # Return as HomographyModelSoccerAsList
    return HomographyModelSoccerAsList.parse_obj(frame_data)
