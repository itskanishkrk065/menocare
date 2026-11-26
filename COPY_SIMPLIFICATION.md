# MenoCare Copy Simplification & Dual-Audience Language Architecture

MenoCare serves two distinct audiences: **patients** and **doctors**. 
They must **never** see the same terminology everywhere.

- **Patient Experience:** Warm, reassuring, conversational, everyday plain English that any woman can understand without a medical dictionary.
- **Doctor Experience:** Rigorous, precise, evidence-based clinical terminology (STRAW+10 staging, MRS validated domains, NAMS/BMS protocols, differential matrix).

---

## 1. Principles of Patient-Friendly Healthcare Language

1. **One Underlying Model, Two Language Experiences:** The application uses identical database records, API responses, symptom identifiers, score calculations, and clinical models. Separate presentation labels are mapped centrally via `frontend/src/utils/terminology.ts`.
2. **Reassure, Never Alarm:** Menopause is a normal, natural life transition. Avoid phrasing that makes ordinary symptoms sound like acute medical emergencies.
3. **Plain English First:** Use the words real women use when speaking with trusted friends or doctors.
4. **Preserve Medical Accuracy:** Do not change clinical meaning, severity scales (0-4), frequency counts, question intent, scoring, validation, or doctor-facing interpretations.
5. **No AI Tells or Hospital Software Buzzwords:** Remove robotic uppercase kickers, epistemic qualifiers, and confidence percentages.

---

## 2. Centralized Terminology Mapping (`frontend/src/utils/terminology.ts`)

| Canonical Concept / Code | Patient-Facing Everyday Label | Doctor-Facing Clinical Label | Context / Meaning |
| :--- | :--- | :--- | :--- |
| **Vasomotor Symptoms** | Hot flashes and night sweats | Vasomotor Symptoms (VMS) | Cutaneous vasodilation and nocturnal sweating |
| **Genitourinary / Urogenital** | Vaginal and urinary symptoms / Bladder & Intimate Health | Urogenital Domain (GSM) | Vulvovaginal atrophy, dyspareunia, urinary frequency |
| **Somatovegetative Domain** | Physical Symptoms | Somatovegetative Domain | Flushes, palpitations, insomnia, and joint stiffness |
| **Psychological Domain** | Emotional Wellbeing | Psychological Affect Domain | Mood lability, anxiety, irritability, and asthenia |
| **Symptom Severity** | How strongly you experienced it | Symptom Severity (0-4 Likert) | Measure of acute symptom intensity |
| **Symptom Frequency** | How often it happened | Episode Frequency / Telemetry | Episode count over a daily/weekly window |
| **Symptom Progression** | How your symptoms have changed | Longitudinal Progression Trajectory | Trajectory of symptom intensity over time |
| **Menopausal Transition** | Changes happening during menopause | Menopausal Transition (STRAW+10) | Endocrine and ovarian reserve transition stages |
| **Sleep Disturbances** | Sleep problems | Insomnia & Sleep Architecture Deficit | Fragmented sleep, night awakenings, latency |
| **Mood Fluctuations** | Changes in your mood | Affective Reactivity & Mood Lability | Subclinical mood variations and emotional shifts |
| **Clinical Insights** | What your symptom patterns show | Algorithmic Clinical Insights | Detected patterns and predictive inferences |
| **Symptom Tracking** | Track how you feel | Symptom Telemetry Ingestion | User-submitted daily assessments |
| **Assessment Completion** | Check-in completed | Validated Assessment Completed | Finished MRS or Daily Sentinel check-in |
| **Longitudinal Trends** | Changes over time | Longitudinal Trajectory Analytics | Rolling 7-day, 30-day, and 90-day analytics |
| **Physiological Changes** | Changes in your body | Physiological & Biomarker Variations | Hormone levels, basal body temperature, cycles |
| **Comorbidity Matrix** | Health patterns & overlapping conditions | Deterministic Comorbidity Matrix | Differential conditions sharing symptoms |
| **HRT Advisor** | Hormone Therapy Guide | HRT Protocol Decision Support | NAMS/BMS evidence-based clinical rules |
| **SOAP Notes** | Doctor's consultation notes | SOAP Clinical Care Plan | Subjective, Objective, Assessment, Plan notes |

---

## 3. Patient Dashboard Information Architecture

A patient opening her dashboard immediately understands:
- *How am I feeling?*
- *What symptoms have I experienced?*
- *What has changed recently?*
- *How am I sleeping?*
- *What should I track today?*
- *What information can I share with my doctor?*

