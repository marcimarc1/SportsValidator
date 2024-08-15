from sqlalchemy import Column, VARCHAR
from ..database import Base


class User(Base):
    __tablename__ = 'users'
    username = Column(VARCHAR(50), unique=True, nullable=False, primary_key=True)
    email = Column(VARCHAR(255), unique=True, nullable=False)
    password = Column(VARCHAR(50), nullable=False)
