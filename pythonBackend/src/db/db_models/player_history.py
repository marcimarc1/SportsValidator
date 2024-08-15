from sqlalchemy import Column, ForeignKey, Integer, Float, String
from database import Base

class Player_History(Base):
    __tablename__ ='player_history'
    id= Column(Integer, unique = True, nullable = False)
    game_id = Column(Integer, ForeignKey("games.id"), nullable = False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable = False)
    player_id = Column(Integer, ForeignKey("players.id"), nullable = False)
    minutes_played = Column(Float, nullable=False)
    injury_status = Column(String(255), nullable= False)
    distance_covered = Column(Float, nullable= False)