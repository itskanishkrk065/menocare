# MenoCare Design Changelog

## [Unreleased] - Comprehensive Impeccable Transformation

### Batch 1: Design Tokens, Typography, and Contrast Standards
- **Typography:** Replaced generic `Plus Jakarta Sans` with `Figtree` from Google Fonts for all sans-serif UI elements. Preserved `Newsreader` for editorial titles.
- **Contrast Ratios:** Elevated muted text from `#9B958B` ($3.0:1$) to `#544E45` ($6.2:1$), achieving full WCAG 2.1 AA compliance against cream (`#FAF8F3`) and ivory (`#F5F1E9`).
- **Primary Action Contrast:** Set button primary action background to `#4A5F43` / `#5B6F54` with white text ensuring $> 5.2:1$ contrast ratio.
- **Legibility Floor:** Enforced minimum 11px font size across all UI controls, badges, and labels. Standard body text set to 14px–16px.
- **Eliminated AI Tells:** Removed purple/indigo gradients, removed `animate-bounce`, and added `text-wrap: pretty`.

### Batch 2: Patient Dashboard & Symptom Assessment Overhaul
- **Interactive Check-In:** Complete plain English overhaul with intuitive 0–4 severity scale.
- **MRS Assessment Modal:** Translated all 11 questions from academic jargon into natural, supportive language.
- **Breathing Relief Tool:** Redesigned with organic sage/teal breathing circle, eliminating purple neon gradient.
- **Dashboard Cleanup:** Removed artificial kickers, unnested metric cards, and simplified quick action buttons.

### Batch 3: Patient Analytics, Calendar, Labs, and Relief Tools
- **Symptom Trends Chart:** Replaced dense clinical titles with clear, readable chart headers and contextual insights.
- **Period & Cycle Calendar:** Clean visual calendar with intuitive flow indicators.
- **Medications Card:** Streamlined one-click check-off for daily prescriptions.
- **Lab Results Upload:** Friendly file dropzone with clear status indicators.

### Batch 4: Doctor Command Center & Patient Directory
- **Triage Center:** Clean patient cards with clear priority badges (Urgent Review, Stable, Routine).
- **Directory Search:** Streamlined search and filtering with high-contrast text and responsive layout.

### Batch 5: Doctor Clinical Dossier & Sub-Tabs
- **Sub-Tab Navigation:** Streamlined tabs to Health Timeline, Biometrics, Health Patterns, Blood Tests & Labs, Hormone Therapy Guide, Doctor's Notes (SOAP), and Patient Chat.
- **Diagnostic Matrix:** Renamed to "Health Patterns & Overlapping Conditions", emphasizing differential screening without alarmist claims.
- **HRT Advisor:** Evidence-based NAMS/BMS contraindication evaluation presented in clean, scannable clinical tables.

### Batch 6: Telehealth & Clinical Communications
- **Consultation Hub:** Clean scheduling and video room with integrated clinical notepad.
- **Secure Messaging:** Direct provider-patient chat with clear message bubbles and timestamps.

### Batch 7: Quality Assurance & Audit
- **Impeccable Detect:** Ran automated detector against source code and running server.
- **Zero API Regressions:** Verified all 47 backend endpoints and database schemas.
