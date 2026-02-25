from app.repositories.user_repository import UserRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.task_repository import TaskRepository
from app.core.database import connect_to_Mongo, close_mongo_connection
from app.api.routes.user_routes import router as user_router
from app.api.routes.project_routes import router as project_router
from app.core.exception_handlers import register_exception_handlers
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends
from app.core.database import get_db
from app.core.config import settings

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(user_router)
app.include_router(project_router)

@app.on_event("startup")
async def startup_event():
    await connect_to_Mongo()

    db = get_db()

    user_repo = UserRepository(db)
    project_repo = ProjectRepository(db)
    task_repo = TaskRepository(db)

    await user_repo.create_indexes()
    await project_repo.create_indexes()
    await task_repo.create_indexes()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection() 

@app.get("/health")
async def health_check():
    return {"status": "ok"}