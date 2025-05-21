from sqlalchemy import Column, Integer,String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base
import uuid

class Player(Base):
    __tablename__ = 'players'
    __table_args__ = {'extend_existing': True}
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False )
    team_id = Column(UUID, ForeignKey("teams.id"))