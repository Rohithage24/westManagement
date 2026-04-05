from ultralytics import YOLO
import numpy as np
import cv2

# Load trained model
model = YOLO("runs/detect/garbage_model3/weights/best.pt")

CONFIDENCE_THRESHOLD = 0.5

def predict_image(image_bytes):
    # Convert bytes → numpy image
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    results = model(img)

    detections = results[0].boxes

    # ❌ No garbage detected
    if detections is None or len(detections) == 0:
        return {
            "status": "not_garbage",
            "confidence": 0.0,
            "message": "No garbage detected"
        }

    # ✅ Garbage detected
    max_conf = 0

    for box in detections:
        conf = float(box.conf[0])
        if conf > max_conf:
            max_conf = conf

    if max_conf < CONFIDENCE_THRESHOLD:
        return {
            "status": "not_garbage",
            "confidence": round(max_conf, 4),
            "message": "Low confidence detection"
        }

    return {
        "status": "garbage",
        "confidence": round(max_conf, 4),
        "message": "Garbage detected successfully"
    }