from sqlalchemy import Column, Integer, String
from db.database import Base

class Sport(Base):
    __tablename__ ='sports'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)