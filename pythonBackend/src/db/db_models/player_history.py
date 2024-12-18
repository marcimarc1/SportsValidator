from sqlalchemy import Column, ForeignKey, Integer, Float, String
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base
import uuid


class PlayerHistory(Base):
    __tablename__ = 'player_history'
    __table_args__ = {'extend_existing': True}
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    team_id = Column(UUID, ForeignKey("teams.id"), nullable=False)
    player_id = Column(UUID, ForeignKey("players.id"), nullable=False)
    minutes_played = Column(Float, nullable=False)
    injury_status = Column(String(255), nullable=False)
    distance_covered = Column(Float, nullable=False)
