from datetime import datetime, timezone
from bson import ObjectId

class UserRepository:
    def __init__(self,db):
        self.db=db
        self.collection = db.users

    async def create_indexes(
        self,
        ):
        await self.collection.create_index(
            "email",
            unique=True
        )

    async def create_user(
        self,
        email: str,
        password_hash: str,
        provider: str = "local"
        ):
        now = datetime.now(timezone.utc)
        user = {
            "email": email,
            "password_hash": password_hash,
            "role":"user",
            "is_active": True,
            "is_verified": False,
            "provider": provider,
            "google_id": None,
            "created_at": now,
            "updated_at": now
        }

        result = await self.collection.insert_one(user)
        return str(result.inserted_id)
        
    async def get_all_users(self):
        users = await self.collection.find({}).to_list(length=None)
        return users

    async def get_user_by_email(self, email: str):
        return await self.collection.find_one({"email": email})

    async def get_user_by_id(self, user_id: str):
        return await self.collection.find_one({"_id": ObjectId(user_id)})