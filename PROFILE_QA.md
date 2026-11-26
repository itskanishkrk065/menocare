# PROFILE QA PLAN & TEST MATRIX
## Comprehensive Quality Assurance Protocol for Individual Patient Profile

### Test Matrix Scope

| Test Suite | Scenario / Workflow | Expected Outcome | Verification Method |
|---|---|---|---|
| **QA-01: Profile Loading** | Select patient from directory | Profile loads patient name, MRN, age, STRAW stage, and vitals without lag | Browser / E2E & Mock API |
| **QA-02: Patient Switching** | Switch between multiple patients (Elena, Maria, Sarah) | All data, vitals, timeline, charts, notes, and messages completely reload for the new patient; 0 cross-patient data leaks | Automated unit & browser inspection |
| **QA-03: Top Action Bar** | Click "Back to Directory", "Launch Telehealth", "AI Summary", "Certified PDF" | Back deselects patient; Telehealth opens video room; AI summary synthesizes; PDF opens in new tab | Click & state check |
| **QA-04: Clinical Module Tabs** | Click all 7 tabs sequentially | Active tab styling updates, corresponding clinical view renders with real data | State & render check |
| **QA-05: Health Timeline Feed** | Filter feed by All, Check-Ins, Bleeding, Alerts, Notes | Filter pills update count; feed list filters accurately; empty states appear gracefully | Filter clicks & item checks |
| **QA-06: Daily Check-In Cards** | Inspect symptom pills and patient micro-journal | Correct 0-4 intensity scale shown with color coding (red >=3, sand >=2, sage >=1) | Visual & DOM check |
| **QA-07: Bleeding Cards** | View menstrual flow update | Flow status, duration, clots (Yes/No), pelvic pain, and basal temp displayed accurately | DOM & Data check |
| **QA-08: Longitudinal Charts** | Toggle 30-day / 90-day window | Charts re-fetch with new date range; tooltips display metrics cleanly | Recharts interaction check |
| **QA-09: Diagnostic Matrix** | Inspect overlapping condition cards | Condition cards display confidence score, matching criteria met, and recommended workup | Differential data check |
| **QA-10: Blood Tests & Labs** | Inspect verified analytes and upload status | Extracted analytes (TSH, Estradiol, etc.) render in clean grid with reference values | Lab analytes check |
| **QA-11: SOAP Note Composer** | Draft note with Subjective, Objective, Assessment, Plan and commit | Note persists to backend; timeline updates immediately; form resets | End-to-end API roundtrip |
| **QA-12: Direct Messages** | Send message to patient from profile | Message displays in stream with timestamp and sent status | ChatHub roundtrip |
| **QA-13: Responsive Breakpoints** | Inspect on desktop (1440px), laptop (1024px), tablet (768px), mobile (375px) | Layout gracefully reflows; no horizontal overflow; touch targets >= 44px | CSS inspection & mobile viewport |
| **QA-14: Contrast & Impeccable** | Run Impeccable scanner | All text passes WCAG AA contrast (>= 4.5:1); no unflattened card noise | Impeccable script |
