/**
 * MenoCare Centralized Terminology Engine
 *
 * One underlying medical data model -> Two tailored language experiences:
 * 1. Patient Experience: Warm, conversational, reassuring, everyday plain English.
 * 2. Doctor Experience: Accurate, precise, evidence-based clinical terminology (STRAW+10, MRS, NAMS).
 */

export type UserRole = 'patient' | 'doctor';

export interface TerminologyMapping {
  code: string;
  patient: string;
  doctor: string;
  patientDescription?: string;
  doctorDescription?: string;
}

// 1. Clinical Domains
export const DOMAIN_TERMINOLOGY: Record<string, TerminologyMapping> = {
  somatic: {
    code: 'somatic',
    patient: 'Physical Symptoms',
    doctor: 'Somatovegetative Domain',
    patientDescription: 'Changes you feel in your body, like hot flashes, sleep, heart flutters, and aching joints.',
    doctorDescription: 'Vasomotor flushes, cardiac palpitations, sleep architecture disruption, and musculoskeletal arthralgia.',
  },
  somatovegetative: {
    code: 'somatovegetative',
    patient: 'Physical Symptoms',
    doctor: 'Somatovegetative Domain',
    patientDescription: 'Changes you feel in your body, like hot flashes, sleep, heart flutters, and aching joints.',
    doctorDescription: 'Vasomotor flushes, cardiac palpitations, sleep architecture disruption, and musculoskeletal arthralgia.',
  },
  psychological: {
    code: 'psychological',
    patient: 'Emotional Wellbeing',
    doctor: 'Psychological Domain',
    patientDescription: 'How you are feeling emotionally, including mood changes, anxiety, impatience, and energy levels.',
    doctorDescription: 'Depressive affect, mood lability, generalized anxiety, irritability, and mental asthenia.',
  },
  urogenital: {
    code: 'urogenital',
    patient: 'Bladder & Intimate Health',
    doctor: 'Urogenital Domain',
    patientDescription: 'Changes in your bladder, urinary frequency, and comfort during intimate moments.',
    doctorDescription: 'Vulvovaginal atrophy, dyspareunia, urinary urgency, and pelvic floor tone.',
  },
  vasomotor: {
    code: 'vasomotor',
    patient: 'Hot Flashes & Night Sweats',
    doctor: 'Vasomotor Symptoms (VMS)',
    patientDescription: 'Sudden waves of warmth, facial flushing, or night sweating.',
    doctorDescription: 'Episodic peripheral vasodilation, cutaneous temperature surges, and nocturnal diaphoresis.',
  },
};

