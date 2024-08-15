from sqlalchemy import Column, Integer, VARCHAR
from pythonBackend.src.db.database import Base


class Role(Base):
    __tablename__ = 'roles'
    id = Column(Integer, index=True, primary_key=True)
    role_name = Column(VARCHAR(255), unique=True, nullable=False)