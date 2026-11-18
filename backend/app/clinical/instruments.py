"""Clinical instruments, validated scales, and differential screening matrix for menopause care.

Includes:
- Menopause Rating Scale (MRS, 11 items, open clinical access)
- STRAW+10 Reproductive Aging Staging Criteria
- Sentinel Daily Micro-Tracker (6 core symptoms, <90s)
- FIGO PALM-COEIN Abnormal Uterine Bleeding Classification
- 15-Condition Differential Screening & Confidence Scoring Matrix
"""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# 1. Menopause Rating Scale (MRS) Specification
# ---------------------------------------------------------------------------

MRS_SUBSCALE_SOMATO_VEGETATIVE = "somato_vegetative"
MRS_SUBSCALE_PSYCHOLOGICAL = "psychological"
MRS_SUBSCALE_UROGENITAL = "urogenital"

MRS_QUESTIONS: List[Dict[str, Any]] = [
    {
        "code": "MRS_01",
        "subscale": MRS_SUBSCALE_SOMATO_VEGETATIVE,
        "text": "Hot flushes, sweating (episodes of sweating)",
        "domain": "vasomotor",
    },
    {
        "code": "MRS_02",
        "subscale": MRS_SUBSCALE_SOMATO_VEGETATIVE,
        "text": "Heart discomfort (unusual awareness of heart beat, heart skipping, throbbing)",
        "domain": "cardiac",
    },
    {
        "code": "MRS_03",
        "subscale": MRS_SUBSCALE_SOMATO_VEGETATIVE,
        "text": "Sleep problems (difficulty in falling asleep, difficulty in sleeping through, waking up early)",
        "domain": "sleep",
    },
    {
        "code": "MRS_04",
        "subscale": MRS_SUBSCALE_PSYCHOLOGICAL,
        "text": "Depressive mood (feeling down, sad, on the verge of tears, lack of drive, mood swings)",
        "domain": "psychological",
    },
    {
        "code": "MRS_05",
        "subscale": MRS_SUBSCALE_PSYCHOLOGICAL,
        "text": "Irritability (feeling nervous, inner tension, feeling aggressive)",
        "domain": "psychological",
    },
    {
        "code": "MRS_06",
        "subscale": MRS_SUBSCALE_PSYCHOLOGICAL,
        "text": "Anxiety (inner restlessness, feeling panicky)",
        "domain": "psychological",
    },
    {
        "code": "MRS_07",
        "subscale": MRS_SUBSCALE_PSYCHOLOGICAL,
        "text": "Physical and mental exhaustion (general decrease in performance, impaired memory, decrease in concentration)",
        "domain": "cognitive",
    },
    {
        "code": "MRS_08",
        "subscale": MRS_SUBSCALE_UROGENITAL,
        "text": "Sexual problems (change in sexual desire, in sexual activity and satisfaction)",
        "domain": "sexual_health",
    },
    {
        "code": "MRS_09",
        "subscale": MRS_SUBSCALE_UROGENITAL,
        "text": "Bladder problems (difficulty in urinating, increased need to urinate, bladder incontinence)",
        "domain": "urogenital",
    },
    {
        "code": "MRS_10",
        "subscale": MRS_SUBSCALE_UROGENITAL,
        "text": "Dryness of vagina (sensation of dryness or burning in the vagina, difficulty with intimacy)",
        "domain": "urogenital",
    },
    {
        "code": "MRS_11",
        "subscale": MRS_SUBSCALE_SOMATO_VEGETATIVE,
        "text": "Joint and muscular discomfort (pain in the joints, rheumatoid complaints)",
        "domain": "musculoskeletal",
    },
]

MRS_SEVERITY_LEVELS = {
    0: "None",
    1: "Mild",
    2: "Moderate",
    3: "Severe",
    4: "Very Severe",
}


