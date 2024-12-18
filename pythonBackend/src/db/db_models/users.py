from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base
import uuid


class User(Base):
    __tablename__ = 'users'
    __table_args__ = {'extend_existing': True}
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(50), nullable=False)
