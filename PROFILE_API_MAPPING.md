# PROFILE API MAPPING
## Endpoint Specifications & Data Contracts for Patient Profile

### 1. Patient Profile & Cohort Detail
- **Route**: `GET /api/v1/doctors/patients`
- **Auth**: Doctor Bearer Token
- **Response**: Array of authorized patient objects:
  ```json
  [
    {
      "id": "p1-uuid",
      "full_name": "Elena Rostova",
      "age": 48,
      "straw_stage": "Late Perimenopause (-1)",
      "composite_mrs_score": 14,
      "has_high_priority_alerts": false,
      "alerts": [
        {
          "id": "alert-1",
          "condition_name": "Adenomyosis / Fibroid Pattern",
          "severity_level": "moderate",
          "confidence_score": 64
        }
      ],
      "surgical_history": {
        "amenorrhea_days": 68
      },
      "current_medications": ["Oral Micronized Progesterone 100mg QHS"]
    }
  ]
  ```

---

### 2. Social Health Timeline Feed
- **Route**: `GET /api/v1/doctors/patients/{patient_id}/timeline`
- **Auth**: Doctor Bearer Token
- **Response**: Chronologically sorted list of events:
  - `checkin`: Daily symptom log with intensity values (0-4), patient voice notes, completion timestamp.
  - `bleeding`: Menstrual flow updates (spotting, light, moderate, heavy), clots flag, pelvic pain (0-4), basal temperature.
  - `alert`: Telemetry alerts flagged by anomaly engines (condition name, severity, recommended workup).
  - `doctor_note`: Physician SOAP progress entries.
  - `lab`: Uploaded local blood tests and analyte values.

---

### 3. Longitudinal Trends & Biometrics
- **Route**: `GET /api/v1/analytics/charts?days={days}&patient_id={patient_id}`
- **Auth**: Doctor Bearer Token
- **Parameters**: `days=30` or `days=90`
- **Response**:
  - `daily_trends`: Array of daily data points with date, sleep quality, hot flash count, mood score, MRS score.
  - `domain_breakdown`: Somatovegetative, Psychological, Urogenital aggregate scores.
  - `adherence_rate_pct`: Integer percentage of days logged.
  - `total_recorded_days`: Number of entries logged in window.

---

### 4. Diagnostic Differential Matrix
- **Route**: `GET /api/v1/analytics/differential?patient_id={patient_id}`
- **Auth**: Doctor Bearer Token
- **Response**:
  - `straw_stage`: Inferred reproductive stage (e.g. `late_perimenopause`).
  - `screenings`: List of overlapping conditions evaluated (Thyroid Hypofunction, PCOS, Endometriosis/Adenomyosis, Depressive Disorder).
  - Each screening contains `confidence_score`, `risk_tier`, `matching_criteria_met`, and `recommended_workup`.
  - `verified_labs_used`: Key-value map of lab analytes used in evaluation (e.g. `TSH: 2.1 mIU/L`, `Estradiol: 28 pg/mL`, `FSH: 44 IU/L`).

---

### 5. Doctor Clinical Notes (SOAP)
- **Routes**:
  - `GET /api/v1/doctors/patients/{patient_id}/notes`: List all SOAP notes written by doctors.
  - `POST /api/v1/doctors/patients/{patient_id}/notes`: Create a new SOAP note:
    ```json
    {
      "note_type": "soap",
      "subjective": "Patient reports nocturnal flashes...",
      "objective": "Vitals: BP 118/76, HR 72...",
      "assessment": "Late perimenopause...",
      "plan": "Titrate progesterone..."
    }
    ```

---

### 6. Hormone Therapy Evaluation
- **Route**: `POST /api/v1/doctors/hrt-advisor`
- **Auth**: Doctor Bearer Token
- **Body**: Patient context data (age, stage, symptoms, contraindications, hysterectomy).
- **Response**: Evidence-based recommendation, recommended regimen, route of delivery, monitoring schedule.

---

### 7. Certified Passport PDF & AI Synthesis
- **Routes**:
  - `POST /api/v1/reports/generate?days={days}&patient_id={patient_id}`: AI executive summary synthesis.
  - `GET /api/v1/reports/download-pdf?days={days}&patient_id={patient_id}&token={token}`: Downloadable certified medical passport.

---

### 8. Clinical Chat Messaging
- **Routes**:
  - `GET /api/v1/messages/?patient_id={patient_id}`: Message thread with patient.
  - `POST /api/v1/messages/`: Send message `{ "message_text": "...", "patient_id": "..." }`.
