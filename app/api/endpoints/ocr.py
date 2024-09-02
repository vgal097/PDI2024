from fastapi import APIRouter, UploadFile, File, Form
from app.core.openai_client import update_conversation, get_conversation

router = APIRouter()

def mock_ocr() -> str:
    return "Elefantes sabem voar."

@router.post("/upload-image/")
async def upload_image(session_id: str = Form(...), file: UploadFile = File(...)):
    
    extracted_text = mock_ocr()

    messages = get_conversation(session_id)

    if not isinstance(messages, list):
        raise ValueError("Messages should be a list, but got a dict.")

    messages.append({"role": "system", "content": f"OCR text: {extracted_text}"})

    # Update the conversation in MongoDB
    update_conversation(session_id, messages)

    # Respond with the updated conversation history
    return {"message": "OCR text has been added to the conversation.", "session_id": session_id}
