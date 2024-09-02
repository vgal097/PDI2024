import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    openai_api_key: str = os.getenv("OPENAI_API_KEY")
    mongodb_uri: str = os.getenv("MONGODB_URI")
    google_credentials: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

settings = Settings()
