from sqlalchemy import Column, Integer, ForeignKey, String
from ..database import Base


class Video(Base):
    __tablename__ = 'videos'
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, unique=True, primary_key=True)
    video_path = Column(String(255), unique=True, nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
