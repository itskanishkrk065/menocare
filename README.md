# MenoCare: AI-Based Menopause Symptom Tracking, Local Lab Extraction & Clinical Decision Support System

A production-grade, scientifically grounded, and privacy-preserving platform that converts longitudinal patient-reported menopause symptoms, bleeding dynamics, and local blood test reports into structured clinical decision support.

---

## 🚀 Quick Deployment Guide (Render + Neon PostgreSQL)

### 1. Database Configuration (Neon PostgreSQL)
The database has been migrated from local SQLite to Neon Serverless PostgreSQL:
```
postgresql://neondb_owner:npg_hkEws3i9tTcM@ep-twilight-voice-a1kgbfeb-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```
All tables and seeded clinical cohorts (11 users, 919 assessments, 5,514 responses, 1,261 bleeding records, 6 lab reports, 7 anomaly alerts) are already migrated into Neon.

### 2. Push to GitHub
The local repository is committed and ready on branch `main`. Push it to your GitHub account:
```bash
# If using the menocare repository on your profile:
git remote add origin https://github.com/itskanishkrk065/menocare.git
git push -u origin main
```
*(If your repository has a different name, simply update the remote URL with `git remote set-url origin https://github.com/itskanishkrk065/<repo-name>.git` and push).*

### 3. Deploy to Render
You can deploy in **1 click** using Render Blueprint, or configure a Web Service:

#### Option A: One-Click Render Blueprint (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/) $\rightarrow$ **Blueprints** $\rightarrow$ **New Blueprint Instance**.
2. Connect your GitHub repository (`itskanishkrk065/menocare`).
3. Render reads `render.yaml` automatically and configures:
   - **Runtime**: Python 3.11
   - **Build Command**: `./render-build.sh` (installs backend dependencies and builds frontend bundle)
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
   - **Database**: Automatically points to your Neon PostgreSQL database.
4. Click **Apply**!

#### Option B: Manual Web Service on Render
If you created a Web Service manually:
- **Build Command**: `./render-build.sh`
- **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  - `DATABASE_URL`: `postgresql://neondb_owner:npg_hkEws3i9tTcM@ep-twilight-voice-a1kgbfeb-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
  - `PYTHONPATH`: `.`
  - `SECRET_KEY`: `menopause-super-secret-production-key-2026-secure`

---

## Key Features

1. **Hierarchical Symptom Measurement**:
   - Baseline Clinical Anchor: **Menopause Rating Scale (MRS)** (11 items across Somato-vegetative, Psychological, and Urogenital subscales) + **STRAW+10** reproductive staging.
   - High-Adherence Daily Micro-Check-in: 6 core sentinel symptoms (Hot Flashes, Night Sweats, Sleep Fragmentation, Mood Swings, Anxiety, Fatigue) completed in under 90 seconds.
   - Comprehensive Bleeding Tracker: FIGO PALM-COEIN classification tracking duration, flow, clot presence, and basal body temperature.

2. **100% Local OCR & Medical Lab Extraction**:
   - Ingests scanned blood test reports (PDF, PNG, JPG).
   - Extracts key biomarkers locally using `pdfplumber` and `PyTesseract` with zero external API calls:
     - **Hormones**: FSH, LH, Estradiol (E2), Progesterone, AMH, Testosterone.
     - **Thyroid**: TSH, Free T3, Free T4.
     - **Metabolic / CBC**: Hemoglobin (Hb), Ferritin, Fasting Glucose, HbA1c, Lipid profile.
     - **Vitamins**: Vitamin D3, Vitamin B12, Calcium.
   - Interactive side-by-side human-in-the-loop verification table before committing to the database.

3. **Deterministic 15-Disease Clinical Differential & Anomaly Engine**:
   - Continuously evaluates symptom duration, bleeding patterns, and confirmed lab markers against a clinical knowledge matrix.
   - Screens for:
     1. **PCOD / PCOS** (Prolonged bleeding $\ge 7$d, elevated basal temp, LH:FSH $> 2:1$)
     2. **Thyroid Disorders** (TSH out-of-range, persistent fatigue $\ge 7$d)
     3. **Endometrial Hyperplasia / Red Flag** (Postmenopausal bleeding, late-transition menorrhagia)
     4. **Uterine Fibroids (Leiomyomas)** (Menorrhagia $> 7$d, clots, secondary anemia)
     5. **Functional Ovarian Cysts** (Unilateral pelvic pain, irregular spotting, bloating)
     6. **Iron Deficiency Anemia** (Low Hemoglobin/Ferritin, severe fatigue)
     7. **Premature Ovarian Insufficiency (POI)** (Age $< 40$, amenorrhea $\ge 4$ months, elevated FSH)
     8. **Osteopenia / Osteoporosis** (DEXA T-score $\le -1.0$, low Vitamin D3/Calcium)
     9. **Genitourinary Syndrome of Menopause (GSM)** (Vaginal dryness, dyspareunia, recurrent UTIs)
     10. **Cardiovascular / Dyslipidemia** (Elevated LDL, palpitations, hypertension)
     11. **Metabolic Syndrome / T2D** (Visceral weight gain, fasting glucose $\ge 100$, HbA1c $\ge 5.7\%$)
     12. **Adenomyosis** (Severe progressive dysmenorrhea, heavy bleeding, deep pelvic pain)
     13. **Endometriosis / Endometrioma** (Cyclical pelvic pain, dyschezia, ovarian cyst)
     14. **Perimenopausal Depression** (PHQ-9 $\ge 10$, affective blunting, sleep fragmentation)
     15. **Obstructive Sleep Apnea (OSA)** (Morning headaches, unrefreshing sleep, loud snoring)
   - Triggers bidirectional alerts to both patient and doctor recommending a consultation appointment when confidence $\ge 60\%$.

4. **Doctor Practice Code Pairing**:
   - Doctors generate a unique practice code (e.g., `DR-SHARMA-91A`).
   - Patients link directly in their portal, synchronizing charts and triggering real-time anomaly alerts in the doctor's inbox.

5. **API-Constrained Epistemic AI Summarization**:
   - External LLM API (Google Gemini 1.5) is invoked strictly for the final clinical narrative.
   - Zero-PII transmission (payload stripped of all direct identifiers).
   - Automated deterministic anti-hallucination guard rejects contradictory output and falls back to a deterministic clinical template.
   - Watermarked certified PDF export.

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Tesseract OCR (installed via Homebrew on macOS: `brew install tesseract`, or packaged via Docker)

### Backend Setup
```bash
# Activate virtual environment
source .venv/bin/activate

