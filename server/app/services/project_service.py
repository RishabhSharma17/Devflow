from app.repositories.project_repository import ProjectRepository
from app.repositories.user_repository import UserRepository

class ProjectService:
    def __init__(self, project_repo: ProjectRepository, user_repo: UserRepository):
        self.project_repo = project_repo
    
    async def create_project(
        self,
        name: str,
        description: str,
        user_id: str,
        ):
        return await self.project_repo.create_project(
            name=name,
            description=description,
            user_id=user_id,
        )
    
    async def get_my_projects(
        self,
        user_id: str
    ):
        return await self.project_repo.get_users_project(user_id)

    async def add_member_to_project(
    self,
    project_id: str,
    current_user: dict,
    target_user_email: str,
    user_repo,
        ):
        project = await self.project_repo.get_project_by_id(project_id)

        if not project:
            raise ValueError("Project not found")

        # Ensure current user is admin
        is_admin = any(
            str(member["user_id"]) == str(current_user["_id"])
            and member["role"] == "admin"
            for member in project["members"]
        )

        if not is_admin:
            raise ValueError("Only admin can add members")

        target_user = await user_repo.get_user_by_email(target_user_email)

        if not target_user:
            raise ValueError("User not found")

        result = await self.project_repo.add_member(
            project_id=project_id,
            user_id=str(target_user["_id"]),
            role="member",
        )

        if result.modified_count == 0:
            raise ValueError("User already a member")
        
    async def remove_member(
        self,
        user_id: str,
        project_id: str,
        current_user: dict,
        ):
        project = await self.project_repo.get_project_by_id(project_id)

        if not project:
            raise ValueError("Project not found")
        
        is_admin = any(
            str(member["user_id"]) == str(current_user["_id"])
            and member["role"] == "admin"
            for member in project["members"]
        )

        if not is_admin:
            raise ValueError("Only admin can remove members")
        
        if str(project["owner_id"]) == user_id:
            raise ValueError("Owner cannot be removed")
        
        target_member = next(
            (m for m in project["members"] 
            if str(m["user_id"]) == user_id),
            None,
        )

        if not target_member:
            raise ValueError("User is not a member of the project")
        
        admin_count = sum(
            1 for m in project["members"]
            if m["role"] == "admin"
        )

        if (
            admin_count == 1 
            and target_member["role"] == "admin"
        ):
            raise ValueError("Cannot remove last admin")
        
        result = await self.project_repo.remove_member(
            project_id,
            user_id,
        )

        if result.modified_count == 0:
            raise ValueError("Removal failed")

