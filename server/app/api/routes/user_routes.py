from app.api.deps import required_role, get_current_user, get_user_service
from app.core.security import create_access_token, decode_token
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.user import UserCreate, UserLogin
from app.services.user_service import UserService
from app.utils.serialize import serialize_users

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/register")
async def register(
    user_data: UserCreate,
    user_service: UserService = Depends(get_user_service)
    ):
    try:
        user_id = await user_service.register(user_data.email, user_data.password)
        return {
            "message":"User registered successfully",
            "user_id": user_id
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(
    user_data: UserLogin,
    user_service: UserService = Depends(get_user_service)
    ):
    token_pair = await user_service.login(user_data.email, user_data.password)
    return {
        "message": "User logged in successfully",
        "access_token": token_pair[0],
        "refresh_token": token_pair[1],
        "token_type": "bearer"
    }

@router.get("/me")
async def get_me(
    user = Depends(get_current_user)
    ):
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "provider": user["provider"]
    }

@router.get("/all")
async def get_all_users(
    user_service: UserService = Depends(get_user_service)
    ):
    users = await user_service.get_all_users()
    return serialize_users(users)

@router.post("/refresh")
async def refresh_token(refresh_token: str):
    payload = decode_token(refresh_token)
    
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = payload.get("sub")

    new_access_token = create_access_token({"sub": user_id})

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }

@router.get("/admin-only")
async def admin_only(
    user = Depends(required_role("admin"))
):
    return {"message": "Welcome Admin"}