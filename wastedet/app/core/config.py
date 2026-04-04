from ultralytics import YOLO
from app.core.config import MODEL_PATH

def load_model():
    return YOLO(MODEL_PATH)