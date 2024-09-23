from sqlalchemy import Column, Integer, String
from db.database import Base


class Team(Base):
    __tablename__ = 'teams'
    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String(255))
