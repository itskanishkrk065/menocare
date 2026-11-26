# MenoCare UX Review & Design Audit

## 1. Executive Summary

This UX audit evaluates the MenoCare clinical and patient platform against Impeccable craft floor standards, healthcare design best practices, and WCAG 2.1 AA accessibility guidelines.

The original application had solid engineering, comprehensive medical depth, and reliable database endpoints, but suffered from significant design and cognitive flaws:
1. **Pervasive Cognitive Overload & Jargon:** Patients were greeted with terms like *"Deterministic Multi-System Comorbidity Screening Matrix"*, *"Somatovegetative Domain"*, and *"Encrypted Telemetry Live"*, creating anxiety rather than reassurance.
2. **AI-Generated Aesthetic Artifacts:** Nested cards inside cards, uppercase micro-kickers floating above headings, bouncing animations, purple-indigo gradients, and decorative icon badges.
3. **Legibility & Contrast Failures:** 10px functional text, light gray placeholders with only 2.6:1 – 3.0:1 contrast ratios, and light sage buttons failing WCAG AA.
4. **Structural Redundancy:** Multiple cards repeating identical metrics across different tabs without progressive disclosure.

## 2. Key Audit Findings by Area

### A. Patient Experience
- **Daily Check-In:** Conflated academic clinical terminology with daily symptom logging. Severity scales lacked intuitive descriptions of real-life impact.
- **MRS Assessment Modal:** Used formal medical translations from clinical papers ("Somatovegetative", "Urogenital complaints", "Heart discomfort: unusual awareness of heart beat"). These have been translated into plain, relatable descriptions.
- **Breathing Tool:** Displayed AI-tell purple/indigo gradients and bounce effects rather than a calming, organic rhythm.
- **Dashboard Overview:** Hero card was cluttered with robotic badges ("STAGE: EARLY PERIMENOPAUSE", "Encrypted Connection").

### B. Doctor Clinical Workspace
- **Clinical Terminology Balance:** The clinician requires medical precision (e.g. NAMS/BMS guidelines, differential diagnoses, biomarker reference ranges), but the UI suffered from cluttered containers, duplicate patient cards, and ambiguous tab names.
- **Tab Clarity:** Sub-tabs like "15-Disease Matrix" and "Longitudinal Timeline Feed" were needlessly obscure. They are now streamlined to "Health Patterns" and "Health Timeline".
- **Split Workspace:** The dual-pane layout (searchable patient list on the left, clinical dossier on the right) is clinically effective and preserved, but needed cleaner typographic hierarchy and less container nesting.

## 3. Impeccable Detector Results (Pre-Fix Baseline)
- **15 Anti-Patterns Detected:**
  - `nested-cards`: Cards inside cards on login and dashboard pages.
  - `undersized-ui-text`: 10px text below 11px floor.
  - `tiny-text`: 10px and 11px body text.
  - `low-contrast`: `#9b958b` placeholder text (3.0:1) and light sage button text (3.4:1).
  - `overused-font`: `Plus Jakarta Sans` flagged as generic AI-look font.
  - `ai-color-palette`: `from-indigo-400` gradient in BreathingReliefModal.
  - `bounce-easing`: `animate-bounce` on action buttons.

## 4. Remediation Plan
- **Batch 1:** Design system tokens, typography (Newsreader + Figtree), contrast fixes ($\ge 4.5:1$).
- **Batch 2:** Patient dashboard, daily check-in, and MRS assessment overhaul.
- **Batch 3:** Patient analytics, cycle calendar, medication tracker, and calming relief tools.
- **Batch 4:** Doctor dashboard, triage command center, and patient directory.
- **Batch 5:** Clinical workspace and 7 sub-tabs (Timeline, Biometrics, Health Patterns, Labs, HRT Advisor, SOAP, Messages).
- **Batch 6:** Telehealth consultations, anomaly inbox, and clinical messaging.
- **Batch 7:** Quality audit, Impeccable detection verification, and browser testing.
