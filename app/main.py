from fastapi import FastAPI
from app.api.routers import router

app = FastAPI()

app.include_router(router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the OCR and Chatbot API"}
