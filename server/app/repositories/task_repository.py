from datetime import datetime,timezone
from bson import ObjectId

class TaskRepository:
    def __init__(self,db):
        self.db = db
        self.collection = db.tasks

    async def create_indexes(self):
        await self.collection.create_index("project_id")

        await self.collection.create_index(
            [("project_id",1),("status",1)]
        )

        await self.collection.create_index(
            [("project_id",1),("created_at",-1)]
        )
    
    async def create_task(
        self,
        project_id: str,
        title: str,
        description: str|None,
        created_by: str,
        assigned_to: str|None
        ):
        now = datetime.now(timezone.utc)
        task = {
            "project_id": ObjectId(project_id),
            "title": title,
            "description": description,
            "status": "todo",
            "created_by": ObjectId(created_by),
            "assigned_to": assigned_to if assigned_to else None,
            "created_at": now,
            "updated_at": now
        }

        result = await self.collection.insert_one(task)
        return str(result.inserted_id)
    
    async def get_task_by_id(
        self,
        task_id: str,
        project_id: str
        ):
        return await self.collection.find_one({
            "_id": ObjectId(task_id),
            "project_id": ObjectId(project_id)
        })
    
    async def list_tasks(
        self,
        project_id: str,
        skip: int = 0,
        limit: int = 10,
        status: str|None = None
        ):
        query = {
            "project_id": ObjectId(project_id)
        }

        if status:
            query["status"] = status
        
        cursor = (
            self.collection.find(query)
            .sort("created_at",-1)
            .skip(skip)
            .limit(limit)
        )

        return [task async for task in cursor]
    
    async def update_task(
        self,
        project_id: str,
        task_id: str,
        update_data: dict
        ):
        update_data["updated_at"] = datetime.now(timezone.utc)

        return await self.collection.find_one_and_update(
            {
                "_id": ObjectId(task_id),
                "project_id": ObjectId(project_id),
            },
            {
                "$set": update_data
            },
            return_document=True,
        )
    
    async def delete_task(
        self,
        project_id: str,
        task_id: str
        ):
        return await self.collection.find_one_and_delete(
            {
                "_id": ObjectId(task_id),
                "project_id": ObjectId(project_id)
            }
        )