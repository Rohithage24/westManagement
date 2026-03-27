# api/main.py

from fastapi import FastAPI, UploadFile, File
from api.inference import predict

app = FastAPI(title="Waste Detection API")

@app.get("/")
def home():
    return {"message": "Waste Detection API Running 🚀"}

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    image_bytes = await file.read()
    result = predict(image_bytes)
    return result