def calculate_mrs_score(responses: Dict[str, int]) -> Dict[str, Any]:
    """Calculates total and subscale scores for the 11-item Menopause Rating Scale.

    Total score: 0-44.
    Subscales:
      - Somato-vegetative (items 1, 2, 3, 11; max 16)
      - Psychological (items 4, 5, 6, 7; max 16)
      - Urogenital (items 8, 9, 10; max 12)
    """
    subscale_scores = {
        MRS_SUBSCALE_SOMATO_VEGETATIVE: 0,
        MRS_SUBSCALE_PSYCHOLOGICAL: 0,
        MRS_SUBSCALE_UROGENITAL: 0,
    }
    total_score = 0
    subscale_map = {q["code"]: q["subscale"] for q in MRS_QUESTIONS}

    for code, score in responses.items():
        if code in subscale_map:
            clamped = max(0, min(4, int(score)))
            total_score += clamped
            subscale_scores[subscale_map[code]] += clamped

    # Clinical interpretation of total MRS score
    if total_score <= 4:
        severity = "None / Minimal"
    elif total_score <= 8:
        severity = "Mild"
    elif total_score <= 16:
        severity = "Moderate"
    else:
        severity = "Severe"

    return {
        "total_score": total_score,
        "severity": severity,
        "subscale_scores": subscale_scores,
    }


# ---------------------------------------------------------------------------
# 2. STRAW+10 Menstrual Staging Criteria
# ---------------------------------------------------------------------------

STRAW_STAGES = {
    "reproductive_late": "Late Reproductive (-3a, -3b: regular cycles or subtle changes)",
    "early_transition": "Early Menopausal Transition (-2: persistent difference of >=7 days in consecutive cycle lengths)",
    "late_transition": "Late Menopausal Transition (-1: interval of amenorrhea >=60 days)",
    "early_postmenopause": "Early Postmenopause (+1a, +1b, +1c: 12 months amenorrhea up to 5-8 years)",
    "late_postmenopause": "Late Postmenopause (+2: 5-8+ years post-LMP, persistent urogenital symptoms)",
    "induced_or_surgical": "Induced or Surgical Menopause (bilateral oophorectomy or pelvic radiation)",
}


def determine_straw_stage(
    age: int,
    cycle_length_variation_days: int,
    amenorrhea_days: int,
    is_bilateral_oophorectomy: bool = False,
) -> str:
    """Classifies patient stage based on STRAW+10 criteria."""
    if is_bilateral_oophorectomy:
        return "induced_or_surgical"
    if amenorrhea_days >= 365:
        if amenorrhea_days >= (365 * 5):
            return "late_postmenopause"
        return "early_postmenopause"
    if amenorrhea_days >= 60:
        return "late_transition"
    if cycle_length_variation_days >= 7:
        return "early_transition"
    return "reproductive_late"


# ---------------------------------------------------------------------------
# 3. Sentinel Daily Micro-Check-in Specification (6 Items, <90s)
# ---------------------------------------------------------------------------

DAILY_SENTINEL_ITEMS = [
    {
        "code": "VM_HF",
        "name": "Hot Flashes",
        "domain": "vasomotor",
        "question": "Did you experience hot flashes in the past 24 hours?",
        "intensity_scale": "0-4",
        "requires_frequency": True,
        "frequency_label": "Number of episodes",
    },
    {
        "code": "VM_NS",
        "name": "Night Sweats",
        "domain": "vasomotor",
        "question": "Did you experience night sweats while sleeping?",
        "intensity_scale": "0-4",
        "requires_frequency": True,
        "frequency_label": "Awakenings caused by sweats",
    },
    {
        "code": "SL_SQ",
        "name": "Sleep Disruption",
        "domain": "sleep",
        "question": "How disrupted or fragmented was your sleep last night?",
        "intensity_scale": "0-4 (0=Restful, 4=Severely disrupted)",
        "requires_frequency": False,
    },
    {
        "code": "PS_MD",
        "name": "Mood Instability",
        "domain": "psychological",
        "question": "How intense were your mood swings, irritability, or low mood?",
        "intensity_scale": "0-4",
        "requires_frequency": False,
    },
    {
        "code": "PS_AX",
        "name": "Anxiety & Tension",
        "domain": "psychological",
        "question": "How intense was your internal anxiety, restlessness, or worry?",
        "intensity_scale": "0-4",
        "requires_frequency": False,
    },
    {
        "code": "PH_FT",
        "name": "Physical Fatigue",
        "domain": "physical",
        "question": "How severe was your physical fatigue or lack of energy today?",
        "intensity_scale": "0-4",
        "requires_frequency": False,
    },
]


# ---------------------------------------------------------------------------
# 4. Clinical Red-Flag Indicators
# ---------------------------------------------------------------------------

RED_FLAG_INDICATORS = {
    "RED_PMB": {
        "title": "Postmenopausal Bleeding",
        "criteria": "Any vaginal bleeding or brown spotting after >=12 months of amenorrhea.",
        "urgency": "high",
        "advisory": (
            "URGENT: Postmenopausal bleeding requires prompt clinical evaluation "
            "by a gynecologist (transvaginal ultrasound and endometrial assessment) "
            "to rule out endometrial hyperplasia or malignancy."
        ),
    },
    "RED_CHEST": {
        "title": "Severe Palpitations with Chest Pain or Dyspnea",
        "criteria": "Palpitations accompanied by chest pressure, shortness of breath, or dizziness.",
        "urgency": "emergency",
        "advisory": (
            "EMERGENCY: Chest pain, severe pressure, or shortness of breath accompanied by "
            "palpitations requires immediate emergency medical evaluation."
        ),
    },
    "RED_DVT": {
        "title": "Unilateral Lower Extremity Pain & Swelling",
        "criteria": "Acute pain, redness, or swelling in one calf or leg.",
        "urgency": "emergency",
        "advisory": (
            "EMERGENCY: Unilateral calf/leg swelling or pain requires immediate clinical "
            "evaluation to exclude deep vein thrombosis (DVT)."
        ),
    },
    "RED_PSYCH": {
        "title": "Severe Depressive Crisis or Suicidal Ideation",
        "criteria": "Thoughts of self-harm, severe despair, or acute psychological crisis.",
        "urgency": "emergency",
        "advisory": (
            "CRISIS SUPPORT: Please contact a crisis helpline immediately (Tele-MANAS: 14416 / 988) "
            "or contact your physician or nearest emergency department."
        ),
    },
}


# ---------------------------------------------------------------------------
# 5. 15-Condition Differential Screening & Confidence Matrix
# ---------------------------------------------------------------------------

