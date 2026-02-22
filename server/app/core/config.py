from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str
    APP_ENV: str

    MONGO_URL: str
    MONGO_DB: str

    JWT_SECRET: str
    JWT_ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int

    GOOGLE_CLIENT_ID: str

    class Config:
        env_file = ".env"

settings = Settings()