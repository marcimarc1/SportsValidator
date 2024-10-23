from sqlalchemy import Column, ForeignKey, Integer
from ..database import Base

class Access_Role(Base):
    __tablename__ = 'access_roles'
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    role_id = Column(Integer, ForeignKey("roles.id"))
    team_id = Column(Integer, ForeignKey("teams.id"))
