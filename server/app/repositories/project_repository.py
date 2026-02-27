from datetime import datetime, timezone
from bson import ObjectId

class ProjectRepository:
    def __init__(self,db):
        self.db = db
        self.collection = db.projects

    async def create_indexes(self):
        await self.collection.create_index("members.user_id")

    async def create_project(
        self,
        name: str,
        description: str,
        user_id: str,
        email: str
        ):
        now = datetime.now(timezone.utc)
        project={
            "name": name,
            "description": description,
            "owner_id": ObjectId(user_id),
            "members": [
                {
                    "user_id": ObjectId(user_id),
                    "user_email": str(email),
                    "role": "admin"
                }
            ],
            "created_at": now,
            "updated_at": now
        }

        result = await self.collection.insert_one(project)
        return str(result.inserted_id)
    
    async def get_project_by_id(
        self,
        project_id: str,
        ):
        return await self.collection.find_one({
            "_id": ObjectId(project_id)
        })
    
    async def get_users_project(
        self,
        user_id: str,
        ):
        return await self.collection.find({
            "members.user_id": ObjectId(user_id)
        }).to_list(length=100)
    
    async def change_role(
        self,
        project_id: str,
        target_user_id: str,
        role: str
        ):
        return await self.collection.update_one(
            {
                "_id": ObjectId(project_id),
                "members.user_id": ObjectId(target_user_id)
            },
            {
                "$set": {
                    "members.$.role": role
                }
            }
        )

    async def add_member(
        self,
        project_id: str,
        user_id: str,
        user_email: str,
        role: str = "member"
        ):
        return await self.collection.update_one(
            {
                "_id": ObjectId(project_id),
                "members": {
                    "$not": {
                        "$elemMatch": {
                            "user_id": ObjectId(user_id)
                        }
                    }
                }
            },
            {
                "$push": {
                    "members": {
                        "user_id": ObjectId(user_id),
                        "user_email": user_email,
                        "role": role
                    }
                },
                "$set": {
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )

    async def remove_member(
        self,
        project_id,
        user_id,
        ):
        return await self.collection.update_one(
            {
                "_id": ObjectId(project_id)
            },
            {
                "$pull": {
                    "members":{
                        "user_id": ObjectId(user_id)
                    }
                },
                "$set": {
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )