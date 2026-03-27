# src/utils.py

import os

def check_dataset_structure(data_dir):
    print("Checking dataset structure...\n")
    classes = os.listdir(data_dir)
    
    for cls in classes:
        path = os.path.join(data_dir, cls)
        if os.path.isdir(path):
            print(f"{cls}: {len(os.listdir(path))} images")