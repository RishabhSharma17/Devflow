from app.repositories.task_repository import TaskRepository
from app.repositories.project_repository import ProjectRepository
from app.exceptions.project_exception import (
    ProjectNotFoundError,
    PermissionDeniedError,
    NotProjectMemberError
)
from app.exceptions.task_exception import (
    TaskNotFoundError,
    InvalidTaskUpdateError
)

class TaskService:
    def __init__(self, task_repo: TaskRepository, project_repo: ProjectRepository):
        self.task_repo = task_repo
        self.project_repo = project_repo
    
    # helpers

    async def _get_project_or_fail(self,project_id: str):
        project = await self.project_repo.get_project_by_id(project_id)
        if not project:
            raise ProjectNotFoundError()
        return project

    async def _get_member(self,project: dict,user_id: str):
        return next(
            (m for m in project["members"]
                if str(m["user_id"])==user_id
            ),
            None
        )
    
    async def _ensure_member(self,project: dict,user_id: str):
        member = await self._get_member(project,user_id)
        if not member:
            raise NotProjectMemberError()
        return member

    async def _ensure_admin(self,project: dict,user_id: str):
        member = self._ensure_member(project,user_id)
        if member["role"] != "admin":
            raise PermissionDeniedError()

    # Methods

    async def create_task(
        self,
        project_id: str,
        current_user_id: str,
        title: str,
        description: str|None,
        assigned_to: str|None,
        ):
        project = await self._get_project_or_fail(project_id)

        self._ensure_admin(project,current_user_id)

        if assigned_to:
            assigned_member = self._ensure_member(project,assigned_to)
            if not assigned_member:
                raise NotProjectMemberError()
            
        return await self.task_repo.create_task(
            project_id=project_id,
            title=title,
            description=description,
            assigned_to=assigned_to,
            created_by=current_user_id,
        )

    async def list_tasks(
        self,
        project_id: str,
        current_user_id: str,
        skip: int,
        limit: int,
        status: str|None
        ):
        project = await self._get_project_or_fail(project_id)
        self._ensure_member(project,current_user_id)
        return await self.task_repo.list_tasks(
            project_id=project_id,
            skip=skip,
            limit=limit,
            status=status,
        )
    
    async def update_task(
        self,
        current_user_id: str,
        task_id: str,
        project_id: str,
        update_data: dict,
        ):
        if not update_data:
            raise InvalidTaskUpdateError()

        project = await self._get_project_or_fail(project_id)

        self._ensure_admin(project,current_user_id)

        task = await self.task_repo.update_task(
            task_id=task_id,
            project_id=project_id,
            update_data=update_data,
        )

        if not task:
            raise TaskNotFoundError()
        
        return task
    
    async def update_status(
        self,
        task_id: str,
        project_id: str,
        current_user_id: str,
        new_status: str
        ):
        project = await self._get_project_or_fail(project_id)
        member = await self._ensure_member(project,current_user_id)
        task = await self.task_repo.get_task_by_id(task_id,project_id)

        if not task:
            raise TaskNotFoundError()
        
        if member["role"]!="admin" and current_user_id!=task["assigned_to"]:
            raise PermissionDeniedError()
            
        
        return await self.task_repo.update_task(
            task_id=task_id,
            project_id=project_id,
            update_data={"status": new_status},
        )
    
    async def delete_task(
        self,
        project_id: str,
        task_id: str,
        current_user_id: str
        ):
        project = await self._get_project_or_fail(project_id)

        self._ensure_admin(project,current_user_id)
        
        deleted = await self.task_repo.delete_task(
            task_id=task_id,
            project_id=project_id,
        )

        if not deleted:
            raise TaskNotFoundError()

        return True