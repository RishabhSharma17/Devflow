from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_user, get_task_service
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskStatusUpdate
from app.exceptions.project_exception import (
    ProjectNotFoundError,
    NotProjectMemberError,
    PermissionDeniedError,
)
from app.exceptions.task_exception import (
    TaskNotFoundError,
    InvalidTaskUpdateError,
)
from app.utils.serialize import serialize_task

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/")
async def create_task(
    project_id: str,
    task_data: TaskCreate,
    current_user=Depends(get_current_user),
    task_service=Depends(get_task_service),
    ):
    task_id = await task_service.create_task(
        project_id=project_id,
        current_user_id=str(current_user["_id"]),
        title=task_data.title,
        description=task_data.description,
        assigned_to=task_data.assigned_to
    )

    return {
        "message": "Task created successfully",
        "task_id": task_id
    }

@router.get("/")
async def get_tasks(
    project_id: str,
    skip: int = 0,
    limit: int = 0,
    status_filter: str|None = None,
    current_user=Depends(get_current_user),
    task_service=Depends(get_task_service),
    ):
    tasks = await task_service.list_tasks(
        project_id=project_id,
        current_user_id=str(current_user["_id"]),
        skip=skip,
        limit=limit,
        status=status_filter
    )

    return [serialize_task(task) for task in tasks]

@router.patch("/{task_id}")
async def update_task(
    task_id: str,
    project_id: str,
    update_data: TaskUpdate,
    current_user=Depends(get_current_user),
    task_service=Depends(get_task_service)    
    ):
    task = await task_service.update_task(
        project_id=project_id,
        task_id=task_id,
        current_user_id=str(current_user["_id"]),
        update_data=update_data.dict(exclude_unset=True)
    )

    return serialize_task(task)

@router.patch("/{task_id}/status")
async def update_status(
    project_id: str,
    task_id: str,
    status_data: TaskStatusUpdate,
    current_user=Depends(get_current_user),
    task_service=Depends(get_task_service),
    ):
    task = await task_service.update_status(
        project_id=project_id,
        task_id=task_id,
        current_user_id=str(current_user["_id"]),
        new_status=status_data.status,
    )

    return serialize_task(task)

@router.delete("/{task_id}")
async def delete_task(
    project_id: str,
    task_id: str,
    current_user=Depends(get_current_user),
    task_service=Depends(get_task_service),
    ):
    await task_service.delete_task(
        project_id=project_id,
        task_id=task_id,
        current_user_id=str(current_user["_id"]),
    )

    return {"message": "Task deleted successfully"}