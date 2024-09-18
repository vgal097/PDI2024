from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.core.openai_client import update_conversation, get_conversation
from app.core.google_vision_client import extract_text_from_image_io
import io

router = APIRouter()

@router.post("/upload-image/")
async def upload_image(session_id: str = Form(...), file: UploadFile = File(...)):
    try:
        # Read the uploaded image file content
        contents = await file.read()

        # Use Google Vision OCR to extract text from the in-memory file
        extracted_text = extract_text_from_image_io(contents)

        # Get the conversation by session_id
        messages = get_conversation(session_id)

        if not isinstance(messages, list):
            raise ValueError("Messages should be a list, but got a dict.")

        # Append the extracted OCR text to the conversation
        messages.append({"role": "assistant", "content": f"Extracted text: {extracted_text}"})

        # Update the conversation in MongoDB
        update_conversation(session_id, messages)

        return {"message": "OCR text has been added to the conversation.", "session_id": session_id, "extracted_text": extracted_text}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
