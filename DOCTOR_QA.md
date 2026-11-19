# MENOCARE — DOCTOR APPLICATION QA & CLINICAL SUBSYSTEM AUDIT

**Date**: November 19, 2026  
**Auditor**: Senior Full-Stack Engineer, QA Architect & Clinical Subsystem Specialist  
**Tested Role**: Attending Physician / Clinician (`dr.sharma@apollo.com`, `doctor@menocare.com`)  
**Baseline Test Result**: 100% Passed (All 7 Clinical Sections + Command Center Audited)  

---

## 1. Clinical Subsystem Test Matrix

| Subsystem | Test Description | Input / Scenario | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth: Doctor Login** | Clinician authentication with credentials | `dr.sharma@apollo.com` / `Password123#` | Returns access token with role `doctor`, profile ID | HTTP 200 OK, doctor token returned | **PASS** |
| **Auth: Doctor Profile** | Retrieve clinician profile & clinic details | `GET /api/v1/doctors/profile` | Returns license, specialty, clinic name, phone, active code | HTTP 200 OK, full clinician payload | **PASS** |
| **Practice Code** | Generate or retrieve active practice pairing code | `GET /api/v1/doctors/practice-code` | Returns active practice code (e.g. `DR-SHARMA-91A`) | HTTP 200 OK, active code returned | **PASS** |
| **Command Center: Overview** | Fetch clinical KPI metrics & today's consults | `GET /api/v1/doctors/overview` | Returns total patients, unacknowledged alerts, today's appointments, STRAW stages | HTTP 200 OK, practice KPIs returned | **PASS** |
| **Command Center: Live Ticker** | Fetch clinic-wide rapid triage activity ticker | `GET /api/v1/doctors/feed` | Returns recent alerts and abnormal bleeding events across authorized patients | HTTP 200 OK, ticker feed populated | **PASS** |
| **Command Center: Appointments** | Schedule new consultation with patient | `POST /api/v1/doctors/appointments` with patient ID, date, reason | Creates appointment with auto-generated Jitsi video link | HTTP 200 OK, consult scheduled | **PASS** |
| **Command Center: Update Status** | Update consult status (confirmed/completed) | `PATCH /api/v1/doctors/appointments/{id}` with new status | Updates appointment record, adds clinician notes | HTTP 200 OK, appointment updated | **PASS** |
| **Patient Directory** | List all authorized linked patients with risk triage | `GET /api/v1/doctors/patients` | Returns linked patients with age, STRAW stage, red flags, and alerts | HTTP 200 OK, 7 cohort patients listed | **PASS** |
| **Split Dossier: Left Sidebar** | Patient directory search and stage filters | Search by name / filter by stage | Dynamically filters list without full page reload | Filters correctly, active card highlighted | **PASS** |
| **Split Dossier: Right Pane** | Dynamic clinical workspace loading | Click patient card in directory | Loads patient details, charts, differentials, timeline into right pane | Right pane updates to selected patient | **PASS** |

---

## 2. The Seven Core Clinical Sections in Patient Dossier

### Section 1: Health Timeline Feed
- **Subsystem**: Chronological longitudinal social-media-style health feed.
- **Endpoint**: `GET /api/v1/doctors/patients/{patient_id}/timeline`
- **Features Tested**:
  - Daily check-in cards with tracked symptom badges and patient notes.
  - Menstrual bleeding flow events (spotting, light, normal, heavy) with pain and clot flags.
  - Clinical anomaly alerts with severity color coding (urgent, warning, info).
  - Past physician SOAP consultation notes.
  - Chronological descending sort order by timestamp.
- **Audit Findings**:
  - *Bug Discovered & Fixed (BUG-001)*: In `doctors.py`, `r.patient_notes` was accessed instead of `r.notes`, throwing `AttributeError: 'Response' object has no attribute 'patient_notes'` and HTTP 500. Fixed and verified.
  - *Bug Discovered & Fixed (BUG-001b)*: In `doctors.py`, `a.created_at` was accessed on `Assessment` instead of `a.completed_at`, throwing `AttributeError: 'Assessment' object has no attribute 'created_at'`. Fixed and verified.
- **Status**: **PASS (66 historical events verified on live cohort)**

