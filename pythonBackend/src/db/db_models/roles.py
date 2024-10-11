from sqlalchemy import Column, Integer, String
from ..database import Base


class Role(Base):
    __tablename__ = 'roles'
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, index=True, primary_key=True)
    role_name = Column(String(255), unique=True, nullable=False)