from sqlalchemy import Column, ForeignKey, Integer, Float, String
from ..database import Base


class PlayerHistory(Base):
    __tablename__ = 'player_history'
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True, index=True)
    # game_id = Column(Integer, ForeignKey("games.id"), nullable=False) TODO: Add Game Model
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    minutes_played = Column(Float, nullable=False)
    injury_status = Column(String(255), nullable=False)
    distance_covered = Column(Float, nullable=False)
