from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OLLAMA_URL: str
    OLLAMA_MODEL: str
    JAVA_BACKEND_BASE: str
    
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    @property
    def TOUR_API(self):
        return f"{self.JAVA_BACKEND_BASE}/data"

    class Config:
        env_file = ".env"

settings = Settings()