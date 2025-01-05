from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from .roles import Role
from .teams import Team
from .users import User
from ..database import Base
import uuid

class Access_Role(Base):
    __tablename__ = 'access_roles'
    __table_args__ = {'extend_existing': True}
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    user_id = Column(UUID, ForeignKey(User.id))
    role_id = Column(UUID, ForeignKey(Role.id))
    team_id = Column(UUID, ForeignKey(Team.id))
