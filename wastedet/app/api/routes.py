from fastapi import APIRouter, UploadFile, File
from app.services.detection_service import predict_image

router = APIRouter()

@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()
    result = predict_image(image_bytes)
    return result