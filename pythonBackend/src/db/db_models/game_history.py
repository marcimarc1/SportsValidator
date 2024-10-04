from sqlalchemy import Column, Date, Integer, ForeignKey, String
from ..database import Base

class GamesHistory(Base):
    __tablename__ = 'games_history'
    id = Column(Integer, primary_key=True, index=True)
    # game_id = Column(Integer, ForeignKey("games.id"), nullable=False) TODO: Add Game model
    team1_id = Column(Integer, ForeignKey("teams.id"), nullable= False)
    team2_id = Column(Integer, ForeignKey("teams.id"), nullable = False)
    sport_id = Column(Integer, ForeignKey("sports.id"), nullable = False)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable = False)
    video_order = Column(Integer, nullable=False)
    date_played = Column(Date, nullable = False)