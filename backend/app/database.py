"""
app/database.py — MongoDB (Motor async driver) connection handling.
"""
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from app.config import settings

logger = logging.getLogger("vidhya.database")


class Database:
    client = None
    db = None


database = Database()


async def connect_to_mongo():
    logger.info("Connecting to MongoDB...")
    try:
        database.client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
        database.db = database.client[settings.MONGODB_DB_NAME]
        # Verify the connection actually works
        await database.client.admin.command("ping")
        logger.info("MongoDB connection established (db=%s)", settings.MONGODB_DB_NAME)
    except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
        logger.warning(f"MongoDB connection failed: {e}. Falling back to mock database...")
        from mongomock_motor import AsyncMongoMockClient
        database.client = AsyncMongoMockClient()
        database.db = database.client[settings.MONGODB_DB_NAME]
        logger.info("In-memory MongoDB mock established.")
    
    await create_indexes()


async def close_mongo_connection():
    if database.client:
        database.client.close()
        logger.info("MongoDB connection closed")


async def create_indexes():
    db = database.db
    await db.users.create_index("email", unique=True)
    await db.flashcards.create_index("user_id")
    await db.study_plans.create_index("user_id")
    await db.progress.create_index("user_id", unique=True)
    await db.test_attempts.create_index("user_id")
    await db.notifications.create_index("user_id")


def get_db():
    return database.db
