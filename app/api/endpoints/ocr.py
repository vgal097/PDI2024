from fastapi import APIRouter, UploadFile, File, BackgroundTasks
from app.core.openai_client import ask_openai
from app.core.state import last_extracted_text

router = APIRouter()

def send_to_chatbot(extracted_text: str):
    global last_extracted_text
    last_extracted_text = extracted_text
    question = "What can you tell me about this text?"
    openai_response = ask_openai(f"{extracted_text}\n\n{question}")
    print("Chatbot response:", openai_response)

@router.post("/process-image/")
async def process_image(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    # Mocking the OCR extraction for now
    extracted_text = "This is a mocked extracted and translated text."

    # Send the extracted text to the chatbot in the background and store it
    background_tasks.add_task(send_to_chatbot, extracted_text)

    return {"message": "Mocked text sent to chatbot for testing."}
