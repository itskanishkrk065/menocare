# MenoCare Design QA Checklist & Verification Matrix

## 1. Craft Floor Verification

| Rule | Requirement | Status | Verification Notes |
| :--- | :--- | :--- | :--- |
| **No Artificial Kickers** | Refuse uppercase letterspaced micro-labels over titles | Verified | Removed from Navbar, Login, PatientDashboard, PatientProfileView |
| **No Nested Cards** | Refuse cards inside cards | Verified | Containers flattened with subtle borders and clear padding |
| **WCAG AA Contrast** | Body & interactive text $\ge 4.5:1$, large text $\ge 3:1$ | Verified | Primary text #2E2924 (12.8:1), secondary #544E45 (6.2:1), buttons #4A5F43 (5.2:1) |
| **Pixel Floor** | Interactive UI text $\ge 11$px, body $\ge 14$px | Verified | All sub-11px labels upgraded across all components |
| **Natural Language** | Plain, humane language for patients; precise clinical terms for doctors | Verified | MRS, Daily Check-In, Dashboard, and Reports rewritten |
| **No AI Tell Gradients** | No purple-to-indigo or cyan glowing gradients | Verified | Breathing modal and cards use warm sage/teal palette |
| **Smooth Motion** | No bounce, elastic, or rubberband easing | Verified | Replaced `animate-bounce` and bounce cubics with smooth `ease-out` |
| **Typography Integrity** | Distinctive, intentional fonts (Newsreader + Figtree) | Verified | Replaced Plus Jakarta Sans with Figtree |

## 2. Cross-Screen QA Checklist

- [x] **Login Page:** Clean branding, accessible placeholders, 1-click test roles, high contrast button.
- [x] **Patient Dashboard:** Clear health status, today's check-in action, 4-7-8 breathing relief, quick actions.
- [x] **Daily Symptom Modal:** 6 core symptom scales with real-life descriptions and 0-4 ratings.
- [x] **MRS Assessment Modal:** 11 validated items with compassionate descriptions across 3 clear domains.
- [x] **Patient Symptom Analytics:** Clear trend lines, non-technical explanations, period flow calendar.
- [x] **Patient Lab Vault:** Friendly test upload, clear biomarker gauge readings.
- [x] **Patient Messaging & Telehealth:** Reassuring care team chat, clean video consultation.
- [x] **Doctor Triage Center:** Patient cards with priority status, urgent alerts, and clear search.
- [x] **Doctor Split Workspace:** Searchable directory on left, 7 clinical sections on right.
- [x] **Hormone Therapy Guide:** Evidence-based NAMS/BMS evaluation matrix with clear contraindications.
- [x] **Doctor's Notes (SOAP):** Scannable clinical documentation and AI-assisted summary with doctor review.

## 3. Technical & API Stability

- [x] All 47 FastAPI REST endpoints functional.
- [x] Neon PostgreSQL database models and relations intact.
- [x] TypeScript compilation: 0 errors (`npm run build`).
- [x] Frontend dev server running on port 5173 without runtime warnings.
