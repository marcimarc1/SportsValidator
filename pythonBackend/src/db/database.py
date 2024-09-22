from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.pool import QueuePool

# Todo: Add Environment
URL_DATABASE = "postgresql+psycopg2://user:pass@localhost:5432/postgres"

engine = create_engine(URL_DATABASE, poolclass=QueuePool)  # Future = true enables async

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
