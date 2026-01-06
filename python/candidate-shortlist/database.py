# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Update this to your own Postgres connection string
# Example: postgresql://username:password@localhost:5432/your_db
# SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@172.22.176.1:5432/postgres"
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres"


engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
