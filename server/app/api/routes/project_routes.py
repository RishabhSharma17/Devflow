from fastapi import Depends, HTTPException, status, APIRouter
from app.schemas.project import ProjectCreate, ProjectResponse
from app.api.deps import get_current_user,get_project_service

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
        user_id=current_user["_id"]
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

    serialized_projects = []

    for project in projects:
        project["id"] = str(project["_id"])
        project["owner_id"] = str(project["owner_id"])

        for member in project["members"]:
            member["user_id"] = str(member["user_id"])

        del project["_id"]

        serialized_projects.append(project)

    return serialized_projects

@router.post("{project_id}/remove-member")
async def remove_member(
    project_id: str,
    user_id: str,
    current_user = Depends(get_current_user),
    project_service = Depends(get_project_service)
    ):
    try:
        await project_service.remove_member(
            user_id=user_id,
            project_id=project_id,
            current_user=current_user,
        )
        return {"message": "Member removed successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))