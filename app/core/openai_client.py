import openai
from fastapi import HTTPException

# In-memory storage for conversation history
conversation_history = {}

def get_conversation(session_id: str):
    if session_id not in conversation_history:
        conversation_history[session_id] = []
    return conversation_history[session_id]

def ask_openai(session_id: str, prompt: str) -> str:
    messages = get_conversation(session_id)
    messages.append({"role": "user", "content": prompt})
    
    try:
        # Use the new format for creating a chat completion
        completion = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
        )
        response = completion.choices[0].message.content.strip()
        messages.append({"role": "assistant", "content": response})
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
