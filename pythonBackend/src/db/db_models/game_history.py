from sqlalchemy import Column, Date, ForeignKey, String, Enum
from sqlalchemy.dialects.postgresql import UUID

from ..database import Base
import uuid
from ..util.enums.sportType import SportType


class GamesHistory(Base):
    __tablename__ = 'games_history'
    __table_args__ = {'extend_existing': True}
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    name = Column(String)
    team1_id = Column(UUID, ForeignKey("teams.id"), nullable= False)
    team2_id = Column(UUID, ForeignKey("teams.id"), nullable = False)
    sportType = Column(Enum(SportType))
    date_played = Column(Date, nullable=False)
