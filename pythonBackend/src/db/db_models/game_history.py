from sqlalchemy import Column, Date, Integer, ForeignKey, String
from database import Base

class games_histroy(Base):
    id = Column(Integer, unique=True, nullable=False)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    team1_id = Column(Integer, ForeignKey("teams.id"), nullable= False)
    team2_id = Column(Integer, ForeignKey("teams.id"), nullable = False)
    sport_id = Column(Integer, ForeignKey("spors.id"), nullable = False)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable = False)
    video_order = Column(Integer, nullable=False)
    date_played = Column(Date, nullable = False)