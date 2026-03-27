# ♻️ Waste Detection ML API

This project provides a Machine Learning API to detect waste type from images using FastAPI.

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository
```bash
git clone <your-repo-url>
cd Waste_detection

Create virtual environment
python -m venv venv
venv\Scripts\activate

## Download Pretrained Model

Download model from:
https://drive.google.com/uc?id=1jTBaNVgcb0ON1NzRTvXzF2Ir1xyfNVvu
Place it in:
models/waste_model.h5

 Install dependencies
pip install -r requirements.txt

Run FastAPI Server
uvicorn api.main:app --reload

API will run at:

http://127.0.0.1:8000

Swagger Docs:

http://127.0.0.1:8000/docs

