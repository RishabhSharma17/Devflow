from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8,max_length=72)

class UserBase(BaseModel):
    id: str
    email: EmailStr
    is_active: bool
    is_verified: bool
    provider: str
    created_at: datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8,max_length=72)