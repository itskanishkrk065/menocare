# PROFILE BUG TRACKER
## Controlled Batch-of-Three Defect Tracker

### Tracking Standard
- Defects are triaged by severity:
  - **P0**: Patient data leaks, cross-patient contamination, security vulnerabilities.
  - **P1**: Broken clinical workflows, data loss, failing API contracts.
  - **P2**: Broken navigation, chart rendering errors, missing subsystem data.
  - **P3**: Visual blemishes, alignment, spacing, contrast defects.

---

### Batch 1: Patient Data Isolation & Telemetry Feed Completeness
| Bug ID | Priority | Description | Affected Component / API | Root Cause | Fix Status |
|---|---|---|---|---|---|
| **BUG-001** | P1 | Lab reports missing from Patient Timeline feed | `doctors.py` (`get_patient_timeline_feed`) | `LabReport` query was omitted from timeline event aggregation | **RESOLVED & VERIFIED** |
| **BUG-002** | P2 | Doctor unable to list patient lab reports directly via `/labs/reports` | `backend/app/api/v1/labs.py` | Route required patient auth dependency instead of allowing authorized clinician access | **RESOLVED & VERIFIED** |
| **BUG-003** | P3 | Breadcrumb navigation styling in `PatientProfileView.tsx` lacks Stitch styling and MRN indicator | `PatientProfileView.tsx` | Top action bar used basic plain arrow link instead of Stitch's circular icon breadcrumb | **RESOLVED & VERIFIED** |

---

### Batch 2: Stitch Visual Fidelity & Layout Overhaul
| Bug ID | Priority | Description | Affected Component / API | Root Cause | Fix Status |
|---|---|---|---|---|---|
| **BUG-004** | P2 | Hero profile banner missing Stitch 4-metric vitals telemetry grid (VMS Flare Index, Sleep Arousal, etc.) | `PatientProfileView.tsx` (Hero Banner) | Banner was using basic 4-number divide strip instead of Stitch's padded telemetry blocks | **RESOLVED & VERIFIED** |
| **BUG-005** | P2 | Clinical Attention / Telemetry Alert panel was not interactive (missing action buttons) | `PatientProfileView.tsx` (Alert section) | Action triggers (Acknowledge, Order Ultrasound, Correlate Telemetry) were not rendered | **RESOLVED & VERIFIED** |
| **BUG-006** | P3 | Sub-navigation tabs were missing Stitch iconography and individual pill badges | `PatientProfileView.tsx` (Tabs Bar) | Tabs used standard plain text with basic numbers rather than Stitch icon-pills | **RESOLVED & VERIFIED** |

---

### Batch 3: Patient Switching, State Cleanup & Mobile Responsiveness
| Bug ID | Priority | Description | Affected Component / API | Root Cause | Fix Status |
|---|---|---|---|---|---|
| **BUG-007** | P0 | Stale patient notes and AI report retained when switching between patients | `PatientProfileView.tsx` (`useEffect`) | `setAiReport(null)` and `setIsAddingNote(false)` not called when `patientId` changes | **RESOLVED & VERIFIED** |
| **BUG-008** | P2 | Mobile view table overflow on vitals telemetry strip in hero banner | `PatientProfileView.tsx` | Fixed 4-column layout did not stack on small mobile viewports | **RESOLVED & VERIFIED** |
| **BUG-009** | P3 | Feed filter pills horizontal scroll lacked custom touch scrollbar on mobile | `PatientProfileView.tsx` | Filter bar lacked `overflow-x-auto custom-scrollbar` styling from Stitch | **RESOLVED & VERIFIED** |
