from sqlalchemy import Column, Integer, String
from ..database import Base

class Sport(Base):
    __tablename__ ='sports'
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)


class SportType(Enum):
    Football: 1
    Tennis: 2
    Basketball: 3