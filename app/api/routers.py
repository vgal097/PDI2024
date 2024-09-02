from fastapi import APIRouter
from app.api.endpoints import ocr, chat

router = APIRouter()
router.include_router(ocr.router, prefix="/ocr", tags=["OCR"])
router.include_router(chat.router, prefix="/chat", tags=["Chat"])
