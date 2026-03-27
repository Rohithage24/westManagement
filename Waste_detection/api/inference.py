# api/inference.py

import numpy as np
import cv2
from tensorflow.keras.models import load_model
from PIL import Image
import io

from services.config import MODEL_PATH, IMG_SIZE, CLASSES

model = load_model(MODEL_PATH)

def preprocess(image_bytes):
    try:
        # Try OpenCV
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise Exception("OpenCV failed")

    except:
        # Fallback for AVIF / unsupported formats
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img = np.array(image)
        img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img / 255.0
    img = np.expand_dims(img, axis=0)

    return img


def get_severity(confidence):
    if confidence > 0.75:
        return "High"
    elif confidence > 0.40:
        return "Medium"
    else:
        return "Low"


def predict(image_bytes):
    img = preprocess(image_bytes)
    preds = model.predict(img)[0]

    class_id = int(np.argmax(preds))
    confidence = float(np.max(preds))
    predicted_class = CLASSES[class_id]

    raw_response = {
        CLASSES[i]: float(preds[i]) for i in range(len(CLASSES))
    }

    return {
        "mlRawResponse": raw_response,
        "wastePercentage": round(confidence * 100, 2),
        "wasteType": predicted_class,
        "severity": get_severity(confidence),
        "mlConfidence": round(confidence, 4)
    }