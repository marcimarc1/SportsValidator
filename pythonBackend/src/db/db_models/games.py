from sqlalchemy import Column, Date, ForeignKey, String, Enum
from ..database import Base
from sqlalchemy.dialects.postgresql import UUID
import uuid

from ..util.enums.sportType import SportType


class Game(Base):
    __tablename__ = 'games'
    __table_args__ = {'extend_existing': True}
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    team1_id = Column(UUID, ForeignKey("teams.id"), nullable= False)
    team1_name = Column(String, nullable=False)
    team2_id = Column(UUID, ForeignKey("teams.id"), nullable = False)
    team2_name = Column(String, nullable=False)
    sportType = Column(Enum(SportType))
    date_played = Column(Date)
