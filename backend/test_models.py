from disease_model import load_ai_models
import disease_model as dm
load_ai_models()
print("Disease model loaded:", dm.disease_model is not None)
print("Disease classes count:", len(dm.disease_classes))
print("Disease sample:", dm.disease_classes[:3])
print("Pest model loaded:", dm.pest_model is not None)
print("Pest classes count:", len(dm.pest_classes))
print("Pest sample:", dm.pest_classes[:3])
