# PROFILE COMPONENT INVENTORY
## Subsystem Breakdown & Hierarchy for Individual Patient Profile

### 1. Primary Container: `PatientProfileView.tsx`
- **Location**: `frontend/src/components/doctor/PatientProfileView.tsx`
- **Parent**: `DoctorDashboard.tsx` (rendered when `selectedPatientId !== null`)
- **Props**:
  - `patientId: string`: UUID of the selected patient.
  - `onBack: () => void`: Deselects patient and returns to Cohort Directory view.
  - `onScheduleMeeting: (patientId: string) => void`: Opens telehealth scheduler modal.
- **Internal State**:
  - `activeProfileTab`: `'feed' | 'charts' | 'differentials' | 'labs' | 'notes' | 'hrt_advisor' | 'messages'`
  - `isTelehealthLiveOpen: boolean`
  - `patientDetails: PatientProfile | null`
  - `chartsData: AnalyticsChartsResponse | null`
  - `diffData: DifferentialResponse | null`
  - `timelineEvents: TimelineEvent[]`
  - `clinicalNotes: DoctorClinicalNote[]`
  - `labReports: LabReport[]`
  - `aiReport: AiReportResponse | null`
  - `windowDays: number` (default: 30)
  - `feedFilter: string` ('all' | 'checkin' | 'bleeding' | 'alert' | 'notes')
  - `isGeneratingAi: boolean`
  - `isAddingNote: boolean`
  - SOAP note draft states: `subjective`, `objective`, `assessment`, `plan`

---

### 2. Embedded & Nested Subsystems

#### A. Longitudinal Charts: `SymptomTrendsChart.tsx`
- **Location**: `frontend/src/components/patient/SymptomTrendsChart.tsx`
- **Responsibilities**:
  - Recharts composite area chart (Sleep vs Vasomotor).
  - Domain trajectory line charts (Somatovegetative, Psychological, Urogenital).
  - Sentinel symptom severity stacked bars.
  - 30-day vs 90-day window selector.
  - Adherence metrics and rolling averages.

#### B. HRT Advisor & Protocol Engine: `HrtProtocolAdvisor.tsx`
- **Location**: `frontend/src/components/doctor/HrtProtocolAdvisor.tsx`
- **Responsibilities**:
  - Checks absolute and relative contraindications (VTE, breast cancer, liver disease, unexplained vaginal bleeding).
  - Identifies predominant symptom clusters (VMS, sleep, urogenital, mood).
  - Evaluates uterine status (intact vs hysterectomy) for progesterone requirement.
  - Generates evidence-based transdermal estradiol + micronized progesterone recommendation.
  - Generates non-hormonal alternatives (SSRIs, SNRIs, Gabapentin, Fezolinetant).

#### C. Telehealth Consultation Room: `TelehealthConsultationRoom.tsx`
- **Location**: `frontend/src/components/doctor/TelehealthConsultationRoom.tsx`
- **Responsibilities**:
  - In-call video interface with Jitsi Meet integration.
  - Side-by-side EHR telemetry drawer.
  - Real-time in-call clinical note drafting.
  - Screen share and camera toggle.

#### D. Direct Patient Messages: `DoctorChatHub.tsx`
- **Location**: `frontend/src/components/doctor/DoctorChatHub.tsx`
- **Responsibilities**:
  - Longitudinal patient-doctor message stream.
  - Message status indicators (sent, delivered, read).
  - Quick clinical response templates.
  - Real-time polling/sync.

---

### 3. Stitch Presentation Primitives
- **TopActionBar**: Clean breadcrumbs with patient MRN + primary action buttons.
- **PatientSummaryHero**: High-density clinical header with initials badge, telemetry indicators, and vitals strip.
- **ClinicalAttentionPanel**: Amber/Red emergency alert banner with one-click clinical actions (`Acknowledge`, `Order Ultrasound`).
- **ModuleTabsNav**: Underline tabs with semantic badge counters.
- **TimelineFeedItem**: Distinct card layouts for checkins, bleeding events, lab milestones, and doctor SOAP notes.
