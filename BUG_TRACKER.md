# MENOCARE — APPLICATION-WIDE BUG TRACKER & DEFECT LOG

**Audit Date**: November 19, 2026  
**Auditor**: Senior Full-Stack Engineer, QA Architect & Database Engineer  
**Fix Strategy**: Controlled Batches of Maximum Three with Full Regression Testing  
**Total Defects Identified**: 9  
**Total Defects Resolved**: 9  
**Current Outstanding Bugs**: 0  

---

## 1. Summary of Bug Batches

| Batch | Bug ID | Priority | Module | Subsystem / Component | Root Cause | Fix Description | Verification Status |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | **BUG-001** | **P1** | Doctor Workspace | Health Timeline Feed (`doctors.py`) | Accessed non-existent `r.patient_notes` on `Response` model and `a.created_at` on `Assessment` model, throwing `AttributeError` and HTTP 500 when viewing patient timeline. | Updated to `r.notes` and `a.completed_at` with safe attribute checks. | **FIXED & VERIFIED** (Returned 200 OK with 66 clinical events) |
| **1** | **BUG-002** | **P1** | Doctor Management| Practice Code Generator (`doctors.py`) | Used `random.choices` and `string.ascii_uppercase` without importing `random` and `string` modules, throwing `NameError` if an active code was absent. | Added `import random` and `import string` at top of `doctors.py`. | **FIXED & VERIFIED** (Returned 200 OK with code `DR-SHARMA-91A`) |
| **1** | **BUG-003** | **P1** | Clinical Reports | PDF Export & Direct Download (`deps.py` & `reports.py`) | `deps.get_current_user` strictly required HTTP Authorization header, rejecting direct browser downloads (`window.open(api.downloadPdfUrl)`) using `?token=` parameter with HTTP 401 Unauthorized. | Configured `HTTPBearer(auto_error=False)` and accepted `token: Optional[str] = None` query parameter. | **FIXED & VERIFIED** (Returned 200 OK with 4,092 bytes of application/pdf) |
| **2** | **BUG-004** | **P2** | Analytics | Diagnostic Differential Screenings (`analytics.py`) | Omitted `"date"` field in `daily_records_dict`, causing `unique_dates` to calculate as 0 and falsely suppressing Tier B comorbidity screenings due to temporal gating. | Added `"date": str(r.assessment_date)` to dictionary comprehension in `analytics.py`. | **FIXED & VERIFIED** (Returned 200 OK with accurate comorbidity pattern matches) |
| **2** | **BUG-005** | **P2** | Doctor Workspace | Direct Clinical Messaging (`DoctorChatHub.tsx`) | Unvalidated `patients[0].patient_id` access crashed the component with a TypeError when `patients` was empty or `patientDetails` was loading/null. | Added `validPatients = (patients || []).filter(Boolean)` with safe fallback IDs and null checks. | **FIXED & VERIFIED** (Frontend builds and renders with 0 console errors) |
| **2** | **BUG-006** | **P1** | Data Access | Doctor Access Lookups across multiple API routers | Used `.scalar_one_or_none()` on `PatientDoctorAccess` queries, raising unhandled HTTP 500 `MultipleResultsFound` when patients had multiple link entries. | Switched to `.scalars().first()` in `patients.py`, `assessments.py`, `labs.py`, `alerts.py`, and `messages.py`. | **FIXED & VERIFIED** (No crash when multiple links exist) |
| **3** | **BUG-007** | **P0** | Security & Privacy | Clinical Report Summaries & PDF Export (`reports.py`) | Missing server-side `PatientDoctorAccess` check in `generate_clinical_summary` and `download_clinical_pdf`, allowing doctors to access unlinked patients' medical records. | Enforced strict server-side `PatientDoctorAccess` verification, returning HTTP 403 Forbidden for unauthorized requests. | **FIXED & VERIFIED** (Unauthorized doctor rejected with HTTP 403) |
| **3** | **BUG-008** | **P0** | Security & Privacy | Medication Management & Adherence (`medications.py`) | Missing server-side `PatientDoctorAccess` check in `list_medications` and `get_adherence_stats` for clinician lookups, exposing patient medications to unauthorized doctors. | Added active doctor link verification returning HTTP 403 Forbidden when unauthorized. | **FIXED & VERIFIED** (Unauthorized doctor rejected with HTTP 403) |
| **3** | **BUG-009** | **P1** | Robustness | Appointment Booking & PDF Export (`alerts.py` & `reports.py`) | Unprotected `.scalar_one()` calls on `PatientProfile` lookups threw unhandled HTTP 500 `NoResultFound` instead of returning clean HTTP 404 responses. | Switched to `.scalars().first()` with explicit 404 Not Found exception handling. | **FIXED & VERIFIED** (Non-existent profiles return clean HTTP 404) |

---

## 2. Regression Test Results Summary

After each batch of fixes, the full test suite and automated integration verifiers were executed:
- **Pytest Suite (`backend/tests`)**: 13 passed, 0 failed (1.06s).
  - `test_analytics.py`: Adherence rate, moving averages, Mann-Kendall trend detection, symptom IQR metrics.
  - `test_api.py`: Complete patient-doctor pairing, check-in, and analytics workflow.
  - `test_cold_start.py`: Day 1 POI suppression under age 40, Day 1 red flag immediate trigger, verified labs amenorrhea trigger.
  - `test_differential.py`: PCOD screening, hypothyroidism mimic, postmenopausal bleeding red flag, uterine fibroids menorrhagia pattern.
  - `test_local_ocr.py`: Parsing lab analytes from simulated text.
- **Full API Subsystem Integration Audit**: 37 test cases executed, 37 passed, 0 failed.
- **Frontend Type & Bundle Verification (`npm run build`)**: 2,110 modules transformed, 0 TypeScript errors.
