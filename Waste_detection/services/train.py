# src/train.py

from tensorflow.keras.preprocessing.image import ImageDataGenerator
from model import build_model
from config import *

def train():

    train_gen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2
    )

    train_data = train_gen.flow_from_directory(
        DATA_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training'
    )

    val_data = train_gen.flow_from_directory(
        DATA_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation'
    )

    model = build_model(num_classes=len(train_data.class_indices))

    model.fit(
        train_data,
        validation_data=val_data,
        epochs=EPOCHS
    )

    model.save(MODEL_PATH)
    print("✅ Model saved at:", MODEL_PATH)


if __name__ == "__main__":
    train()