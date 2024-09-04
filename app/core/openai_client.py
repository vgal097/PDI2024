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
    result = conversations_collection.update_one(
        {"session_id": session_id},
        {"$set": {"messages": messages}}
    )
    print(f"Database update result: {result.modified_count} documents modified")  # Log database update

def ask_openai(session_id: str, prompt: str):
    messages = get_conversation(session_id)

    if isinstance(messages, dict): 
        raise ValueError("Messages should be a list, but got a dict.")

    # Add user prompt to messages
    messages.append({"role": "user", "content": prompt})

    try:
        # Create the streaming completion
        completion = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            stream=True  # Enable streaming
        )

        assistant_message = {"role": "assistant", "content": ""}

        # Stream each chunk of the response
        for chunk in completion:
            # Log the received chunk for debugging
            print(f"Chunk received: {chunk}")
            
            # Check if there is content in the chunk and append it to assistant_message
            if "content" in chunk.choices[0].delta:
                content_chunk = chunk.choices[0].delta.content
                print(f"Received content chunk: {content_chunk}")
                assistant_message['content'] += content_chunk
                yield content_chunk  # Yield each chunk to the client in real-time

        # Once the stream is finished, save the full assistant response
        messages.append(assistant_message)
        print(f"Full assistant message after streaming: {assistant_message['content']}")  # Log the full message
        update_conversation(session_id, messages)  # Save to the database

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