// 2. Symptom Codes & Items
export const SYMPTOM_TERMINOLOGY: Record<string, TerminologyMapping> = {
  hot_flashes: {
    code: 'hot_flashes',
    patient: 'Hot flashes & sweating',
    doctor: 'Vasomotor Flushes & Sweating',
    patientDescription: 'Sudden waves of warmth, facial flushing, or night sweating episodes.',
    doctorDescription: 'Acute hypothalamic thermoregulatory instability with cutaneous flushing and diaphoresis.',
  },
  night_sweats: {
    code: 'night_sweats',
    patient: 'Night sweats',
    doctor: 'Nocturnal Diaphoresis',
    patientDescription: 'Waking up feeling overheated or drenched in sweat during the night.',
    doctorDescription: 'Severe nocturnal vasomotor surges requiring sleep disruption and bedding changes.',
  },
  heart_discomfort: {
    code: 'heart_discomfort',
    patient: 'Heart fluttering or racing',
    doctor: 'Cardiac Palpitations & Dysrhythmia',
    patientDescription: 'Uncomfortable feeling of your heart pounding, racing, or fluttering unexpectedly.',
    doctorDescription: 'Benign estrogen-deficiency cardiac awareness, tachycardia, or fluttering palpitations.',
  },
  sleep_problems: {
    code: 'sleep_problems',
    patient: 'Sleep problems',
    doctor: 'Insomnia & Sleep Architecture Deficit',
    patientDescription: 'Difficulty falling asleep, waking up through the night, or waking up exhausted.',
    doctorDescription: 'Disrupted sleep continuity, fragmented REM sleep, and early morning awakening.',
  },
  depressive_mood: {
    code: 'depressive_mood',
    patient: 'Feeling down or low mood',
    doctor: 'Depressive Affect & Dysphoria',
    patientDescription: 'Feeling unusually down, sad, on the verge of tears, or lacking your usual spark.',
    doctorDescription: 'Perimenopausal mood lability, anhedonia, and subclinical depressive dysphoria.',
  },
  irritability: {
    code: 'irritability',
    patient: 'Feeling impatient or irritable',
    doctor: 'Irritability & Emotional Reactivity',
    patientDescription: 'Feeling unusually short-tempered, tense, or snappy over minor everyday things.',
    doctorDescription: 'Elevated affective reactivity, lowered frustration threshold, and somatic tension.',
  },
  anxiety: {
    code: 'anxiety',
    patient: 'Feeling restless or anxious',
    doctor: 'Anxiety & Psychomotor Restlessness',
    patientDescription: 'Inner restlessness, nervous tension, feeling on edge, or sudden worry.',
    doctorDescription: 'Hyperarousal, sympathetic nervous activation, and somatic panic-spectrum anxiety.',
  },
  exhaustion: {
    code: 'exhaustion',
    patient: 'Fatigue & low energy',
    doctor: 'Physical & Mental Asthenia',
    patientDescription: 'Feeling worn out, sluggish, or experiencing brain fog and mental tiredness.',
    doctorDescription: 'Chronic somatic fatigue, reduced physical stamina, and cognitive fatigue.',
  },
  sexual_problems: {
    code: 'sexual_problems',
    patient: 'Changes in intimacy & desire',
    doctor: 'Hypoactive Sexual Desire & Dyspareunia',
    patientDescription: 'Changes in intimacy, interest in sex, or discomfort during intercourse.',
    doctorDescription: 'Genitourinary syndrome of menopause (GSM), decreased libido, and sexual pain.',
  },
  bladder_problems: {
    code: 'bladder_problems',
    patient: 'Bladder changes or urgency',
    doctor: 'Urinary Urgency & Frequency',
    patientDescription: 'Needing to pee more often, sudden urge to pee, or waking up at night to go.',
    doctorDescription: 'Urinary tract irritation, sensory urgency, nocturia, and pelvic floor relaxation.',
  },
  vaginal_dryness: {
    code: 'vaginal_dryness',
    patient: 'Vaginal dryness or irritation',
    doctor: 'Vulvovaginal Atrophy / Dryness',
    patientDescription: 'Feelings of dryness, stinging, burning, or discomfort in the intimate area.',
    doctorDescription: 'Hypoestrogenic vaginal mucosal thinning, loss of elasticity, and vaginal dryness.',
  },
  joint_discomfort: {
    code: 'joint_discomfort',
    patient: 'Aching joints & muscle stiffness',
    doctor: 'Musculoskeletal Arthralgia & Myalgia',
    patientDescription: 'Morning joint stiffness, aching in fingers, knees, neck, or sore muscles.',
    doctorDescription: 'Estrogen withdrawal-related arthralgia, tenosynovitis, and connective tissue stiffness.',
  },
  brain_fog: {
    code: 'brain_fog',
    patient: 'Brain fog & concentration lapses',
    doctor: 'Cognitive Fog & Working Memory Lapses',
    patientDescription: 'Momentary forgetfulness, trouble finding words, or difficulty focusing.',
    doctorDescription: 'Estrogen-associated executive function and verbal working memory fluctuations.',
  },
  headaches: {
    code: 'headaches',
    patient: 'Headaches & head tension',
    doctor: 'Cephalea & Estrogen-Withdrawal Migraine',
    patientDescription: 'Tension headaches, tightness behind the eyes, or menstrual-pattern migraines.',
    doctorDescription: 'Neurovascular estrogen-withdrawal headaches and myofascial tension pain.',
  },
  cramps: {
    code: 'cramps',
    patient: 'Pelvic cramping or bloating',
    doctor: 'Pelvic Dysmenorrhea & Fluid Retention',
    patientDescription: 'Abdominal tightness, bloating, or cramping similar to period pains.',
    doctorDescription: 'Fluctuating anovulatory progesterone balance and luteal phase dysmenorrhea.',
  },
  skin_changes: {
    code: 'skin_changes',
    patient: 'Skin dryness or formication',
    doctor: 'Epidermal Xerosis & Formication',
    patientDescription: 'Dryness, crawling sensations under the skin, or reduced skin elasticity.',
    doctorDescription: 'Cutaneous collagen reduction, decreased skin hydration, and sensory formication.',
  },
};

