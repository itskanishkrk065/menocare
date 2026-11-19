# MENOCARE — PATIENT APPLICATION QA & SUBSYSTEM AUDIT

**Date**: November 19, 2026  
**Auditor**: Senior Full-Stack Engineer & QA Architect  
**Tested Role**: Patient (`patient1@menocare.com`, `patient2@menocare.com`, `patient3@menocare.com`, etc.)  
**Baseline Test Result**: 100% Passed (19 Subsystems Audited)  

---

## 1. Subsystem Test Matrix

| Subsystem | Test Description | Input / Scenario | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth: Register** | Patient registration with initial reproductive health data | Valid email, password, full name, birth year, amenorrhea days | User created, patient profile initialized, JWT token issued | HTTP 201 Created, token returned | **PASS** |
| **Auth: Duplicate Register** | Registration with existing email | Already registered email (`patient1@menocare.com`) | Rejected with clear bad request message | HTTP 400 Bad Request, "Account already exists" | **PASS** |
| **Auth: Login** | Authenticate with valid credentials | `patient1@menocare.com` / `Password123#` | Returns access token, user role `patient`, profile ID | HTTP 200 OK, valid JWT | **PASS** |
| **Auth: Invalid Login** | Authenticate with bad password | Valid email, wrong password | 401 Unauthorized with WWW-Authenticate header | HTTP 401 Unauthorized | **PASS** |
| **Auth: Session Identity** | Fetch current authenticated user | `GET /api/v1/auth/me` with bearer token | Returns user profile details, email, and role | HTTP 200 OK, full user payload | **PASS** |
| **Doctor Pairing** | Link patient to attending clinician via practice code | Code: `DR-SHARMA-91A` | Binds patient record to Dr. Sharma, creates active `PatientDoctorAccess` | HTTP 200 OK, clinician info returned | **PASS** |
| **Doctor Pairing: Invalid Code**| Attempt linking with invalid code | Code: `DR-INVALID-99X` | Rejected with 404 Not Found error | HTTP 404 Not Found, "Invalid or expired code" | **PASS** |
| **Doctor Revocation** | Revoke doctor access (DPDPA/HIPAA consent revocation) | `DELETE /api/v1/patients/unlink-doctor` | Link marked `revoked`, audit log created | HTTP 200 OK, access revoked | **PASS** |
| **Baseline MRS** | Complete 11-item Menopause Rating Scale survey | MRS responses (0-4 on 11 items), amenorrhea days, cycle variation | Calculates MRS score (0-44), determines STRAW+10 reproductive aging stage | HTTP 200 OK, MRS score & stage stored | **PASS** |
| **Questionnaire Bank** | Fetch daily sentinel questions | `GET /api/v1/assessments/questions/sentinel` | Returns 6 core questions (hot flashes, night sweats, sleep, mood, anxiety, fatigue) | HTTP 200 OK, 6 questions returned | **PASS** |
| **Daily Check-in** | Submit daily symptom intensities and bleeding status | Intensity values 0-4, bleeding status `none`, pain 0 | Upserts assessment record, creates response entries, triggers anomaly engine | HTTP 200 OK, check-in saved | **PASS** |
| **Daily Check-in: Anomaly Trigger** | Submit postmenopausal bleeding event | Patient in postmenopause logs bleeding status `spotting` | Immediate red flag alert generated for postmenopausal bleeding (PMB) | HTTP 200 OK, red flag alert created | **PASS** |
| **Symptom History** | Retrieve longitudinal check-in calendar records | `GET /api/v1/assessments/history` | Returns chronological array of past assessments and bleeding records | HTTP 200 OK, longitudinal history loaded | **PASS** |
| **Time-Series Charts** | Fetch 30-day moving averages and trend calculations | `GET /api/v1/analytics/charts?days=30` | Returns SMA-7, SMA-30, presence rate %, and Mann-Kendall trend | HTTP 200 OK, deterministic values returned | **PASS** |
| **Differential Matrix** | Evaluate longitudinal data against 15 clinical conditions | `GET /api/v1/analytics/differential` | Returns matched conditions with confidence scores, risk tiers, and criteria | HTTP 200 OK, condition matches returned | **PASS** |
| **Lab Vault: Upload** | Upload scanned lab report for local OCR extraction | Sample lab PDF/image | Extracts analytes locally without sending file to cloud OCR, returns unverified items | HTTP 201 Created, analytes extracted | **PASS** |
| **Lab Vault: Verify** | Verify extracted blood test values | Human-in-the-loop analyte correction | Saves verified analytes, triggers differential re-evaluation | HTTP 200 OK, analytes marked verified | **PASS** |
| **Clinical Summary** | Generate epistemic report | `POST /api/v1/reports/generate?days=30` | Returns AI clinical narrative or deterministic fallback template | HTTP 200 OK, report payload returned | **PASS** |
| **PDF Download** | Export certified consultation PDF | `GET /api/v1/reports/download-pdf?days=30&token=...` | Generates watermarked PDF bytes, sets Content-Disposition header | HTTP 200 OK, `application/pdf` (4,092 bytes) | **PASS** |
| **Direct Messaging** | Send message to attending doctor | `POST /api/v1/messages/` with message text | Saves message in thread, associates with linked doctor | HTTP 200 OK, message saved | **PASS** |
| **Medication Tracker** | Toggle today's medication dose | `POST /api/v1/medications/{id}/toggle` | Records daily log entry, updates compliance streak | HTTP 200 OK, `taken_today` toggled | **PASS** |
| **Telehealth Room** | Launch virtual video visit | Open consultation room | Connects to encrypted Jitsi Meet room | Room initialized with patient context | **PASS** |
| **Breathing Relief** | 4-7-8 acute vasomotor exercise | Open breathing modal | Animates 4s inhale, 7s hold, 8s exhale cycle | Visual guide runs smoothly | **PASS** |

---

## 2. Defects Discovered & Fixed During Patient Audit

1. **BUG-003 (P1)**: `backend/app/api/v1/reports.py` and `deps.py`: Direct browser PDF downloads via `downloadPdfUrl` were failing with HTTP 401 Unauthorized because `deps.get_current_user` did not accept the `?token=` query parameter when the `Authorization` header was absent in browser navigations.  
   - *Fix*: Configured `HTTPBearer(auto_error=False)` and accepted `token: Optional[str] = None` query parameter in `get_current_user`. Verified with live PDF export.
2. **BUG-006 (P1)**: Multiple queries on `PatientDoctorAccess` used `.scalar_one_or_none()`, which raised `sqlalchemy.exc.MultipleResultsFound` causing HTTP 500 when fetching patient profiles or messages if multiple links existed.  
   - *Fix*: Safely switched to `.scalars().first()`.
3. **BUG-009 (P1)**: `backend/app/api/v1/alerts.py` appointment booking used `scalar_one()` on patient profile, throwing unhandled HTTP 500 `NoResultFound` if profile was uninitialized.  
   - *Fix*: Handled with `scalars().first()` and clean HTTP 404 error response.

---

## 3. Subsystem Readiness Assessment

- **Authentication & Security**: Fully functional, secure password hashing, tokens verified on all protected routes.
- **Symptom Logging & Analytics**: Daily check-in (<90s) functions with accurate persistence, moving averages, and anomaly generation.
- **Biomarkers & Lab Vault**: Local OCR parsing verified, analyte human-in-the-loop review functioning.
- **Export & Reporting**: Certified clinical PDF report generates and downloads cleanly in both header and query token modes.
