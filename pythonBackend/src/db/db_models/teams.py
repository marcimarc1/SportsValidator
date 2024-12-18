from sqlalchemy import Column, UUID, String
from ..database import Base
import uuid


class Team(Base):
    __tablename__ = 'teams'
    __table_args__ = {'extend_existing': True}
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    team_name = Column(String(255))
