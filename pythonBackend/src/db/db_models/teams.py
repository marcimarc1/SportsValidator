from sqlalchemy import Column, Integer, VARCHAR
from pythonBackend.src.db.database import Base


class Team(Base):
    __tablename__ = 'teams'
    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(VARCHAR(255))
