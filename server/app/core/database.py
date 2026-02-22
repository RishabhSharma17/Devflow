from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

class MongoDB:
    client: AsyncIOMotorClient | None = None

mongodb = MongoDB()

async def connect_to_Mongo():
    mongodb.client = AsyncIOMotorClient(settings.MONGO_URL)
    db = mongodb.client[settings.MONGO_DB]
    await db.users.create_index("email", unique=True)

async def close_mongo_connection():
    mongodb.client.close()

def get_db() -> AsyncIOMotorDatabase:
    return mongodb.client[settings.MONGO_DB]