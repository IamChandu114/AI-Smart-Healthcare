from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import joblib
from fastapi.middleware.cors import CORSMiddleware

# -----------------------------
# Load Trained Models
# -----------------------------
diabetes_model = joblib.load("diabetes_model.pkl")
heart_model = joblib.load("heart_model.pkl")
kidney_model = joblib.load("kidney_model.pkl")

# -----------------------------
# FastAPI App
# -----------------------------
app = FastAPI(title="AI Smart Healthcare System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Input Schema
# -----------------------------
class PatientData(BaseModel):
    pregnancies: float
    glucose: float
    bloodPressure: float
    skinThickness: float
    insulin: float
    bmi: float
    dpf: float
    age: float

# -----------------------------
# Home Route
# -----------------------------
@app.get("/")
def home():
    return {"message": "Smart Healthcare API is running 🚀"}

# -----------------------------
# Explainable AI Logic
# -----------------------------
def explain_ai(data: PatientData):
    reasons = []

    if data.glucose > 140:
        reasons.append("High glucose level detected")
    if data.bmi > 30:
        reasons.append("High BMI (obesity risk)")
    if data.age > 45:
        reasons.append("Age is a significant risk factor")
    if data.bloodPressure > 90:
        reasons.append("Elevated blood pressure")
    if data.insulin > 150:
        reasons.append("Abnormal insulin level")

    if not reasons:
        reasons.append("All vital parameters are within normal range")

    return reasons

# -----------------------------
# Prediction API
# -----------------------------
@app.post("/predict")
def predict(data: PatientData):

    import pandas as pd

    features = pd.DataFrame([{
    "Pregnancies": data.pregnancies,
    "Glucose": data.glucose,
    "BloodPressure": data.bloodPressure,
    "SkinThickness": data.skinThickness,
    "Insulin": data.insulin,
    "BMI": data.bmi,
    "DPF": data.dpf,
    "Age": data.age
}])

    diabetes = int(diabetes_model.predict(features)[0])
    heart = int(heart_model.predict(features)[0])
    kidney = int(kidney_model.predict(features)[0])

    explanation = explain_ai(data)

    return {
        "diabetes": diabetes,
        "heart": heart,
        "kidney": kidney,
        "explanation": explanation
    }
