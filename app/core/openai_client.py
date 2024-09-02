import openai
from fastapi import HTTPException
from app.core.database import conversations_collection

def get_conversation(session_id: str):
    conversation = conversations_collection.find_one({"session_id": session_id})
    if conversation is None:
        conversation = {"session_id": session_id, "messages": []}
        conversations_collection.insert_one(conversation)
    return conversation['messages']

def update_conversation(session_id: str, messages: list):
    conversations_collection.update_one(
        {"session_id": session_id},
        {"$set": {"messages": messages}}
    )

def ask_openai(session_id: str, prompt: str) -> str:
    messages = get_conversation(session_id)
    messages.append({"role": "user", "content": prompt})
    
    try:
        completion = openai.chat.completions.create(
            model="gpt-3.5-turbo", 
            messages=messages,
        )
        response = completion.choices[0].message.content.strip()
        messages.append({"role": "assistant", "content": response})
        update_conversation(session_id, messages)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
