from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base
import uuid


class Role(Base):
    __tablename__ = 'roles'
    __table_args__ = {'extend_existing': True}
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    role_name = Column(String(255), unique=True, nullable=False)