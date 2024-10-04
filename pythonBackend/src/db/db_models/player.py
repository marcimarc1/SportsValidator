from sqlalchemy import Column, Integer,String, ForeignKey
from ..database import Base

class Player(Base):
    __tablename__ = 'players'
    id = Column(Integer, primary_key= True, index=True)
    name = Column(String(255), nullable=False )
    team_id = Column(Integer, ForeignKey("teams.id"))