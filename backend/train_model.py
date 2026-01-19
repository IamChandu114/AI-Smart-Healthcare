import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib

# ========== DIABETES ==========
diabetes = pd.read_csv(
    "https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.data.csv",
    header=None
)

diabetes.columns = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
    "Insulin", "BMI", "DPF", "Age", "Outcome"
]

X = diabetes.drop("Outcome", axis=1)
y = diabetes["Outcome"]

model_diabetes = RandomForestClassifier()
model_diabetes.fit(X, y)
joblib.dump(model_diabetes, "diabetes_model.pkl")

# ========== HEART (SIMULATED DATA STRUCTURE) ==========
heart = diabetes.copy()
heart["Outcome"] = (heart["Glucose"] > 140).astype(int)

Xh = heart.drop("Outcome", axis=1)
yh = heart["Outcome"]

model_heart = RandomForestClassifier()
model_heart.fit(Xh, yh)
joblib.dump(model_heart, "heart_model.pkl")

# ========== KIDNEY (SIMULATED DATA STRUCTURE) ==========
kidney = diabetes.copy()
kidney["Outcome"] = ((kidney["BMI"] > 30) & (kidney["Age"] > 45)).astype(int)

Xk = kidney.drop("Outcome", axis=1)
yk = kidney["Outcome"]

model_kidney = RandomForestClassifier()
model_kidney.fit(Xk, yk)
joblib.dump(model_kidney, "kidney_model.pkl")

print("✅ All models trained successfully")
