from sqlalchemy import Column, Float, Integer,ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base
import uuid


class H_Key(Base):
    __tablename__ = 'h_keys'
    __table_args__ = {'extend_existing': True}
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    video_id = Column(UUID, ForeignKey("videos.id"))
    frame_number = Column(Integer, nullable = False)
    h11 = Column(Float, nullable= False)
    h12 = Column(Float, nullable= False)
    h13 = Column(Float, nullable= False)
    h21 = Column(Float, nullable= False)
    h22 = Column(Float, nullable= False)
    h23 = Column(Float, nullable= False)
    h31 = Column(Float, nullable= False)
    h32 = Column(Float, nullable= False)
    h33 = Column(Float, nullable= False)