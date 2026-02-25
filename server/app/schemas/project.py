from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class MemberResponse(BaseModel):
    user_id: str
    role: str


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    owner_id: str
    members: List[MemberResponse]
    created_at: datetime
    updated_at: datetime