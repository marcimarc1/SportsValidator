from sqlalchemy import Column, ForeignKey, Integer, String
from db.database import Base

class Access_Role(Base):
    __tablename__ = 'access_roles'
    username = Column(String, ForeignKey("users.username"))
    role_id = Column(Integer, ForeignKey("roles.id"))
    team_id = Column(Integer, ForeignKey("team.id"))