# Run automated tests
pytest backend/tests/ -v

# Start FastAPI backend server
uvicorn backend.app.main:app --reload --port 8000
```
Interactive API documentation will be available at: `http://localhost:8000/docs`

### Frontend Setup
```bash
cd frontend

# Install dependencies (already completed)
npm install

# Start Vite React development server
npm run dev
```
The patient and clinician portal will be available at: `http://localhost:5173`

---

## System Architecture

```
Menopause/
├── backend/
│   ├── app/
│   │   ├── clinical/instruments.py   # MRS-11, STRAW+10, 15-disease differential matrix
│   │   ├── core/                     # Database, Security, Config
│   │   ├── models/                   # SQLAlchemy 2.0 Async Models
│   │   ├── schemas/                  # Pydantic v2 validation contracts
│   │   ├── api/v1/                   # REST API routes (auth, patients, doctors, labs, etc.)
│   │   ├── analytics/                # Deterministic time-series math & anomaly engine
│   │   └── services/                 # Local OCR, AI summarizer, ReportLab PDF generator
│   └── tests/                        # 100% passing automated test suite
├── frontend/
│   ├── src/
│   │   ├── api/client.ts             # Typed API client
│   │   ├── components/               # Patient & Doctor UI components
│   │   ├── pages/                    # PatientDashboard, DoctorDashboard, LoginPage
│   │   └── App.tsx                   # Role-based routing & auth
│   └── package.json
└── docker-compose.yml
```

---

## Verification & Test Results
```
backend/tests/test_analytics.py::test_adherence_rate_calculation PASSED
backend/tests/test_analytics.py::test_moving_averages_calculation PASSED
backend/tests/test_analytics.py::test_mann_kendall_trend_detection PASSED
backend/tests/test_analytics.py::test_symptom_metrics_and_iqr PASSED
backend/tests/test_api.py::test_complete_patient_doctor_workflow PASSED
backend/tests/test_differential.py::test_pcod_screening_pattern_detection PASSED
backend/tests/test_differential.py::test_hypothyroidism_pattern_detection PASSED
backend/tests/test_differential.py::test_postmenopausal_bleeding_red_flag_alert PASSED
backend/tests/test_differential.py::test_fibroids_menorrhagia_pattern PASSED
backend/tests/test_local_ocr.py::test_parse_lab_analytes_from_simulated_text PASSED

10 passed in 1.10s 
```
