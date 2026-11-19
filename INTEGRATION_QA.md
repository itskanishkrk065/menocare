# MENOCARE — CROSS-ROLE INTEGRATION & WORKFLOW QA

**Date**: November 19, 2026  
**Auditor**: Senior Full-Stack Engineer & QA Architect  
**Scope**: End-to-end integration across Patient and Doctor applications, data synchronization, and security isolation.  

---

## 1. Cross-Role Workflows Verification Matrix

### Workflow 1: Patient Assessment Submission $\rightarrow$ Doctor View
1. **Action**: Patient completes Baseline MRS Assessment via `POST /api/v1/assessments/baseline-mrs` or Daily Check-in via `POST /api/v1/assessments/daily`.
2. **Backend**: Assessment and individual question responses are stored in database. STRAW+10 reproductive aging stage and MRS benchmark are calculated.
3. **Synchronization**: Attending doctor opens the patient dossier in the Doctor Directory.
4. **Verification**:
   - The new assessment immediately appears in Section 1 (Health Timeline Feed).
   - Biometric time-series charts (Section 2) reflect the latest intensity scores.
   - Diagnostic Matrix (Section 3) incorporates the latest responses into its comorbidity rule engine.
5. **Result**: **PASS**

---

### Workflow 2: Daily Symptom Tracking $\rightarrow$ Real-Time Clinical Triage
1. **Action**: Patient logs an abnormal symptom or menstrual flow (e.g., postmenopausal spotting).
2. **Backend**: Deterministic `AnomalyAlertEngine.check_for_anomalies` detects red flag pattern (e.g. `RED_PMB`: Postmenopausal Bleeding).
3. **Synchronization**:
   - Patient receives an immediate high-priority alert on their dashboard banner (`AnomalyBanner.tsx`) advising clinician contact.
   - Doctor's Command Center live ticker (`DailyCommandCenter.tsx`) receives the event via `GET /api/v1/doctors/feed`.
   - Doctor's Anomaly Inbox (`AnomalyInbox.tsx`) displays the urgent alert.
4. **Verification**: Both patient and clinician see identical condition code, severity level, and recommended clinical actions.
5. **Result**: **PASS**

---

### Workflow 3: Clinical Report Generation & PDF Download
1. **Action**: Doctor generates a 30-day clinical consultation report via `POST /api/v1/reports/generate?days=30&patient_id={id}`.
2. **Backend**: Compiles analytical payload (symptom trends, moving averages, differential screenings, verified lab markers) and calls `AISummarizationGateway` (with deterministic fallback). Report is saved to `ClinicalReport` table with audit log.
3. **PDF Export**:
   - Doctor downloads certified PDF report via `GET /api/v1/reports/download-pdf?days=30&patient_id={id}`.
   - Patient downloads their own PDF report via `GET /api/v1/reports/download-pdf?days=30&token={patient_token}`.
4. **Verification**:
   - Both modes return HTTP 200 OK with `Content-Type: application/pdf` and valid binary content.
   - Audit log `EXPORT_PDF_REPORT` is committed with actor ID and patient ID.
5. **Result**: **PASS**

---

### Workflow 4: Bidirectional Messaging Synchronization
1. **Action**: Patient sends a message: *"Dr. Sharma, hot flashes peaked today after morning coffee."* via `POST /api/v1/messages/`.
2. **Backend**: Message is persisted in `PatientDoctorMessage` table linked to both `patient_id` and `doctor_id`.
3. **Doctor Reply**: Doctor logs in, opens Section 7 (Direct Messages) in the patient's dossier, sees patient's message, and replies: *"Sarah, let's adjust evening hydration and review your estrogen patch."*
4. **Verification**:
   - Patient refreshes or opens `CareTeamChatModal.tsx` and sees doctor's reply with timestamp.
   - `is_read` status and message ordering are strictly chronological.
5. **Result**: **PASS**

---

### Workflow 5: Patient Linking & Revocation (DPDPA / HIPAA Compliance)
1. **Linking**: Patient inputs practice code `DR-SHARMA-91A` via `POST /api/v1/patients/link-doctor`.
2. **Access Control**: Active `PatientDoctorAccess` record is created. Doctor can now see patient in their authorized patient directory.
3. **Revocation**: Patient clicks "Revoke Doctor Access" via `DELETE /api/v1/patients/unlink-doctor`.
4. **Verification**:
   - Link status changes to `revoked`.
   - Doctor immediately loses access: attempting to query patient charts, timeline, differentials, or reports returns HTTP 403 Forbidden.
   - Audit trail `REVOKE_DOCTOR_ACCESS` is logged.
5. **Result**: **PASS**

---

### Workflow 6: Cross-Patient Data Isolation & Zero-Leakage Security
1. **Scenario**: Dr. Sharma is linked to Patient 1 (`patient1@menocare.com`). An unauthorized patient ID (`fake_patient_id` or an unlinked patient) is requested.
2. **Endpoints Tested**:
   - `GET /api/v1/analytics/charts?patient_id={unauthorized_id}`
   - `GET /api/v1/analytics/differential?patient_id={unauthorized_id}`
   - `GET /api/v1/doctors/patients/{unauthorized_id}/timeline`
   - `GET /api/v1/doctors/patients/{unauthorized_id}/notes`
   - `GET /api/v1/reports/download-pdf?patient_id={unauthorized_id}`
   - `GET /api/v1/medications/?patient_id={unauthorized_id}`
3. **Verification**:
   - All endpoints return HTTP 403 Forbidden with `"Not authorized to access this patient's records."`
   - Patient A cannot access Patient B's data under any circumstances.
   - No cached patient charts, notes, or timelines leak when switching patients in the doctor workspace.
4. **Result**: **PASS (Zero Data Leakage Verified)**
