from ultralytics import YOLO
import os

# 🔥 Ensure correct dataset path
DATA_YAML_PATH = os.path.join("dataset", "data.yaml")

# 🔍 Debug check (VERY IMPORTANT)
if not os.path.exists(DATA_YAML_PATH):
    raise FileNotFoundError(f"❌ data.yaml not found at {DATA_YAML_PATH}")

print(f"✅ Using dataset config: {DATA_YAML_PATH}")

# 🚀 Load pretrained YOLO model
model = YOLO("yolov8n.pt")

# 🔥 Train model
model.train(
    data=DATA_YAML_PATH,   # dataset config
    epochs=25,             # increase for better accuracy
    imgsz=640,
    batch=8,
    name="garbage_model",
    device="cpu"           # use "0" if GPU available
)

print("🔥 Training completed successfully!")