// 3. Clinical Metrics, Dimensions & Headings
export const CONCEPT_TERMINOLOGY: Record<string, TerminologyMapping> = {
  severity: {
    code: 'severity',
    patient: 'How strongly you experienced it',
    doctor: 'Symptom Severity (0-4 Likert Scale)',
  },
  frequency: {
    code: 'frequency',
    patient: 'How often it happened',
    doctor: 'Symptom Frequency / Episode Count',
  },
  progression: {
    code: 'progression',
    patient: 'How your symptoms have changed',
    doctor: 'Longitudinal Symptom Progression',
  },
  transition: {
    code: 'transition',
    patient: 'Changes happening during menopause',
    doctor: 'Menopausal Transition (STRAW+10 Criteria)',
  },
  insights: {
    code: 'insights',
    patient: 'What your symptom patterns show',
    doctor: 'Algorithmic Clinical Insights',
  },
  tracking: {
    code: 'tracking',
    patient: 'Track how you feel',
    doctor: 'Symptom Telemetry Ingestion',
  },
  assessment_completion: {
    code: 'assessment_completion',
    patient: 'Check-in completed',
    doctor: 'Validated Assessment Completed',
  },
  trends: {
    code: 'trends',
    patient: 'Changes over time',
    doctor: 'Longitudinal Trajectory',
  },
  physiological_changes: {
    code: 'physiological_changes',
    patient: 'Changes in your body',
    doctor: 'Physiological & Biomarker Variations',
  },
  sleep_disturbances: {
    code: 'sleep_disturbances',
    patient: 'Sleep problems',
    doctor: 'Sleep Architecture Disruption',
  },
  mood_fluctuations: {
    code: 'mood_fluctuations',
    patient: 'Changes in your mood',
    doctor: 'Affective & Mood Lability',
  },
  health_overview: {
    code: 'health_overview',
    patient: 'Your health overview',
    doctor: 'Patient Clinical Overview',
  },
  feeling: {
    code: 'feeling',
    patient: "How you've been feeling",
    doctor: 'Patient-Reported Telemetry',
  },
  symptoms: {
    code: 'symptoms',
    patient: 'Your symptoms',
    doctor: 'Symptom Manifestations',
  },
  daily_check_in: {
    code: 'daily_check_in',
    patient: 'Your daily check-in',
    doctor: 'Daily Sentinel Ingestion',
  },
  recent_activity: {
    code: 'recent_activity',
    patient: 'Your recent activity',
    doctor: 'Patient Engagement & Timeline',
  },
  health_report: {
    code: 'health_report',
    patient: 'Your health report',
    doctor: 'Clinical Summary Report',
  },
  appointments: {
    code: 'appointments',
    patient: 'Your upcoming appointments',
    doctor: 'Consultation & Telehealth Queue',
  },
  medications: {
    code: 'medications',
    patient: 'Your daily medications & vitamins',
    doctor: 'Active Pharmacotherapy & Supplements',
  },
  labs: {
    code: 'labs',
    patient: 'Your blood tests & labs',
    doctor: 'Biochemical & Endocrine Diagnostic Panel',
  },
  doctor_link: {
    code: 'doctor_link',
    patient: 'Your connected doctor',
    doctor: 'Provider Association',
  },
};

// 4. Staging / Phenotype Terminology
export const STAGE_TERMINOLOGY: Record<string, TerminologyMapping> = {
  premenopause: {
    code: 'premenopause',
    patient: 'Regular Cycles (Premenopause)',
    doctor: 'Reproductive Stage (STRAW -4/-3)',
  },
  early_perimenopause: {
    code: 'early_perimenopause',
    patient: 'Early Menopause Changes',
    doctor: 'Early Menopausal Transition (STRAW -2)',
  },
  late_perimenopause: {
    code: 'late_perimenopause',
    patient: 'Later Menopause Changes',
    doctor: 'Late Menopausal Transition (STRAW -1)',
  },
  perimenopause: {
    code: 'perimenopause',
    patient: 'Menopause Transition',
    doctor: 'Perimenopause (STRAW -2 to -1)',
  },
  postmenopause: {
    code: 'postmenopause',
    patient: 'Postmenopause (Cycles Ceased)',
    doctor: 'Postmenopause (STRAW +1/+2)',
  },
};

// 5. Severity Rating Labels (0-4)
export const SEVERITY_LEVELS: Record<number, { patient: string; doctor: string }> = {
  0: { patient: 'None', doctor: 'Absent (0)' },
  1: { patient: 'Mild', doctor: 'Mild (1)' },
  2: { patient: 'Noticeable', doctor: 'Moderate (2)' },
  3: { patient: 'Strong', doctor: 'Severe (3)' },
  4: { patient: 'Very strong', doctor: 'Very Severe (4)' },
};

