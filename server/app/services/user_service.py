from app.repositories.user_repository import UserRepository
from app.core.security import hash_password,verify_password,create_access_token, create_refresh_token

class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo=user_repo

    async def create_index(self):
        await self.user_repo.create_indexes()

    async def register(self,email: str,password: str):
        existing_user = await self.user_repo.get_user_by_email(email)

        if existing_user:
            raise ValueError("User already exists")
        
        password_hash = hash_password(password)

        user_id = await self.user_repo.create_user(
            email,
            password_hash,
            provider="local"
        )

        return user_id

    async def get_all_users(self):
        return await self.user_repo.get_all_users()

    async def login(self,email: str,password: str) -> str:
        user = await self.user_repo.get_user_by_email(email)
        
        if not user:
            raise ValueError("Invalid Credentials")
        
        if not verify_password(password,user["password_hash"]):
            raise ValueError("Invalid Password")

        access_token = create_access_token({
            "sub": str(user["_id"]),
            "role": user["role"]
        })

        refresh_token = create_refresh_token({
            "sub": str(user["_id"]),
            "role": user["role"]
        })

        return access_token,refresh_token