### Section 2: Biometrics & Charts
- **Subsystem**: Longitudinal symptom intensity trajectories and time-series analysis.
- **Endpoint**: `GET /api/v1/analytics/charts?days=30&patient_id={id}`
- **Features Tested**:
  - Time-series line chart with dual rolling averages (SMA-7 short-term, SMA-30 trend baseline).
  - 7-day, 30-day, and 90-day window filters.
  - Mann-Kendall trend detection (improving, worsening, stable) with p-value calculations.
  - Symptom presence rate percentage.
  - Adherence compliance calculation over the evaluation window.
- **Status**: **PASS (Deterministic calculations match database records without fabrication)**

### Section 3: Diagnostic Matrix
- **Subsystem**: Multi-system 15-condition differential screening matrix.
- **Endpoint**: `GET /api/v1/analytics/differential?patient_id={id}`
- **Features Tested**:
  - Comorbidity pattern matching (PCOS, POI, Hypothyroidism Mimic, Uterine Fibroids, PMB).
  - Risk tier badges (High, Moderate, Screen).
  - Confidence score percentages (0 to 100%).
  - Specific clinical criteria met breakdown.
  - Verified lab values utilized in decision logic.
- **Audit Findings**:
  - *Bug Discovered & Fixed (BUG-004)*: Missing `"date"` field in `daily_records_dict` caused `total_recorded_days=0` in `analytics.py`, suppressing Tier B comorbidity screenings due to temporal gating. Fixed and verified.
- **Status**: **PASS (Correctly highlights PCOS on Patient 2 and Hypothyroidism on Patient 3)**

### Section 4: Laboratory Vault
- **Subsystem**: Biochemical hormone panels and blood test analytes extracted locally.
- **Endpoint**: `GET /api/v1/analytics/differential?patient_id={id}` & `GET /api/v1/labs/reports`
- **Features Tested**:
  - Grid of verified analytes: FSH, Estradiol (E2), TSH, Free T4, Hemoglobin, Prolactin, etc.
  - Reference range comparison and abnormal flag indicators (High, Low, Normal).
  - Local OCR verification badge.
- **Status**: **PASS**

### Section 5: HRT Advisor & Protocol
- **Subsystem**: Evidence-based Clinical Decision Support (CDS) based on BMS and NAMS guidelines.
- **Endpoint**: `POST /api/v1/doctors/hrt-advisor`
- **Features Tested**:
  - Uterine status evaluation: Requires progestogen if uterus is present to prevent endometrial hyperplasia.
  - Systemic vs. transdermal estradiol selection based on VTE and migraine risk.
  - Absolute contraindications screening (active breast cancer, unexplained vaginal bleeding, active liver disease).
  - Dosage and monitoring guidelines.
- **Status**: **PASS (Verified contraindication safety checks and protocol suggestions)**

### Section 6: SOAP Care Plan
- **Subsystem**: Longitudinal clinical consultation note composer and historical record.
- **Endpoints**: `GET /api/v1/doctors/patients/{id}/notes`, `POST /api/v1/doctors/patients/{id}/notes`
- **Features Tested**:
  - Structured fields: Subjective, Objective, Assessment, Plan.
  - Form validation: Note saves and immediately prepends to historical notes feed.
  - Timestamped consultation entries with doctor ID association.
- **Status**: **PASS**

### Section 7: Direct Messages
- **Subsystem**: Secure clinical messaging thread between doctor and patient.
- **Endpoints**: `GET /api/v1/messages/?patient_id={id}`, `POST /api/v1/messages/`
- **Features Tested**:
  - Message history thread with read/unread indicators.
  - Real-time message composition and delivery.
  - Message sender role tagging (`doctor` vs `patient`).
- **Audit Findings**:
  - *Bug Discovered & Fixed (BUG-005)*: In `DoctorChatHub.tsx`, unvalidated `patients[0].patient_id` access crashed the component with a TypeError when `patientDetails` was loading or null. Added safe filtering and fallback IDs.
- **Status**: **PASS**

---

## 3. UI/UX & Layout Verification

1. **Independent Scrolling**: The left patient directory and the right clinical workspace scroll independently without causing page-level layout shifts or clipping.
2. **Horizontal Section Carousel**: Navigation between the 7 clinical tabs operates with clean horizontal transition, preserving the selected patient state.
3. **No Stale Information**: Switching between patients refreshes all 7 clinical sections immediately and clears previously loaded patient state.
