from fastapi import FastAPI
from app.core.config import settings
from app.core.database import connect_to_Mongo, close_mongo_connection
from app.api.routes.user_routes import router as user_router
from app.api.routes.project_routes import router as project_router

app = FastAPI(title=settings.APP_NAME)

app.include_router(user_router)
app.include_router(project_router)

@app.on_event("startup")
async def startup_event():
    await connect_to_Mongo()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection() 

@app.get("/health")
async def health_check():
    return {"status": "ok"}