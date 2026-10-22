from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# For production, set DATABASE_URL to a Postgres connection string, e.g.:
#   postgresql://user:password@host:5432/tamagift
# SQLite is used here only for local development and this demo run.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tamagift.db")

# Render, Heroku and some other providers still hand out "postgres://" URLs,
# but modern SQLAlchemy only recognizes "postgresql://". Without this fix,
# a real deployment fails immediately on startup with a confusing dialect error.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
# pool_pre_ping: el pooler de Supabase cierra las conexiones quietas;
# sin comprobarlas antes de usarlas, la primera petición después de un
# rato fallaba con un 500 (y quien abría el regalo veía un error).
engine_kwargs = {} if DATABASE_URL.startswith("sqlite") else {"pool_pre_ping": True, "pool_recycle": 300}
engine = create_engine(DATABASE_URL, connect_args=connect_args, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