// 6. Natural Language Translation for AI Summaries & Insights
const CLINICAL_INSIGHT_REPLACEMENTS: Array<{ regex: RegExp; patient: string }> = [
  {
    regex: /vasomotor symptom frequency has increased( over the previous assessment period)?/gi,
    patient: "You've experienced hot flashes more often recently.",
  },
  {
    regex: /vasomotor symptom frequency/gi,
    patient: 'how often you experience hot flashes',
  },
  {
    regex: /symptom severity distribution indicates moderate fluctuations/gi,
    patient: 'Some of your symptoms have been stronger on certain days.',
  },
  {
    regex: /symptom severity/gi,
    patient: 'how strongly you feel symptoms',
  },
  {
    regex: /symptom progression/gi,
    patient: 'how your symptoms have changed',
  },
  {
    regex: /somatovegetative domain score/gi,
    patient: 'physical symptoms score',
  },
  {
    regex: /psychological affect score/gi,
    patient: 'emotional wellbeing score',
  },
  {
    regex: /urogenital subscale/gi,
    patient: 'intimate and bladder health check',
  },
  {
    regex: /sleep architecture deficit/gi,
    patient: 'trouble getting restful sleep',
  },
  {
    regex: /sleep disturbances/gi,
    patient: 'sleep problems',
  },
  {
    regex: /mood fluctuations/gi,
    patient: 'changes in your mood',
  },
  {
    regex: /clinical insights/gi,
    patient: 'what your symptom patterns show',
  },
  {
    regex: /longitudinal trends/gi,
    patient: 'changes over time',
  },
  {
    regex: /physiological changes/gi,
    patient: 'changes in your body',
  },
  {
    regex: /menopausal transition/gi,
    patient: 'changes happening during menopause',
  },
];

/**
 * Translates a symptom key or text to the appropriate audience label.
 */
export function translateSymptom(key: string, role: UserRole = 'patient'): string {
  const normalized = key.toLowerCase().trim().replace(/[\s-]+/g, '_');
  const entry = SYMPTOM_TERMINOLOGY[normalized];
  if (entry) {
    return role === 'patient' ? entry.patient : entry.doctor;
  }
  // Fallback: title case normalized string
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Translates a symptom domain to the appropriate audience label.
 */
export function translateDomain(domain: string, role: UserRole = 'patient'): string {
  const normalized = domain.toLowerCase().trim().replace(/[\s-]+/g, '_');
  const entry = DOMAIN_TERMINOLOGY[normalized];
  if (entry) {
    return role === 'patient' ? entry.patient : entry.doctor;
  }
  return domain;
}

/**
 * Translates a clinical concept or heading to the appropriate audience label.
 */
export function translateConcept(concept: string, role: UserRole = 'patient'): string {
  const normalized = concept.toLowerCase().trim().replace(/[\s-]+/g, '_');
  const entry = CONCEPT_TERMINOLOGY[normalized];
  if (entry) {
    return role === 'patient' ? entry.patient : entry.doctor;
  }
  return concept;
}

/**
 * Translates a menopause stage (STRAW) to the appropriate audience label.
 */
export function translateStage(stage: string, role: UserRole = 'patient'): string {
  const normalized = stage.toLowerCase().trim().replace(/[\s-]+/g, '_');
  const entry = STAGE_TERMINOLOGY[normalized];
  if (entry) {
    return role === 'patient' ? entry.patient : entry.doctor;
  }
  return stage;
}

/**
 * Formats a 0-4 severity rating into a gentle patient label or precise doctor label.
 */
export function formatSeverity(level: number, role: UserRole = 'patient'): string {
  const entry = SEVERITY_LEVELS[level] || SEVERITY_LEVELS[0];
  return role === 'patient' ? entry.patient : entry.doctor;
}

/**
 * Translates free-form or AI clinical text into patient-friendly plain English.
 * If role is 'doctor', returns the original text untouched.
 */
export function translateInsight(text: string, role: UserRole = 'patient'): string {
  if (!text || role === 'doctor') return text;
  let translated = text;
  for (const { regex, patient } of CLINICAL_INSIGHT_REPLACEMENTS) {
    translated = translated.replace(regex, patient);
  }
  return translated;
}
