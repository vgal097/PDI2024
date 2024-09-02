from pymongo import MongoClient
from app.core.config import settings

client = MongoClient(settings.mongodb_uri)
db = client.chatbotDB 
conversations_collection = db.conversations
