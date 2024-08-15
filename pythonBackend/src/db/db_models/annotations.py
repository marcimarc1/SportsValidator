from sqlalchemy import Column, Integer, Float
from src.db.database import Base


class Annotation(Base):
    __tablename__ = 'annotations'
    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, nullable=False)
    track_id = Column(Integer, nullable=False)
    frame_numer = Column(Integer, nullable=False)
    x = Column(Float, nullable=False)
    y = Column(Float, nullable=False)
    w = Column(Float, nullable=False)
    h = Column(Float, nullable=False)
    x2 = Column(Float, nullable=False)
    y2 = Column(Float, nullable=False)
    x1 = Column(Float, nullable=False)
    y1 = Column(Float, nullable=False)
    x_trans = Column(Float, nullable=False)
    y_trans = Column(Float, nullable=False)
