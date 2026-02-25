from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional
from datetime import datetime

class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"

class TaskCreate(BaseModel):
    title: str = Field(...,min_length=1,max_length=100)
    description: Optional[str] = Field(None,min_length=1,max_length=500)
    assigned_to: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None,min_length=1,max_length=100)
    description: Optional[str] = Field(None,min_length=1,max_length=500)
    assigned_to: Optional[str] = None

class TaskStatusUpdate(BaseModel):
    status: TaskStatus

class TaskResponse(BaseModel):
    id: str
    project_id: str
    title: str
    description: Optional[str] = None
    status: TaskStatus
    created_by: str
    assigned_to: Optional[str] = None
    created_at: datetime
    updated_at: datetime