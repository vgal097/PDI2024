from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from uuid import uuid4
from app.core.openai_client import ask_openai

router = APIRouter()

class ChatRequest(BaseModel):
    session_id: str
    message: str

@router.post("/")
async def chat_with_bot(request: ChatRequest):
    response = ask_openai(request.session_id, request.message)
    return {"response": response}

@router.post("/start-session/")
async def start_session():
    session_id = str(uuid4())  # Generate a new unique session ID
    return {"session_id": session_id}
