from fastapi import APIRouter, HTTPException
from uuid import uuid4
from app.core.openai_client import ask_openai
from app.core.database import conversations_collection
from app.models.ChatRequest import ChatRequest

router = APIRouter()

# Start a new session
@router.post("/start-session/")
async def start_session():
    session_id = str(uuid4())  # Generate a new unique session ID
    conversations_collection.insert_one({"session_id": session_id, "messages": []})
    return {"session_id": session_id}

# Chat with the bot
@router.post("/")
async def chat_with_bot(request: ChatRequest):
    response = ask_openai(request.session_id, request.message)
    return {"response": response}

# Get all session IDs
@router.get("/sessions")
async def get_sessions():
    sessions = conversations_collection.find({}, {"session_id": 1, "_id": 0})
    session_list = [session['session_id'] for session in sessions]
    return {"sessions": session_list}

# Get conversation by session ID
@router.get("/conversations/{session_id}")
async def get_conversation(session_id: str):
    conversation = conversations_collection.find_one({"session_id": session_id}, {"_id": 0, "messages": 1})
    if conversation is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"messages": conversation['messages']}