DIFFERENTIAL_CONDITIONS_CATALOG = [
    {
        "code": "PCOD_PCOS",
        "name": "Polycystic Ovarian Syndrome (PCOD/PCOS)",
        "category": "Endocrine / Ovarian",
        "description": "Chronic anovulation, multiple arrested subcapsular follicles, hyperandrogenism, and erratic prolonged bleeding.",
        "key_symptoms": ["prolonged_bleeding_ge_7d", "elevated_basal_temp", "hirsutism_acne", "oligomenorrhea"],
        "lab_markers": ["LH_FSH_ratio_gt_2", "elevated_testosterone", "elevated_fasting_insulin"],
        "min_confidence_threshold": 60.0,
        "recommended_workup": "Pelvic transvaginal ultrasound (ovarian morphology/follicle count), hormonal panel (LH, FSH, Total Testosterone, DHEAS), fasting glucose and insulin.",
    },
    {
        "code": "THYROID_HYPO",
        "name": "Hypothyroidism (Primary or Hashimoto's)",
        "category": "Endocrine",
        "description": "Thyroid hormone deficiency; #1 clinical mimic of perimenopausal fatigue, mood, cognitive, and weight symptoms.",
        "key_symptoms": ["persistent_fatigue_ge_7d", "cold_intolerance", "brain_fog", "unexplained_weight_gain", "constipation"],
        "lab_markers": ["elevated_TSH_gt_4_5", "low_free_T4", "positive_anti_TPO"],
        "min_confidence_threshold": 65.0,
        "recommended_workup": "Serum TSH, Free T4, Anti-TPO antibodies test, thyroid ultrasonography if nodules suspected.",
    },
    {
        "code": "ENDOMETRIAL_HYPERPLASIA",
        "name": "Endometrial Hyperplasia / Postmenopausal Bleeding",
        "category": "Gynecologic / Oncologic Precursor",
        "description": "Proliferation of endometrial glands driven by chronic unopposed estrogen; critical precursor to endometrial carcinoma.",
        "key_symptoms": ["postmenopausal_bleeding", "late_transition_prolonged_heavy_bleeding"],
        "lab_markers": ["endometrial_thickness_gt_4mm"],
        "min_confidence_threshold": 70.0,
        "recommended_workup": "Transvaginal ultrasound (measurement of endometrial stripe), pipelle endometrial biopsy / hysteroscopy D&C.",
    },
    {
        "code": "UTERINE_FIBROIDS",
        "name": "Uterine Leiomyomas (Fibroids)",
        "category": "Gynecologic Structural (PALM-L)",
        "description": "Benign smooth muscle neoplasms of the myometrium causing menorrhagia, pelvic pressure, and secondary iron deficiency.",
        "key_symptoms": ["heavy_menstrual_bleeding", "prolonged_flow_gt_7d", "pelvic_pressure_fullness", "urinary_frequency"],
        "lab_markers": ["low_hemoglobin", "low_ferritin"],
        "min_confidence_threshold": 65.0,
        "recommended_workup": "Pelvic ultrasound (transabdominal + transvaginal) for fibroid mapping, complete blood count (CBC), serum ferritin.",
    },
    {
        "code": "FUNCTIONAL_OVARIAN_CYST",
        "name": "Functional Ovarian Cyst (Follicular / Corpus Luteum)",
        "category": "Ovarian Structural",
        "description": "Unruptured follicle or persistent corpus luteum secondary to perimenopausal anovulatory cycle.",
        "key_symptoms": ["unilateral_pelvic_pain", "delayed_cycle_with_spotting", "abdominal_bloating"],
        "lab_markers": ["transvaginal_us_simple_cyst_lt_5cm"],
        "min_confidence_threshold": 60.0,
        "recommended_workup": "Pelvic transvaginal ultrasound, follow-up scan in 6-8 weeks to confirm spontaneous regression.",
    },
    {
        "code": "IRON_DEFICIENCY_ANEMIA",
        "name": "Iron Deficiency Anemia",
        "category": "Hematologic",
        "description": "Depleted iron stores secondary to perimenopausal abnormal uterine bleeding / menorrhagia.",
        "key_symptoms": ["heavy_bleeding_history", "extreme_fatigue_ge_3", "postural_dizziness", "exertional_dyspnea", "pallor"],
        "lab_markers": ["low_hemoglobin_lt_12", "low_serum_ferritin_lt_30"],
        "min_confidence_threshold": 65.0,
        "recommended_workup": "Complete Blood Count (CBC), serum ferritin, total iron binding capacity (TIBC), transferrin saturation.",
    },
    {
        "code": "POI_EARLY_MENOPAUSE",
        "name": "Premature Ovarian Insufficiency (POI)",
        "category": "Endocrine / Ovarian",
        "description": "Loss of ovarian function before age 40, characterized by amenorrhea, hypergonadotropic hypoestrogenism.",
        "key_symptoms": ["age_lt_40", "amenorrhea_ge_4_months", "severe_vasomotor_symptoms", "vaginal_dryness"],
        "lab_markers": ["FSH_gt_25_mIU_two_tests", "low_estradiol_lt_20"],
        "min_confidence_threshold": 75.0,
        "recommended_workup": "Repeat serum FSH and Estradiol (spaced 4-6 weeks), Anti-Müllerian Hormone (AMH), karyotype, FMR1 premutation, autoimmune screen.",
    },
    {
        "code": "OSTEOPENIA_OSTEOPOROSIS",
        "name": "Osteopenia / Osteoporosis",
        "category": "Musculoskeletal / Bone Metabolic",
        "description": "Accelerated bone mineral density loss driven by postmenopausal estrogen withdrawal.",
        "key_symptoms": ["chronic_back_joint_pain", "height_loss", "low_trauma_fracture_history"],
        "lab_markers": ["DEXA_T_score_le_minus_1", "low_vitamin_D3", "low_calcium"],
        "min_confidence_threshold": 70.0,
        "recommended_workup": "Dual-energy X-ray absorptiometry (DEXA) scan of lumbar spine and femoral neck, 25-hydroxy Vitamin D, serum Calcium, Alkaline Phosphatase.",
    },
    {
        "code": "GSM_ATROPHIC_VAGINITIS",
        "name": "Genitourinary Syndrome of Menopause (GSM)",
        "category": "Urogenital",
        "description": "Hypoestrogenic involution of the vulvovaginal epithelium and lower urinary tract.",
        "key_symptoms": ["vaginal_dryness", "dyspareunia_pain_with_intimacy", "urinary_urgency", "dysuria", "recurrent_UTI_symptoms"],
        "lab_markers": ["vaginal_pH_gt_4_5", "negative_bacterial_urine_culture"],
        "min_confidence_threshold": 60.0,
        "recommended_workup": "Gynecological speculum examination, vaginal pH assessment, urine microscopy/culture to rule out bacterial cystitis.",
    },
    {
        "code": "CVD_DYSLIPIDEMIA",
        "name": "Cardiovascular Dyslipidemia & Endothelial Risk",
        "category": "Cardiovascular",
        "description": "Adverse lipid shifting (elevated LDL, ApoB, decreased HDL) and arterial stiffness post-estrogen loss.",
        "key_symptoms": ["recurrent_palpitations", "elevated_resting_blood_pressure", "exertional_dyspnea"],
        "lab_markers": ["high_LDL_gt_130", "low_HDL_lt_50", "high_triglycerides_gt_150"],
        "min_confidence_threshold": 65.0,
        "recommended_workup": "Fasting lipid profile, 12-lead ECG, ambulatory blood pressure monitoring, Framingham / QRISK3 cardiovascular risk calculation.",
    },
    {
        "code": "METABOLIC_SYNDROME_T2D",
        "name": "Metabolic Syndrome / Dysglycemia",
        "category": "Metabolic",
        "description": "Visceral adiposity redistribution and insulin resistance exacerbated by midlife hormonal changes.",
        "key_symptoms": ["visceral_weight_gain", "sugar_cravings", "chronic_lethargy", "polyuria"],
        "lab_markers": ["fasting_glucose_ge_100", "HbA1c_ge_5_7", "triglycerides_ge_150"],
        "min_confidence_threshold": 65.0,
        "recommended_workup": "Fasting blood glucose, Glycated Hemoglobin (HbA1c), oral glucose tolerance test (OGTT), lipid profile.",
    },
    {
        "code": "ADENOMYOSIS",
        "name": "Adenomyosis",
        "category": "Gynecologic Structural (PALM-A)",
        "description": "Endometrial gland migration into the uterine myometrium, causing dysmenorrhea and heavy menses.",
        "key_symptoms": ["severe_progressive_dysmenorrhea_ge_3", "heavy_prolonged_bleeding", "deep_pelvic_pain"],
        "lab_markers": ["pelvic_ultrasound_junctional_zone_thickening"],
        "min_confidence_threshold": 65.0,
        "recommended_workup": "High-resolution transvaginal ultrasound or pelvic MRI focusing on the junctional zone.",
    },
    {
        "code": "ENDOMETRIOSIS_ENDOMETRIOMA",
        "name": "Endometriosis / Ovarian Endometrioma",
        "category": "Gynecologic Structural",
        "description": "Ectopic endometrial tissue outside uterus forming cystic lesions ('chocolate cysts').",
        "key_symptoms": ["chronic_cyclical_pelvic_pain", "dysmenorrhea", "dyschezia", "ovarian_cyst_history"],
        "lab_markers": ["ultrasound_ground_glass_echogenicity", "mildly_elevated_CA125"],
        "min_confidence_threshold": 65.0,
        "recommended_workup": "Transvaginal ultrasound with Doppler, CA-125 level, diagnostic laparoscopy if severe refractory pain.",
    },
    {
        "code": "PERIMENOPAUSAL_DEPRESSION",
        "name": "Perimenopausal Affective Disorder / Depression",
        "category": "Neuropsychiatric",
        "description": "New-onset or recurring major depressive vulnerability linked to erratic neurosteroid (allopregnanolone/estrogen) fluctuation.",
        "key_symptoms": ["persistent_depressed_mood_ge_3", "anhedonia", "severe_irritability", "emotional_blunting", "sleep_fragmentation"],
        "lab_markers": ["PHQ_9_score_ge_10"],
        "min_confidence_threshold": 65.0,
        "recommended_workup": "Standardized clinical psychiatric interview, PHQ-9 scale evaluation, thyroid rule-out.",
    },
    {
        "code": "OBSTRUCTIVE_SLEEP_APNEA",
        "name": "Obstructive Sleep Apnea (OSA)",
        "category": "Sleep / Respiratory",
        "description": "Upper airway collapsibility increasing 2-3x postmenopause due to progesterone loss and muscle relaxation.",
        "key_symptoms": ["unrefreshing_sleep_ge_3", "morning_headache", "frequent_nocturnal_awakenings", "snoring_choking_notes"],
        "lab_markers": ["polysomnography_AHI_ge_5"],
        "min_confidence_threshold": 60.0,
        "recommended_workup": "STOP-Bang questionnaire, overnight home sleep apnea test (HSAT) or in-lab polysomnography.",
    },
]
