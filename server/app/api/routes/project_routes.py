from fastapi import Depends, HTTPException, status, APIRouter
from app.api.deps import get_current_user,get_project_service
from app.exceptions.project_exception import *
from app.utils.serialize import serialize_project
from app.schemas.project import ProjectCreate

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("/")
async def create_project(
    project_data: ProjectCreate,
    current_user = Depends(get_current_user),
    project_service = Depends(get_project_service)
    ):
    project_id = await project_service.create_project(
        name=project_data.name,
        description=project_data.description,    
        user_id=current_user["_id"],
        email=current_user["email"]
    )

    return {
        "message": "Project created successfully",
        "project_id": project_id
    }

@router.get("/")
async def get_my_projects(
    current_user=Depends(get_current_user),
    project_service=Depends(get_project_service)
    ):
    projects = await project_service.get_my_projects(current_user["_id"])

    return [serialize_project(p) for p in projects]

@router.patch("/{project_id}/change-role")
async def change_role(
    project_id: str,
    target_user_id: str,
    role: str,
    current_user = Depends(get_current_user),
    project_service = Depends(get_project_service)
    ):
    await project_service.change_role(
        project_id=project_id,
        target_user_id=target_user_id,
        role=role,
        current_user_id=str(current_user["_id"]),
    )

    return {
        "message": "Role changed successfully"
    }

@router.post("/{project_id}/add-member")
async def add_member(
    project_id: str,
    target_user_email: str,
    current_user=Depends(get_current_user),
    project_service=Depends(get_project_service),
    ):
    await project_service.add_member_to_project(
        project_id=project_id,
        current_user_id=str(current_user["_id"]),
        target_user_email=target_user_email,
    )

    return {"message": "Member added successfully"}

@router.post("/{project_id}/remove-member")
async def remove_member(
    project_id: str,
    user_id: str,
    current_user = Depends(get_current_user),
    project_service = Depends(get_project_service)
    ):
    await project_service.remove_member(
        user_id=user_id,
        project_id=project_id,
        current_user_id=current_user["_id"],
    )
    return {"message": "Member removed successfully"}