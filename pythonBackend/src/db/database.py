from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.pool import QueuePool
import os
import logging

logger = logging.getLogger('pg.error')
logger.setLevel(logging.DEBUG)

try:
    URL_DATABASE = os.environ.get('DATABASE_URL', 'postgresql+psycopg2://user:pass@localhost:5432')
except KeyError:
    logger.debug("Environment variable for Database does not exist")

engine = create_engine(URL_DATABASE, poolclass=QueuePool)  # Future = true enables async

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)

Base = declarative_base()
metadata = Base.metadata


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
