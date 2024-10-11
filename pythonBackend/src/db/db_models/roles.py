from sqlalchemy import Column, Integer, String
from ..database import Base


class Role(Base):
    __tablename__ = 'roles'
    id = Column(Integer, index=True, primary_key=True)
    role_name = Column(String(255), unique=True, nullable=False)