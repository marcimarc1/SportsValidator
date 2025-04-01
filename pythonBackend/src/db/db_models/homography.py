from sqlalchemy import Column, Integer, String, JSON, UniqueConstraint

from ..database import Base


class HomographyModelSoccerORM(Base):
    __tablename__ = 'homography_model_soccer'

    id = Column(Integer, primary_key=True, autoincrement=True)
    video_id = Column(String, nullable=False)
    frame = Column(Integer, nullable=False)

    # Store points as JSON data
    outer_area = Column(JSON, nullable=False, default=list)
    penalty_area_left = Column(JSON, nullable=False, default=list)
    penalty_area_right = Column(JSON, nullable=False, default=list)
    goal_area_left = Column(JSON, nullable=False, default=list)
    goal_area_right = Column(JSON, nullable=False, default=list)
    middle_line = Column(JSON, nullable=False, default=list)
    penalty_spot = Column(JSON, nullable=False, default=list)
    # filter_boxes = Column(JSON, nullable=False, default=list)

    # Ensure video_id + frame is unique
    __table_args__ = (UniqueConstraint('video_id', 'frame', name='_video_frame_uc'),)


class HomographyModelTennisORM(Base):
    __tablename__ = 'homography_model_tennis'

    id = Column(Integer, primary_key=True, autoincrement=True)
    video_id = Column(String, nullable=False)
    frame = Column(Integer, nullable=False)

    # Store points as JSON data
    outer_area = Column(JSON, nullable=False, default=list)
    baseline_centerline = Column(JSON, nullable=False, default=list)
    baseline_single = Column(JSON, nullable=False, default=list)
    center_net = Column(JSON, nullable=False, default=list)
    single_net = Column(JSON, nullable=False, default=list)
    side_net = Column(JSON, nullable=False, default=list)
    service_single = Column(JSON, nullable=False, default=list)
    filter_boxes = Column(JSON, nullable=False, default=list)

    # Ensure video_id + frame is unique
    __table_args__ = (UniqueConstraint('video_id', 'frame', name='_video_frame_uc'),)
