from sqlalchemy import Column, Integer, String
from ..database import Base


class Team(Base):
    __tablename__ = 'teams'
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String(255))
