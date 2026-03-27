# src/config.py

IMG_SIZE = 224
BATCH_SIZE = 64
EPOCHS = 10

DATA_DIR = "data/garbage_classification"
MODEL_PATH = "models/waste_model.h5"

CLASSES = [
    'battery',
    'biological',
    'brown-glass',
    'cardboard',
    'clothes',
    'green-glass',
    'metal',
    'paper',
    'plastic',
    'shoes',
    'trash',
    'white-glass'
]