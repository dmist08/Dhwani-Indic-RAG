import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = 'Voice-Enabled Indic RAG'
    APP_ENV: str = 'development'
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = '0.0.0.0'

    # API Keys
    SARVAM_API_KEY: str = os.getenv('SARVAM_API_KEY', '')
    ELEVENLABS_API_KEY: str = os.getenv('ELEVENLABS_API_KEY', '')
    GROQ_API_KEY: str = os.getenv('GROQ_API_KEY', '')

    # Storage Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = BASE_DIR / 'data'
    QDRANT_PATH: Path = DATA_DIR / 'qdrant_db'
    CACHE_DIR: Path = DATA_DIR / 'cache'
    
    # Model Configurations
    EMBEDDING_MODEL_NAME: str = 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
    GROQ_MODEL_NAME: str = 'llama-3.1-8b-instant'
    DEFAULT_LANGUAGE: str = 'gujarati'
    
    # Retrieval & Guardrail Thresholds
    SIMILARITY_THRESHOLD: float = 0.55
    MAX_RETRIEVED_CHUNKS: int = 4
    PARENT_CONTEXT_WINDOW: int = 400

    class Config:
        env_file = '.env'
        extra = 'ignore'

settings = Settings()
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.QDRANT_PATH.mkdir(parents=True, exist_ok=True)
settings.CACHE_DIR.mkdir(parents=True, exist_ok=True)
