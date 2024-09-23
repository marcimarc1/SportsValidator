from sqlalchemy import Column, Float, Integer,ForeignKey
from db.database import Base


class H_Key(Base):
    __tablename__ = 'h_keys'
    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id"))
    frame_id = Column(Integer, nullable = False)
    h11 = Column(Float, nullable= False)
    h12 = Column(Float, nullable= False)
    h13 = Column(Float, nullable= False)
    h21 = Column(Float, nullable= False)
    h22 = Column(Float, nullable= False)
    h23 = Column(Float, nullable= False)
    h31 = Column(Float, nullable= False)
    h32 = Column(Float, nullable= False)
    h33 = Column(Float, nullable= False)