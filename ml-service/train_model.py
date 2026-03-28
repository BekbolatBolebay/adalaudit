import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier

# Hand-crafted features for forensic analysis:
# [unicode_flags, price_delta_ratio, keyword_density, branding_violation]
X = np.array([
    [10, 0.45, 5, 1], # High Risk (Danger Scenario)
    [0, 0.05, 1, 0],  # Low Risk (Clean Scenario)
    [5, 0.20, 2, 0],  # Medium Risk
    [8, 0.50, 4, 1],  # High Risk
    [2, 0.10, 1, 0],  # Low Risk
])

y = np.array([1, 0, 0.5, 1, 0]) # 1: Danger, 0: Clean, 0.5: Warning

# Training a simple model (Random Forest)
model = RandomForestClassifier(n_estimators=10)
model.fit(X, y > 0.5) # Binary for now, or we can use regression

# Save the hand-crafted model
joblib.dump(model, 'forensic_model.pkl')
print("[ML] Forensic model trained and saved as 'forensic_model.pkl'")
