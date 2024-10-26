from sqlalchemy import Column, Date, Integer, ForeignKey, String
from ..database import Base

class Game(Base):
    __tablename__ = 'games'
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True, index=True)
    team1_id = Column(Integer, ForeignKey("teams.id"), nullable= False)
    team2_id = Column(Integer, ForeignKey("teams.id"), nullable = False)
    sport_id = Column(Integer, ForeignKey("sports.id"), nullable = False)
    date_played = Column(Date)
    path = Column(String, nullable =True)