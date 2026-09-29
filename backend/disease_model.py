import io
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

disease_model = None
disease_classes = []

pest_model = None
pest_classes = []

# Using basic transforms suitable for efficientnet
_val_transforms = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def load_ai_models():
    global disease_model, disease_classes, pest_model, pest_classes
    import os
    base_dir = os.path.dirname(os.path.abspath(__file__))
    try:
        # Load Crop Disease Model
        disease_path = os.path.join(base_dir, "models", "crop_disease_model.pth")
        checkpoint = torch.load(disease_path, map_location=DEVICE, weights_only=False)
        disease_classes = checkpoint["class_names"]
        num_classes = checkpoint["num_classes"]

        # Architecture: EfficientNet-B0 + custom 2-layer head (1280->512->num_classes)
        base = models.efficientnet_b0(weights=None)
        in_f = base.classifier[1].in_features  # 1280
        base.classifier = nn.Sequential(
            nn.Dropout(p=0.2, inplace=True),
            nn.Linear(in_f, 512),
            nn.ReLU(),
            nn.Dropout(p=0.2),
            nn.Linear(512, num_classes),
        )
        base.load_state_dict(checkpoint["model_state"])
        base.to(DEVICE)
        base.eval()
        disease_model = base
        safe_sample = [c.encode('ascii', errors='replace').decode() for c in disease_classes[:3]]
        print(f"Loaded Crop Disease Model: {num_classes} classes. Sample: {safe_sample}")
    except Exception as e:
        print(f"Error loading disease model: {e}")

    try:
        # Load Pest Model
        pest_path = os.path.join(base_dir, "models", "pest_model.pth")
        checkpoint = torch.load(pest_path, map_location=DEVICE, weights_only=False)
        pest_classes = checkpoint["class_names"]
        num_classes = checkpoint["num_classes"]

        # Architecture: EfficientNet-B0 + custom 2-layer head (1280->256->num_classes)
        base = models.efficientnet_b0(weights=None)
        in_f = base.classifier[1].in_features  # 1280
        base.classifier = nn.Sequential(
            nn.Dropout(p=0.2, inplace=True),
            nn.Linear(in_f, 256),
            nn.ReLU(),
            nn.Dropout(p=0.2),
            nn.Linear(256, num_classes),
        )
        base.load_state_dict(checkpoint["model_state"])
        base.to(DEVICE)
        base.eval()
        pest_model = base
        safe_sample = [c.encode('ascii', errors='replace').decode() for c in pest_classes[:3]]
        print(f"Loaded Pest Model: {num_classes} classes. Sample: {safe_sample}")
    except Exception as e:
        print(f"Error loading pest model: {e}")

def predict_disease(image_bytes: bytes):
    if not disease_model:
        raise ValueError("Disease model not loaded")
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = _val_transforms(image).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        logits = disease_model(tensor)[0]
        probs = torch.softmax(logits, dim=0).cpu().numpy()
        pred_idx = probs.argmax()
        confidence = float(probs[pred_idx])
        pred_class = disease_classes[pred_idx]
    return pred_class, confidence

def predict_pest(image_bytes: bytes):
    if not pest_model:
        raise ValueError("Pest model not loaded")
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = _val_transforms(image).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        logits = pest_model(tensor)[0]
        probs = torch.softmax(logits, dim=0).cpu().numpy()
        pred_idx = probs.argmax()
        confidence = float(probs[pred_idx])
        pred_class = pest_classes[pred_idx]
    return pred_class, confidence
