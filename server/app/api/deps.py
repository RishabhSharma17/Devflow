from app.repositories.project_repository import ProjectRepository
from app.core.security import decode_token
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.database import get_db
from app.repositories.user_repository import UserRepository
from app.repositories.task_repository import TaskRepository
from app.services.user_service import UserService
from app.services.project_service import ProjectService
from app.services.task_service import TaskService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

async def get_user_repository(db: Session = Depends(get_db)):
    return UserRepository(db)

async def get_user_service(user_repo: UserRepository = Depends(get_user_repository)):
    return UserService(user_repo)

async def get_project_repository(db: Session = Depends(get_db)):
    return ProjectRepository(db)

async def get_project_service(project_repo: ProjectRepository = Depends(get_project_repository),user_repo: UserRepository = Depends(get_user_repository)):
    return ProjectService(project_repo,user_repo)

async def get_task_repository(db: Session = Depends(get_db)):
    return TaskRepository(db)

async def get_task_service(task_repo: TaskRepository = Depends(get_task_repository),project_repo: ProjectRepository = Depends(get_project_repository)):
    return TaskService(task_repo,project_repo)

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db = Depends(get_db) 
    ):
    payload = decode_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token Payload"
        )

    user_repo = UserRepository(db)
    user = await user_repo.get_user_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="user not found"
        )
    
    return user

def required_role(role: str):
    async def role_checker(
        user = Depends(get_current_user)
    ):
        if user["role"] != role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return user
    return role_checker          