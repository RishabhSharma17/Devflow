from bson import ObjectId

def serialize_project(project: dict) -> dict:
    project["id"] = str(project["_id"])
    project["owner_id"] = str(project["owner_id"])

    for member in project["members"]:
        member["user_id"] = str(member["user_id"])

    del project["_id"]

    return project


def serialize_task(task: dict) -> dict:
    return {
        "id": str(task["_id"]),
        "project_id": str(task["project_id"]),
        "title": task["title"],
        "description": task.get("description"),
        "status": task["status"],
        "created_by": str(task["created_by"]),
        "assigned_to": (
            str(task["assigned_to"])
            if task.get("assigned_to")
            else None
        ),
        "created_at": task["created_at"],
        "updated_at": task["updated_at"],
    }