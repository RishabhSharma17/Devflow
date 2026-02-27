from app.exceptions.project_exception import NotProjectMemberError
from app.exceptions.project_exception import UserAlreadyMemberError
from app.exceptions.project_exception import UserNotFoundError
from app.repositories.project_repository import ProjectRepository
from app.repositories.user_repository import UserRepository
from app.exceptions.project_exception import *
from bson import ObjectId

class ProjectService:
    def __init__(self, project_repo: ProjectRepository, user_repo: UserRepository):
        self.project_repo = project_repo
        self.user_repo = user_repo
    
    async def _get_project_or_fail(self, project_id: str):
        project = await self.project_repo.get_project_by_id(project_id)
        if not project:
            raise ProjectNotFoundError()
        return project

    def _get_member(self, project: dict, user_id: str):
        try:
            user_obj_id = ObjectId(user_id)
        except Exception:
            return None
        user = next(
            (m for m in project["members"]
             if m["user_id"] == user_obj_id 
            ),
            None
        )
        return user

    def _ensure_admin(self, project: dict, user_id: str):
        member = self._get_member(project, user_id)
        if not member:
            raise NotProjectMemberError()

        if member["role"] != "admin":
            raise PermissionDeniedError()

    async def create_project(
        self,
        name: str,
        description: str,
        user_id: str,
        email: str
        ):
        return await self.project_repo.create_project(
            name=name,
            description=description,
            user_id=user_id,
            email=email
        )
    
    async def get_my_projects(
        self,
        user_id: str
    ):
        return await self.project_repo.get_users_project(user_id)

    async def change_role(
        self,
        project_id: str,
        current_user_id: str,
        target_user_id: str,
        role: str
        ):
        project = await self._get_project_or_fail(project_id)

        self._ensure_admin(project, current_user_id)

        target_member = self._get_member(project, target_user_id)

        if not target_member:
            raise NotProjectMemberError()
        
        if not role in ["admin", "member"]:
            raise InvalidRoleError()
        
        result = await self.project_repo.change_role(
            project_id=project_id,
            target_user_id=target_user_id,
            role=role,
        )

        if result.modified_count == 0:
            raise RoleChangeFailedError()
        
        return True

    async def add_member_to_project(
        self,
        project_id: str,
        current_user_id: str,
        target_user_email: str,
        ):
        project = await self._get_project_or_fail(project_id)

        # Ensure current user is admin
        self._ensure_admin(project, current_user_id)

        target_user = await self.user_repo.get_user_by_email(target_user_email)

        if not target_user:
            raise UserNotFoundError()

        result = await self.project_repo.add_member(
            project_id=project_id,
            user_id=str(target_user["_id"]),
            user_email=target_user["email"],
            role="member",
        )

        if result.modified_count == 0:
            raise UserAlreadyMemberError()
        
    async def remove_member(
        self,
        project_id: str,
        user_id: str,
        current_user_id: str,
        ):
        project = await self._get_project_or_fail(project_id)

        # Only admin can remove
        self._ensure_admin(project, current_user_id)

        # Owner cannot be removed
        if str(project["owner_id"]) == user_id:
            raise CannotRemoveOwnerError()

        target_member = self._get_member(project, user_id)

        if not target_member:
            raise NotProjectMemberError()

        admin_count = sum(
            1 for m in project["members"]
            if m["role"] == "admin"
        )

        if (
            admin_count == 1
            and target_member["role"] == "admin"
        ):
            raise CannotRemoveLastAdminError()

        result = await self.project_repo.remove_member(
            project_id,
            user_id,
        )

        if result.modified_count == 0:
            raise MemberRemovalFailedError()

        return True