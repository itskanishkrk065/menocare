"""Evidence-Based Menopause Clinical Decision Support (NAMS / BMS Guidelines).

Implements treatment algorithm recommendations based on North American Menopause Society (NAMS)
and British Menopause Society (BMS) clinical practice consensus.
"""

from typing import Dict, Any, List, Optional


def evaluate_hrt_eligibility(
    has_uterus: bool = True,
    straw_stage: str = "early_transition",
    age: int = 49,
    vasomotor_severity: int = 2,  # 0 to 4
    has_breast_cancer_history: bool = False,
    has_vte_risk: bool = False,
    has_active_liver_disease: bool = False,
    has_migraine_with_aura: bool = False,
    has_unexplained_bleeding: bool = False,
) -> Dict[str, Any]:
    """Generates an evidence-based clinical treatment plan and safety evaluation."""
    contraindications: List[str] = []
    cautions: List[str] = []

    if has_breast_cancer_history:
        contraindications.append("History of hormone-sensitive malignancy (Breast Cancer)")
    if has_unexplained_bleeding:
        contraindications.append("Unexplained postmenopausal or irregular vaginal bleeding (Requires endometrial evaluation before initiating HRT)")
    if has_active_liver_disease:
        contraindications.append("Severe active liver disease with impaired liver function tests")

    if has_vte_risk:
        cautions.append("Elevated VTE/DVT risk: Oral estrogen contraindicated; transdermal estradiol strongly indicated")
    if has_migraine_with_aura:
        cautions.append("Migraine with aura: Transdermal route required to avoid fluctuations in serum estradiol")

    is_hrt_eligible = len(contraindications) == 0

    if not is_hrt_eligible:
        return {
            "is_hrt_eligible": False,
            "protocol_name": "Non-Hormonal Neurokinin-3 / Pharmacological Protocol",
            "contraindications": contraindications,
            "cautions": cautions,
            "estrogen_regimen": None,
            "progestogen_regimen": None,
            "non_hormonal_first_line": "Fezolinetant 45 mg orally once daily (NK3 receptor antagonist - non-hormonal vasomotor targeted)",
            "non_hormonal_alternatives": [
                "Venlafaxine XR 37.5 mg to 75 mg orally daily (SNRI)",
                "Gabapentin 300 mg at bedtime (particularly beneficial for nocturnal hot flushes and sleep disruption)",
                "Oxybutynin 2.5 mg to 5 mg twice daily",
            ],
            "bone_density_support": "Elemental Calcium 1200 mg/day + Vitamin D3 1000 IU/day + Bisphosphonate evaluation if DEXA T-score <= -2.5",
            "clinical_rationale": "Systemic hormone replacement therapy is contraindicated due to documented risk factors. Non-hormonal central thermoregulatory agents provide clinically meaningful symptom reduction without oncological risk.",
            "follow_up_weeks": 6,
        }

    # Route preference: Transdermal is safest for cardiovascular, metabolic, and thrombotic profiles
    prefer_transdermal = has_vte_risk or has_migraine_with_aura or age >= 55

    # Estrogen dosage based on symptom intensity
    if vasomotor_severity >= 3:
        estrogen_rec = (
            "17β-Estradiol 50 µg/24h transdermal patch (twice weekly) or 1.0 mg/day estradiol gel"
            if prefer_transdermal
            else "Oral 17β-Estradiol 1.0 mg to 2.0 mg daily"
        )
    else:
        estrogen_rec = (
            "17β-Estradiol 25 µg/24h transdermal patch (twice weekly) or 0.5 mg/day estradiol gel"
            if prefer_transdermal
            else "Oral 17β-Estradiol 0.5 mg to 1.0 mg daily"
        )

    # Progestogen requirement
    if has_uterus:
        # In perimenopause (still bleeding), sequential/cyclical is preferred; postmenopause continuous combined
        if "postmenopause" in straw_stage.lower():
            progestogen_rec = "Micronized Progesterone (Utrogestan) 100 mg orally at bedtime daily (Continuous Combined Protocol)"
            protocol_name = "Continuous Combined Bioidentical HRT"
        else:
            progestogen_rec = "Micronized Progesterone (Utrogestan) 200 mg orally at bedtime for 12-14 days per month (Sequential/Cyclical Protocol)"
            protocol_name = "Sequential Combined Bioidentical HRT (Perimenopause Cycle Control)"
    else:
        progestogen_rec = "Not required (Patient underwent hysterectomy; unopposed estrogen therapy is safe)"
        protocol_name = "Estrogen-Only Bioidentical Replacement Therapy"

    return {
        "is_hrt_eligible": True,
        "protocol_name": protocol_name,
        "contraindications": [],
        "cautions": cautions,
        "prefer_transdermal": prefer_transdermal,
        "estrogen_regimen": estrogen_rec,
        "progestogen_regimen": progestogen_rec,
        "non_hormonal_first_line": "Not required (Candidate for first-line gold standard HRT)",
        "non_hormonal_alternatives": [
            "Fezolinetant 45 mg daily (If patient subsequently prefers non-hormonal option)",
            "Magnesium Glycinate 300 mg at bedtime for muscle relaxation and sleep continuity",
        ],
        "bone_density_support": "Elemental Calcium 1200 mg/day + Vitamin D3 1000 IU/day with resistance training",
        "clinical_rationale": (
            f"Patient is a candidate for {protocol_name}. "
            + ("Transdermal delivery selected to minimize hepatic first-pass metabolism and thrombosis risk. " if prefer_transdermal else "Standard bioidentical delivery. ")
            + ("Progesterone included to prevent endometrial hyperplasia and maintain cellular safety." if has_uterus else "")
        ),
        "follow_up_weeks": 12,
    }
