# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

1. **Perimenopausal & Menopausal Individuals (Patients):** Ordinary women navigating menopause transitions, tracking fluctuating symptoms (hot flashes, night sweats, sleep disruption, mood changes, joint aches), logging daily medications, and preparing organized summaries for doctor visits without medical jargon or anxiety-inducing metrics.
2. **Healthcare Providers (Doctors & Clinicians):** Gynecologists, endocrinologists, primary care physicians, and women's health nurse practitioners reviewing longitudinal patient cohorts, conducting triage, analyzing symptom trajectories, assessing hormone replacement therapy (HRT) suitability against NAMS/BMS guidelines, and documenting care plans (SOAP).

## Product Purpose

MenoCare provides a calm, clinically rigorous, and compassionate platform that bridges the communication gap between menopausal patients and their healthcare providers. It turns confusing bodily changes into clear, supportive daily check-ins for patients, while equipping clinicians with longitudinal trends, differential screening, and guideline-backed decision support.

## Positioning

Unlike generic symptom trackers that rely on overwhelming telemetry and opaque AI metrics, MenoCare pairs a genuinely patient-centered, calm interface with an evidence-based clinical workspace (NAMS/BMS protocols, validated MRS scoring, differential symptom analysis) in a unified, synchronized platform.

## Operating Context

- **Patient use:** Quick daily check-ins (1–2 minutes) on mobile, tablet, or laptop; period and cycle logging; calming breathing exercises during acute hot flashes; preparing for clinical appointments with printable/exportable summaries.
- **Clinician use:** Desktop split-screen clinical workspace during 15-minute consultations; rapid patient triage and anomaly inbox; reviewing lab results and differential patterns; issuing medication regimens and SOAP notes.

## Capabilities and Constraints

- **Validated Clinical Scales:** Menopause Rating Scale (MRS 11-item validated instrument), Greene Climacteric Scale, visual analog scoring.
- **Differential Screening:** Evaluates 15 conditions with overlapping symptoms (e.g., thyroid disease, iron deficiency, PCOS, fibroids, depression) based on logged symptoms and lab records without diagnosing.
- **Guideline Integration:** North American Menopause Society (NAMS) & British Menopause Society (BMS) HRT eligibility criteria and contraindication safeguards.
- **Dual Role Architecture:** Authenticated patient and doctor portals sharing a single secure PostgreSQL backend and REST API.
- **Plain Language Requirement:** Patient view strictly avoids clinical jargon (e.g. "somatovegetative", "vasomotor", "urogenital", "comorbidity screening matrix") in favor of natural, comforting English.

## Brand Commitments

- **Tone & Voice:** Calm, warm, dignified, compassionate, clear, scientifically grounded.
- **Visual Identity:** Warm health palette (Ivory `#F5F1E9`, Cream `#FAF8F3`, Oat `#E9E2D5`, Sage `#5B6F54` / `#8E9F86`, Deep Charcoal `#2E2924`).
- **Restraint:** No AI-generated clutter, no purple neon gradients, no kickers/eyebrows, no nested card containers, and no alarmist language.

## Evidence on Hand

- Validated MRS 11-item questionnaire structure and scoring logic (`0-44` scale).
- Full FastAPI backend with 47 tested endpoints covering auth, patients, check-ins, labs, medications, consultations, and analytics.
- Real seeded clinical demo cohort (Sarah Jenkins, Elena Rostova, Marcus Vance).

## Product Principles

1. **Reassurance over Alarm:** Menopause is a natural transition, not an illness. Provide clarity, never anxiety.
2. **Clarity over Cleverness:** Speak the patient's language. If a term requires medical schooling, translate it immediately.
3. **Respect Clinician Time:** Provide high-density, guideline-accurate clinical data in the doctor view with zero unnecessary clicks.
4. **Restraint over Decoration:** Every visual container, line, and metric must earn its place.
5. **No AI Gimmickry:** Do not present statistical algorithms as infallible diagnoses; present observed patterns as doctor-patient discussion points.

## Accessibility & Inclusion

- WCAG 2.1 AA compliant text contrast ($\ge 4.5:1$ for body and functional controls).
- Minimum functional text size of 11px (14px+ for body text).
- Keyboard operable forms and clear focus indicators.
- Non-reliant on color alone to convey clinical status.
