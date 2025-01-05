from sqlalchemy import Column, Integer, Float, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from .games import Game
from .videos import Video
from ..database import Base
import uuid

from ..util.enums.annotationType import AnnotationType


class Annotation(Base):
    __tablename__ = 'annotations'
    __table_args__ = {'extend_existing': True}
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    video_id = Column(UUID, ForeignKey(Video.id), nullable=False)
    game_id = Column(UUID, ForeignKey(Game.id), nullable=False)
    frame_number = Column(Integer, nullable=False)
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
    type = Column(Enum(AnnotationType), nullable=False)
    in_field = Column(Boolean, nullable=False)

