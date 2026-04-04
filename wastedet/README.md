
---

## ⚙️ Setup Instructions

### 1. Clone repository

```bash

cd waste_detection_model
python -m venv venv
venv\Scripts\activate

#to install the dependencies
pip install -r requirements.txt

#Run API
uvicorn app.main:app --reload