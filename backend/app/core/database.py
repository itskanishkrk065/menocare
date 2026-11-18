"""Database engine and async session configuration."""

from typing import AsyncGenerator
from urllib.parse import urlparse, urlunparse
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from backend.app.core.config import settings


class Base(DeclarativeBase):
    """Base model class with automatic naming conventions."""
    pass


def prepare_engine_args(raw_url: str):
    """Normalizes database URL and connection arguments for SQLite, PostgreSQL, and Neon."""
    db_url = raw_url.strip()
    connect_args = {}

    if db_url.startswith("postgres://"):
        db_url = "postgresql+asyncpg://" + db_url[len("postgres://"):]
    elif db_url.startswith("postgresql://"):
        db_url = "postgresql+asyncpg://" + db_url[len("postgresql://"):]

    if "sqlite" in db_url:
        connect_args["check_same_thread"] = False
    elif "asyncpg" in db_url:
        parsed = urlparse(db_url)
        # asyncpg handles SSL via connect_args; strip incompatible query parameters
        db_url = urlunparse(parsed._replace(query=""))
        connect_args["ssl"] = True

    return db_url, connect_args


normalized_url, engine_connect_args = prepare_engine_args(settings.DATABASE_URL)

engine = create_async_engine(
    normalized_url,
    echo=False,
    connect_args=engine_connect_args,
    pool_pre_ping=True,
)

async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that yields an async database session."""
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