### Standard Patient Headings
- **Your health overview** (Main dashboard summary)
- **How you've been feeling** (Immediate 4-stat health snapshot)
- **Your symptoms** (Day-by-day logged symptom breakdown)
- **Changes over time** (30-day trends and rolling patterns)
- **Your daily check-in** (Quick 1-minute daily assessment)
- **Where you feel symptoms** (Interactive body region map)
- **What influences your symptoms** (Everyday trigger logging)
- **Your daily medications & vitamins** (Daily therapy reminders)
- **Your blood tests & labs** (Hormone panels and verified lab values)
- **Your upcoming appointments** (Scheduled telehealth visits with doctor)
- **Messages with your care team** (Direct communication with provider)
- **Your health report** (Exportable PDF summary for consultations)

### Natural Phrasing vs. Clinical Jargon
| Technical / Jargon Phrase | Natural Patient-Friendly Phrase |
| :--- | :--- |
| "Your vasomotor symptom frequency has increased over the previous assessment period." | "You've experienced hot flashes more often recently." |
| "Your symptom severity distribution indicates moderate fluctuations." | "Some of your symptoms have been stronger on certain days." |
| "Somatovegetative domain score indicates elevated autonomic arousal." | "You've felt more physical symptoms like hot flashes and heart flutters." |
| "Sleep architecture deficit documented." | "You've had trouble getting restful sleep." |
| "Epistemic narrative summary ready for provider sign-off." | "Your health summary is organized and ready for your doctor." |

---

## 4. Validated Questionnaire Accuracy (MRS & Daily Sentinel)

Underlying question codes, 0-4 scoring scales, and clinical validations are strictly maintained:

### MRS (Menopause Rating Scale) 11 Validated Items:
1. **`mrs_1` Hot flashes and sweating:** "Sudden waves of heat, sweating episodes, or sudden chills."
2. **`mrs_2` Heart fluttering or racing:** "Feeling your heart beating rapidly, pounding, fluttering, or skipping a beat unexpectedly."
3. **`mrs_3` Sleep problems:** "Trouble falling asleep, waking up frequently during the night, or waking up feeling unrefreshed."
4. **`mrs_11` Joint and muscle stiffness:** "Aching, stiffness, or discomfort in your joints (knees, fingers, shoulders) or muscle soreness."
5. **`mrs_4` Feeling down or sad:** "Feeling unusually low, sad, on the verge of tears, lacking motivation, or emotionally flat."
6. **`mrs_5` Irritability and tension:** "Feeling unusually short-tempered, impatient, nervous, hurried, or easily frustrated."
7. **`mrs_6` Anxiety and worry:** "Inner restlessness, feeling on edge, or experiencing sudden waves of worry or nervousness."
8. **`mrs_7` Fatigue and brain fog:** "Feeling mentally exhausted, forgetful, physically drained, or having unusually low stamina."
9. **`mrs_8` Changes in sexual comfort:** "Changes in sexual desire, natural lubrication, or comfort during intimacy."
10. **`mrs_9` Bladder urgency or changes:** "Needing to pee more urgently or often, waking at night to pee, or accidental bladder leaks."
11. **`mrs_10` Vaginal dryness or irritation:** "Feelings of vaginal dryness, stinging, burning, itching, or pain during intimacy."

---

## 5. Doctor-Facing Clinical Precision Retention

The doctor workspace maintains all required clinical terminology:
- **`DailyCommandCenter.tsx`:** Daily triage queue with clinical priority flags (Urgent Review, High Risk, In Review).
- **`PatientDirectoryView.tsx`:** Patient cohort directory with STRAW+10 staging, MRS composite scores, and phenotype tags.
- **`PatientProfileView.tsx`:** 7 structured clinical sub-tabs:
  1. *Health Timeline* (longitudinal encounter history)
  2. *Biometrics & Trends* (multi-symptom regression, SMA-7, SMA-30)
  3. *Diagnostic Matrix* (PCOS, thyroid mimic, POI differentials)
  4. *Laboratory Vault* (estradiol, FSH, TSH, ferritin, AMH)
  5. *HRT Protocol Advisor* (NAMS/BMS contraindication evaluation)
  6. *Doctor's Notes (SOAP)* (Subjective, Objective, Assessment, Plan)
  7. *Patient Chat* (encrypted provider messaging)
- **`HrtProtocolAdvisor.tsx`:** Clinical decision support evaluating uterine status, cardiovascular risks, migraine with aura, active liver disease, and estrogen/progesterone protocols.
