"""Deterministic Clinical Differential & Disease Pattern Screening Engine.

Evaluates longitudinal patient symptom data, bleeding patterns, basal body temperature,
and verified local lab markers against the 15-disease clinical knowledge matrix.
Outputs objective confidence scores (0-100%) and triggers anomaly alerts.

Includes two-tier temporal gating:
- Tier A (Acute Red Flags): Evaluated immediately from Day 1 (e.g. Postmenopausal Bleeding).
- Tier B (Chronic Comorbidity Screenings): Requires minimum 14-30 observation days OR verified lab reports
  to prevent Day 1 false positives (e.g. premature POI or Thyroid alerts on a single log).
"""

from typing import Dict, List, Optional, Any
from backend.app.clinical.instruments import DIFFERENTIAL_CONDITIONS_CATALOG, RED_FLAG_INDICATORS


class DifferentialScreeningEngine:
    """Evaluates clinical disease patterns deterministically with weighted scoring and temporal gating."""

    @classmethod
    def evaluate_patient_differential(
        cls,
        patient_age: int,
        straw_stage: str,
        daily_records: List[Dict[str, Any]],
        bleeding_records: List[Dict[str, Any]],
        verified_labs: Dict[str, float],
        total_recorded_days: Optional[int] = None,
        amenorrhea_days: int = 0,
    ) -> List[Dict[str, Any]]:
        """Evaluates patient data against all 15 clinical condition rules with temporal gating.

        Returns a list of matched conditions with calculated confidence scores,
        risk tiers, and specific clinical criteria met.
        """
        results: List[Dict[str, Any]] = []

        # Count total observation days if not explicitly provided
        if total_recorded_days is None:
            observed_dates = {r.get("date") for r in daily_records if r.get("date")}
            total_recorded_days = len(observed_dates) if observed_dates else (len(daily_records) // 6 or 1)

        # -------------------------------------------------------------------
        # Precompute aggregated patient metrics
        # -------------------------------------------------------------------
        max_bleeding_consecutive_days = cls._compute_max_bleeding_consecutive_days(bleeding_records)
        has_heavy_bleeding = any(r.get("status") == "heavy" for r in bleeding_records)
        has_clots = any(r.get("has_clots") is True for r in bleeding_records)

        # Basal body temperature metrics
        temperatures = [r["basal_body_temp"] for r in bleeding_records if r.get("basal_body_temp")]
        has_elevated_temperature = any(t >= 37.2 for t in temperatures)

        # Unilateral or high pelvic pain
        max_pelvic_pain = max([r.get("pelvic_pain_intensity", 0) for r in bleeding_records], default=0)

        # Symptom intensity trajectories (extracting from daily_records)
        symptom_scores_by_code: Dict[str, List[int]] = {}
        notes_corpus: List[str] = []

        for record in daily_records:
            code = record.get("question_code")
            intensity = record.get("intensity", 0)
            if code:
                symptom_scores_by_code.setdefault(code, []).append(intensity)
            if record.get("notes"):
                notes_corpus.append(record["notes"].lower())

        fatigue_series = symptom_scores_by_code.get("PH_FT", [])
        fatigue_ge_3_days = sum(1 for score in fatigue_series if score >= 3)

        vasomotor_series = symptom_scores_by_code.get("VM_HF", []) + symptom_scores_by_code.get("VM_NS", [])
        vasomotor_ge_3_days = sum(1 for score in vasomotor_series if score >= 3)

        mood_series = symptom_scores_by_code.get("PS_MD", [])
        has_severe_mood = any(score >= 3 for score in mood_series)

        # Lab markers extraction
        lh = verified_labs.get("LH")
        fsh = verified_labs.get("FSH")
        tsh = verified_labs.get("TSH")
        hemoglobin = verified_labs.get("Hemoglobin", verified_labs.get("Hb"))
        ferritin = verified_labs.get("Ferritin")
        estradiol = verified_labs.get("Estradiol", verified_labs.get("E2"))
        testosterone = verified_labs.get("Testosterone")
        fasting_glucose = verified_labs.get("Fasting Glucose", verified_labs.get("Glucose"))
        hba1c = verified_labs.get("HbA1c")
        ldl = verified_labs.get("LDL")
        hdl = verified_labs.get("HDL")
        triglycerides = verified_labs.get("Triglycerides")
        vit_d3 = verified_labs.get("Vitamin D3", verified_labs.get("Vit D"))
        dexa_t_score = verified_labs.get("DEXA T-score")
        ca125 = verified_labs.get("CA-125")

        # Helper to search keywords safely
        def contains_any_keyword(keywords: List[str]) -> bool:
            for kw in keywords:
                for note_text in notes_corpus:
                    if kw in note_text:
                        return True
            return False

        # ===================================================================
        # TIER A: ACUTE RED FLAGS (Evaluated Immediately from Day 1)
        # ===================================================================

        # Rule 3: Endometrial Hyperplasia / Postmenopausal Bleeding (Red Flag)
        hyperplasia_score = 0.0
        hyperplasia_criteria = []

        if straw_stage in ["early_postmenopause", "late_postmenopause"] and bleeding_records:
            active_bleeding = any(r.get("status") in ["spotting", "light", "normal", "heavy"] for r in bleeding_records)
            if active_bleeding:
                hyperplasia_score = 95.0
                hyperplasia_criteria.append("URGENT RED FLAG: Active vaginal bleeding or spotting in postmenopausal patient")
        elif straw_stage == "late_transition" and max_bleeding_consecutive_days >= 10:
            hyperplasia_score = 75.0
            hyperplasia_criteria.append(
                f"Prolonged heavy perimenopausal bleeding for {max_bleeding_consecutive_days} consecutive days (unopposed estrogen hyperplasia risk)"
            )

        if hyperplasia_score >= 50.0:
            results.append(cls._format_result("ENDOMETRIAL_HYPERPLASIA", hyperplasia_score, hyperplasia_criteria))

        # ===================================================================
        # TIER B: CHRONIC COMORBIDITY SCREENINGS
        # TEMPORAL GATING: Require >= 14 observation days OR verified lab reports
        # ===================================================================
        has_lab_confirmation = len(verified_labs) > 0
        has_sufficient_tracking = total_recorded_days >= 14

        # If patient has logged < 14 days and has no confirmed lab results,
        # suppress chronic comorbidity screening to prevent Day 1 false-alarm fatigue.
        if not has_sufficient_tracking and not has_lab_confirmation:
            results.sort(key=lambda x: x["confidence_score"], reverse=True)
            return results

        # -------------------------------------------------------------------
        # Rule 1: PCOD / PCOS (Polycystic Ovarian Syndrome)
        # -------------------------------------------------------------------
        pcod_score = 0.0
        pcod_criteria = []

        if max_bleeding_consecutive_days >= 7:
            pcod_score += 35.0
            pcod_criteria.append(f"Prolonged continuous bleeding for {max_bleeding_consecutive_days} consecutive days")

        if lh is not None and fsh is not None and fsh > 0:
            ratio = lh / fsh
            if ratio >= 2.0:
                pcod_score += 35.0
                pcod_criteria.append(f"Elevated LH:FSH ratio of {ratio:.2f}:1 (hallmark of anovulatory PCOS)")

        if has_elevated_temperature:
            pcod_score += 15.0
            pcod_criteria.append("Elevated basal body temperature / prolonged hyperthermic phase")

        androgenic_keywords = ["hirsutism", "facial hair", "acne", "hair loss", "hair thinning", "weight gain"]
        if contains_any_keyword(androgenic_keywords):
            pcod_score += 15.0
            pcod_criteria.append("Patient reported androgenic signs (acne, hair thinning, or facial hair)")
        elif testosterone and testosterone > 50:
            pcod_score += 15.0
            pcod_criteria.append(f"Elevated serum testosterone ({testosterone} ng/dL)")

        if pcod_score >= 40.0:
            results.append(cls._format_result("PCOD_PCOS", pcod_score, pcod_criteria))

        # -------------------------------------------------------------------
        # Rule 2: Hypothyroidism (Primary or Hashimoto's)
        # -------------------------------------------------------------------
        thyroid_score = 0.0
        thyroid_criteria = []

        if tsh is not None and tsh > 4.5:
            thyroid_score += 50.0
            thyroid_criteria.append(f"Elevated TSH of {tsh:.2f} uIU/mL (above normal reference 0.4 - 4.5)")

        if fatigue_ge_3_days >= 7:
            thyroid_score += 25.0
            thyroid_criteria.append(f"Persistent severe fatigue on {fatigue_ge_3_days} tracked days")

        hypo_keywords = ["cold intolerance", "feeling cold", "constipation", "sluggish", "puffy face"]
        if contains_any_keyword(hypo_keywords):
            thyroid_score += 25.0
            thyroid_criteria.append("Reported characteristic hypothyroid symptoms (cold intolerance, constipation)")

        if thyroid_score >= 40.0:
            results.append(cls._format_result("THYROID_HYPO", thyroid_score, thyroid_criteria))

        # -------------------------------------------------------------------
        # Rule 4: Uterine Leiomyomas (Fibroids) - PALM-L
        # -------------------------------------------------------------------
        fibroid_score = 0.0
        fibroid_criteria = []

        if max_bleeding_consecutive_days >= 7 and has_heavy_bleeding:
            fibroid_score += 40.0
            fibroid_criteria.append("Menorrhagia: Heavy flow lasting >=7 consecutive days")

        if has_clots:
            fibroid_score += 15.0
            fibroid_criteria.append("Frequent passage of blood clots during menstruation")

        fibroid_keywords = ["pelvic pressure", "bloating", "fullness", "frequent urination", "bladder pressure"]
        if contains_any_keyword(fibroid_keywords) or max_pelvic_pain >= 3:
            fibroid_score += 25.0
            fibroid_criteria.append("Pelvic heaviness, fullness, or urinary frequency")

        if hemoglobin is not None and hemoglobin < 12.0:
            fibroid_score += 20.0
            fibroid_criteria.append(f"Secondary anemia from heavy blood loss (Hemoglobin: {hemoglobin} g/dL)")

        if fibroid_score >= 40.0:
            results.append(cls._format_result("UTERINE_FIBROIDS", fibroid_score, fibroid_criteria))

        # -------------------------------------------------------------------
        # Rule 5: Functional Ovarian Cyst (Follicular / Corpus Luteum)
        # -------------------------------------------------------------------
        cyst_score = 0.0
        cyst_criteria = []

        if max_pelvic_pain >= 2:
            cyst_score += 40.0
            cyst_criteria.append(f"Reported localized unilateral pelvic pain (severity: {max_pelvic_pain}/4)")

        if any(r.get("status") == "spotting" for r in bleeding_records):
            cyst_score += 30.0
            cyst_criteria.append("Irregular intermenstrual spotting characteristic of anovulatory follicular cyst")

        cyst_keywords = ["sharp pain", "side pain", "ovary pain", "bloated abdomen"]
        if contains_any_keyword(cyst_keywords):
            cyst_score += 20.0
            cyst_criteria.append("Noted unilateral pelvic discomfort or sharp lower abdominal pain")

        if cyst_score >= 40.0:
            results.append(cls._format_result("FUNCTIONAL_OVARIAN_CYST", cyst_score, cyst_criteria))

        # -------------------------------------------------------------------
        # Rule 6: Iron Deficiency Anemia
        # -------------------------------------------------------------------
        anemia_score = 0.0
        anemia_criteria = []

        if hemoglobin is not None and hemoglobin < 12.0:
            anemia_score += 45.0
            anemia_criteria.append(f"Low Hemoglobin of {hemoglobin} g/dL (normal >= 12.0)")

        if ferritin is not None and ferritin < 30.0:
            anemia_score += 35.0
            anemia_criteria.append(f"Depleted serum ferritin of {ferritin} ng/mL (depleted iron stores)")

        if fatigue_ge_3_days >= 7 and has_heavy_bleeding:
            anemia_score += 20.0
            anemia_criteria.append("Severe persistent fatigue paired with recurrent heavy menstrual bleeding")

        if anemia_score >= 40.0:
            results.append(cls._format_result("IRON_DEFICIENCY_ANEMIA", anemia_score, anemia_criteria))

        # -------------------------------------------------------------------
        # Rule 7: Premature Ovarian Insufficiency (POI) - RECALIBRATED
        # Criteria: Age < 40 is an eligibility gate.
        # Requires: Documented amenorrhea >= 90 days OR confirmed postmenopausal FSH (>25 mIU/mL).
        # -------------------------------------------------------------------
        if patient_age < 40:
            poi_score = 0.0
            poi_criteria = []

            # 1. Documented prolonged amenorrhea (>= 90-120 days)
            if amenorrhea_days >= 90 or straw_stage in ["early_postmenopause", "late_transition"]:
                poi_score += 40.0
                poi_criteria.append(f"Prolonged amenorrhea ({amenorrhea_days or '>=90'} days) under age 40")

            # 2. Confirmed Laboratory Biomarker (FSH >= 25 mIU/mL)
            if fsh is not None and fsh >= 25.0:
                poi_score += 45.0
                poi_criteria.append(f"Confirmed postmenopausal FSH ({fsh:.1f} mIU/mL >= 25.0)")

            # 3. Persistent vasomotor symptoms (>=7 days with severe hot flashes)
            if vasomotor_ge_3_days >= 7:
                poi_score += 15.0
                poi_criteria.append(f"Persistent severe vasomotor episodes on {vasomotor_ge_3_days} tracked days")

            # Low estradiol corroboration
            if estradiol is not None and estradiol < 25.0:
                poi_score += 10.0
                poi_criteria.append(f"Hypoestrogenic state (Estradiol {estradiol} pg/mL < 25)")

            if poi_score >= 50.0:
                results.append(cls._format_result("POI_EARLY_MENOPAUSE", poi_score, poi_criteria))

        # -------------------------------------------------------------------
        # Rule 8: Osteopenia / Osteoporosis
        # -------------------------------------------------------------------
        osteo_score = 0.0
        osteo_criteria = []

        if dexa_t_score is not None:
            if dexa_t_score <= -2.5:
                osteo_score += 80.0
                osteo_criteria.append(f"DEXA scan T-score of {dexa_t_score} indicates clinical Osteoporosis (<= -2.5)")
            elif dexa_t_score <= -1.0:
                osteo_score += 60.0
                osteo_criteria.append(f"DEXA scan T-score of {dexa_t_score} indicates Osteopenia (-1.0 to -2.5)")

        if vit_d3 is not None and vit_d3 < 20.0:
            osteo_score += 20.0
            osteo_criteria.append(f"Deficient Vitamin D3 ({vit_d3} ng/mL), accelerating bone mineral density loss")

        if osteo_score >= 40.0:
            results.append(cls._format_result("OSTEOPENIA_OSTEOPOROSIS", osteo_score, osteo_criteria))

        # -------------------------------------------------------------------
        # Rule 9: Genitourinary Syndrome of Menopause (GSM)
        # -------------------------------------------------------------------
        gsm_score = 0.0
        gsm_criteria = []

        gsm_keywords = ["dryness", "vaginal dryness", "burning", "painful sex", "dyspareunia", "urinary urgency", "uti"]
        gsm_matches = []
        for kw in gsm_keywords:
            for note_text in notes_corpus:
                if kw in note_text and kw not in gsm_matches:
                    gsm_matches.append(kw)

        if len(gsm_matches) >= 2:
            gsm_score += 65.0
            gsm_criteria.append(f"Reported cardinal GSM symptoms: {', '.join(gsm_matches)}")
        elif len(gsm_matches) == 1:
            gsm_score += 40.0
            gsm_criteria.append(f"Reported urogenital symptom: {gsm_matches[0]}")

        if gsm_score >= 40.0:
            results.append(cls._format_result("GSM_ATROPHIC_VAGINITIS", gsm_score, gsm_criteria))

        # Sort results descending by confidence score
        results.sort(key=lambda x: x["confidence_score"], reverse=True)
        return results

    @staticmethod
    def _compute_max_bleeding_consecutive_days(bleeding_records: List[Dict[str, Any]]) -> int:
        """Calculates maximum consecutive days of reported bleeding."""
        if not bleeding_records:
            return 0
        sorted_recs = sorted(bleeding_records, key=lambda x: str(x.get("record_date", "")))
        max_streak = 0
        current_streak = 0
        for rec in sorted_recs:
            if rec.get("status") in ["spotting", "light", "normal", "heavy"]:
                current_streak += 1
                if current_streak > max_streak:
                    max_streak = current_streak
            else:
                current_streak = 0
        return max_streak

    @classmethod
    def _format_result(cls, condition_code: str, score: float, criteria: List[str]) -> Dict[str, Any]:
        """Formats the differential result with catalog metadata."""
        catalog_entry = next((c for c in DIFFERENTIAL_CONDITIONS_CATALOG if c["code"] == condition_code), None)
        clamped_score = round(min(100.0, max(0.0, score)), 1)

        if clamped_score >= 80.0:
            risk_tier = "critical"
        elif clamped_score >= 60.0:
            risk_tier = "high"
        elif clamped_score >= 40.0:
            risk_tier = "moderate"
        else:
            risk_tier = "low"

        name = catalog_entry["name"] if catalog_entry else condition_code
        category = catalog_entry["category"] if catalog_entry else "General"
        workup = catalog_entry["recommended_workup"] if catalog_entry else "Consult clinician for assessment."

        return {
            "condition_code": condition_code,
            "condition_name": name,
            "category": category,
            "confidence_score": clamped_score,
            "risk_tier": risk_tier,
            "matching_criteria_met": criteria,
            "recommended_workup": workup,
        }
