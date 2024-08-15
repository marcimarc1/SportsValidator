from sqlalchemy import Column, Integer, ForeignKey, VARCHAR
from pythonBackend.src.db.database import Base
from sqlalchemy.orm import relationship


class Video(Base):
    __tablename__ = 'videos'
    video_id = Column(Integer, unique=True, primary_key=True)
    video_path = Column(VARCHAR(255), unique=True, nullable=False)
    uploaded_by = Column(VARCHAR(50), ForeignKey("users.username"))
