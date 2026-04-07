
---

## ⚙️ Setup Instructions
⚠️ IMPORTANT: Download Trained Model

The trained model is not included in this repository.

👉 Download it from Google Drive:
https://drive.google.com/drive/folders/1sOfdQzz_eyeIyIZR7F5QWpPQzogqGiYt

📥 After Download

Place the model in this path:

1 create the "runs" folder 

runs/detect/garbage_model3/weights/best.pt

👉 Create folders manually if not present

### 1. Clone repository

```bash

cd waste_detection_model
python -m venv venv
venv\Scripts\activate

#to install the dependencies
pip install -r requirements.txt

#Run API
uvicorn app.main:app --reload