# PROFILE IMPLEMENTATION MAP
## Google Stitch Visual Reference → MenoCare Codebase

This document maps every visual and functional element of the **Google Stitch Individual Patient Clinical Profile & Telemetry Overhaul** (`projects/15211925739065827644/screens/1665c701dab0490cb3e4b4e0aa2cbf5c`) to the existing MenoCare architecture, components, backend APIs, and clinical logic.

---

### Operating Principle
- **Visual Source of Truth**: Google Stitch MCP Design (`1665c701dab0490cb3e4b4e0aa2cbf5c`, `8642a4c12bd74a6887c98d2edf7eb6b2`, `d4eadfc256064e038550924fcbacc763`).
- **Functional Source of Truth**: MenoCare production codebase (`PatientProfileView.tsx`, FastAPI backend endpoints, SQLite ORM database, real clinical state machines).

---

### Component & Screen Mapping

| Stitch Visual Element | Stitch Screen Spec | Existing Codebase Component | Data Dependency | API Endpoint / Source | Interactive Behavior |
|---|---|---|---|---|---|
| **Top Action Bar** | `data-purpose="patient-top-actions"` | `PatientProfileView.tsx` (Header) | Active patient MRN, name | `api.listAuthorizedPatients()` | Back navigation, Launch Telehealth, AI Summary, Certified PDF |
| **Patient Identity & Summary Hero** | `data-purpose="patient-summary-hero"` | `PatientProfileView.tsx` (Hero Banner) | Name, MRN, Age, STRAW+10, Baseline, Adherence, Flare Index | `api.listAuthorizedPatients()`, `api.getCharts()`, `api.getDifferential()` | Real-time telemetry indicators, STRAW staging pills, adherence badges |
| **Clinical Attention / Alert Panel** | `data-purpose="clinical-attention-panel"` | `PatientProfileView.tsx` (Alert Box) | Critical alerts, VMS spikes, bleeding anomalies | `api.listAlerts()`, `patient.alerts` | Acknowledge alert, order workup, dismiss, correlate telemetry |
| **Clinical Module Navigation** | `data-purpose="clinical-module-tabs"` | `PatientProfileView.tsx` (Tabs Bar) | Tab IDs, item counts | Local state `activeProfileTab` | Dynamic tab switching across all 7 clinical subsystems |
| **Timeline Feed & Filter Toolbar** | `data-purpose="filter-and-post-bar"` | `PatientProfileView.tsx` (Timeline Feed) | Feed events, filter counts | `api.getPatientTimeline(patientId)` | Filter by checkin, bleeding, alerts, doctor notes; Post Note trigger |
| **Daily Check-In Event Cards** | `timeline-populated-feed` (Card 1) | `PatientProfileView.tsx` (Checkin Renderer) | Sentinel symptoms (0-4), patient voice note | `Assessment`, `Response` models | Expand note, review symptom intensity breakdown |
| **Bleeding & Flow Cards** | `timeline-populated-feed` (Card 2) | `PatientProfileView.tsx` (Bleeding Renderer) | Flow character, duration, clots, pelvic pain, basal temp | `BleedingRecord` model | Review menstrual log, display benign vs red-flag tags |
| **Laboratory Milestones** | `timeline-populated-feed` (Card 3) | `PatientProfileView.tsx` (Lab Event) | Verified analytes, flags | `LabReport`, `LabAnalyte` models | View lab analyte panel, open PDF, trend lab values |
| **Biometrics & Longitudinal Trends** | Tab 2 Screen | `SymptomTrendsChart.tsx` | Daily scores, rolling averages, radar distribution | `api.getCharts(days, patientId)` | 30d/90d window toggle, domain breakdown, tooltips |
| **Health Patterns / Diagnostic Matrix** | Tab 3 Screen | `PatientProfileView.tsx` (Tab 3) | Thyroid, PCOS, Fibroid confidence scores, criteria | `api.getDifferential(patientId)` | Risk tier pills, diagnostic criteria list, workup guidance |
| **Blood Tests & Laboratory Vault** | Tab 4 Screen | `PatientProfileView.tsx` (Tab 4) | Extracted analyte values, reference ranges | `api.getDifferential()`, `api.listLabReports()` | Analytes grid, reference ranges, upload verification |
| **Hormone Therapy Guide (HRT Advisor)** | Tab 5 Screen | `HrtProtocolAdvisor.tsx` | Contraindications, symptom drivers, protocol | `api.evaluateHrtAdvisor(patient)` | Interactive protocol evaluation, risk stratification |
| **Doctor's Notes (SOAP Plan)** | Tab 6 Screen | `PatientProfileView.tsx` (Tab 6) | Subjective, Objective, Assessment, Plan | `api.listPatientNotes()`, `api.createPatientNote()` | Draft new SOAP note, commit to EHR, history timeline |
| **Patient Chat** | Tab 7 Screen | `DoctorChatHub.tsx` | Message stream, read receipts, sender ID | `api.getMessages()`, `api.sendMessage()` | Direct messaging, consultation followup |
| **Telehealth Room Integration** | Top Action Trigger | `TelehealthConsultationRoom.tsx` | Patient data, meeting room link | `api.createDoctorAppointment()` | In-call video interface with telemetry sidebar |

---

### Layout & Spacing System
- **Surfaces**: Primary canvas `bg-[#F8F5F0]` (warm ivory), Card containers `bg-white` / `bg-[#FAF8F5]` with borders `border-[#E2DBD0]` and soft shadows `shadow-sm`.
- **Typography**: Editorial serif headings (`Newsreader`) with clean modern body sans (`Plus Jakarta Sans` / `Figtree`).
- **Brand Accents**: MenoCare Sage (`#3E5A44` / `#4A5D4E`), Sea-Salt Teal (`#35535E`), Terracotta (`#C86D51`), Sand (`#8C6D23`), Rose (`#BA1A1A`).
