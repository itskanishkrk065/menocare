"""6-Month Multi-Patient Synthetic Clinical Cohort Generator.

Generates 180 days of realistic, noisy longitudinal patient data across 7 distinct clinical phenotypes:
1. Typical Perimenopausal Transition (fluctuating vasomotor, natural cycles, benign course)
2. PCOD / PCOS Phenotype (prolonged bleeding >=8d, elevated basal temp, LH:FSH > 2:1)
3. Hypothyroidism Mimic (severe persistent fatigue >=3, elevated TSH 7.2 uIU/mL)
4. Postmenopausal Bleeding Red Flag (55yo postmenopausal, sudden spotting on Day 140)
5. Uterine Fibroids & Secondary Anemia (heavy flow with clots, dropping Hemoglobin 9.2 g/dL)
6. True Premature Ovarian Insufficiency (33yo, amenorrhea >120d, confirmed FSH 38.5 mIU/mL)
7. Sporadic Low-Adherence User (logs once every 5-7 days, tests missing-data handling)
"""

import math
import random
from datetime import date, timedelta
from typing import Dict, List, Any, Optional


def _clamp(val: float, min_val: int = 0, max_val: int = 4) -> int:
    return max(min_val, min(max_val, int(round(val))))


def _calc_wave(
    day_idx: int,
    base: float,
    variance: float = 0.5,
    cycle_period: Optional[int] = None,
    cycle_amp: float = 0.0,
    trend_slope: float = 0.0,
    min_val: int = 0,
    max_val: int = 4,
) -> int:
    val = base + (trend_slope * day_idx)
    if cycle_period:
        val += cycle_amp * math.sin(2 * math.pi * (day_idx % cycle_period) / cycle_period)
    val += random.gauss(0, variance)
    return _clamp(val, min_val, max_val)


class ClinicalCohortGenerator:
    """Generates realistic 180-day longitudinal synthetic patient cohorts."""

    @classmethod
    def generate_all_cohorts(cls, start_date: Optional[date] = None, days: int = 180) -> Dict[str, Dict[str, Any]]:
        """Generates all 7 clinical cohorts spanning 180 days up to today."""
        random.seed(42)  # Deterministic seed for reproducible evaluation
        if start_date is None:
            start_date = date.today() - timedelta(days=days)

        return {
            "cohort_1_typical_perimenopause": cls._generate_cohort_1(start_date, days),
            "cohort_2_pcod_pcos": cls._generate_cohort_2(start_date, days),
            "cohort_3_hypothyroidism": cls._generate_cohort_3(start_date, days),
            "cohort_4_postmenopausal_bleeding": cls._generate_cohort_4(start_date, days),
            "cohort_5_uterine_fibroids_anemia": cls._generate_cohort_5(start_date, days),
            "cohort_6_true_poi": cls._generate_cohort_6(start_date, days),
            "cohort_7_sporadic_low_adherence": cls._generate_cohort_7(start_date, days),
        }

    @classmethod
    def _generate_cohort_1(cls, start_date: date, days: int) -> Dict[str, Any]:
        """Patient 1: Typical Perimenopause (Age 48, ~70% adherence, benign fluctuating course)."""
        daily_records = []
        bleeding_records = []
        cycle_day = 0
        cycle_length = 35

        notes_pool = [
            "Woke up feeling warm around 4am, took off extra blanket.",
            "Sudden hot flash during my team meeting, passed after 3 minutes.",
            "Sleep was slightly restless last night, feeling mild brain fog.",
            "Feeling energized and calm today, minimal vasomotor symptoms.",
            "Mild night sweats, but overall good day.",
            "Irritable in the afternoon, feeling slight temperature changes.",
        ]

        for i in range(days):
            current_date = start_date + timedelta(days=i)
            cycle_day += 1

            is_bleeding = 1 <= cycle_day <= 5
            status = "normal" if is_bleeding else "none"
            if cycle_day > cycle_length:
                cycle_day = 0
                cycle_length = random.randint(32, 42)

            bleeding_records.append({
                "record_date": str(current_date),
                "status": status,
                "duration_days": cycle_day if is_bleeding else 0,
                "has_clots": False,
                "basal_body_temp": round(36.4 + random.uniform(0.1, 0.4), 1),
                "pelvic_pain_intensity": 1 if is_bleeding else 0,
            })

            # Check adherence: Patient logs ~75% of days
            if random.random() < 0.75:
                hf = _calc_wave(day_idx=i, base=1.7, variance=0.6, cycle_period=35, cycle_amp=0.9)
                ns = _clamp(hf - random.randint(0, 1) + (1 if random.random() < 0.2 else 0))
                # Sleep disruption correlates with night sweats
                sl = _clamp(ns + random.choice([0, 1]) if ns >= 2 else random.choice([0, 1, 2]))
                md = _calc_wave(day_idx=i, base=1.3, variance=0.6, cycle_period=35, cycle_amp=0.7)
                ax = _calc_wave(day_idx=i, base=1.0, variance=0.5)
                ft = _clamp(1 + (1 if sl >= 2 else 0) + (1 if random.random() < 0.3 else 0))

                note = random.choice(notes_pool) if random.random() < 0.25 else None

                daily_records.extend([
                    {"question_code": "VM_HF", "intensity": hf, "date": str(current_date), "notes": note},
                    {"question_code": "VM_NS", "intensity": ns, "date": str(current_date)},
                    {"question_code": "SL_SQ", "intensity": sl, "date": str(current_date)},
                    {"question_code": "PS_MD", "intensity": md, "date": str(current_date)},
                    {"question_code": "PS_AX", "intensity": ax, "date": str(current_date)},
                    {"question_code": "PH_FT", "intensity": ft, "date": str(current_date)},
                ])

        return {
            "name": "Patient 1: Typical Perimenopause",
            "age": 48,
            "straw_stage": "late_transition",
            "amenorrhea_days": 45,
            "daily_records": daily_records,
            "bleeding_records": bleeding_records,
            "verified_labs": {"FSH": 22.0, "TSH": 2.1, "Hemoglobin": 13.2},
            "expected_findings": ["Stable moving average", "Zero false-alarm disease alerts", "Benign trajectory"],
        }

    @classmethod
    def _generate_cohort_2(cls, start_date: date, days: int) -> Dict[str, Any]:
        """Patient 2: PCOD / PCOS Phenotype (Age 38, prolonged bleeding >=8d, elevated temp, LH:FSH > 2:1)."""
        daily_records = []
        bleeding_records = []

        notes_pool = [
            "Bleeding continuing for day 8, noticing increased pelvic heaviness.",
            "Facial acne flare along my jawline, feeling bloated.",
            "Basal body temperature feels warm and feverish today.",
            "Long bleeding episode finally easing up, very irritable today.",
            "Mood swings intense today, struggling to focus at work.",
            "Pelvic aching and lower abdominal pressure.",
        ]

        for i in range(days):
            current_date = start_date + timedelta(days=i)

            # Prolonged bleeding episodes: Day 15-25 (11 days), Day 70-81 (12 days), Day 135-144 (10 days)
            is_bleeding = (15 <= i <= 25) or (70 <= i <= 81) or (135 <= i <= 144)
            streak = (i - 14) if (15 <= i <= 25) else ((i - 69) if (70 <= i <= 81) else ((i - 134) if (135 <= i <= 144) else 0))

            bleeding_records.append({
                "record_date": str(current_date),
                "status": "heavy" if is_bleeding else "none",
                "duration_days": streak,
                "has_clots": is_bleeding,
                "basal_body_temp": round(37.3 + random.uniform(0.0, 0.25), 1) if is_bleeding else 36.6,
                "pelvic_pain_intensity": 2 if is_bleeding else 0,
            })

            if random.random() < 0.85:
                hf = _calc_wave(day_idx=i, base=1.8, variance=0.6, cycle_period=55, cycle_amp=0.7)
                ns = _clamp(hf - random.randint(0, 1))
                sl = _calc_wave(day_idx=i, base=2.0, variance=0.6, cycle_period=55, cycle_amp=0.6)
                # PCOD patients often have severe mood instability and anxiety
                md = _calc_wave(day_idx=i, base=2.6, variance=0.7, cycle_period=55, cycle_amp=1.1)
                ax = _calc_wave(day_idx=i, base=2.1, variance=0.6)
                ft = _clamp(2 + (1 if is_bleeding else 0) + (1 if random.random() < 0.2 else 0))

                note = random.choice(notes_pool) if random.random() < 0.25 else None

                daily_records.extend([
                    {"question_code": "VM_HF", "intensity": hf, "date": str(current_date), "notes": note},
                    {"question_code": "VM_NS", "intensity": ns, "date": str(current_date)},
                    {"question_code": "SL_SQ", "intensity": sl, "date": str(current_date)},
                    {"question_code": "PS_MD", "intensity": md, "date": str(current_date)},
                    {"question_code": "PS_AX", "intensity": ax, "date": str(current_date)},
                    {"question_code": "PH_FT", "intensity": ft, "date": str(current_date)},
                ])

        return {
            "name": "Patient 2: PCOD / PCOS Phenotype",
            "age": 38,
            "straw_stage": "early_transition",
            "amenorrhea_days": 0,
            "daily_records": daily_records,
            "bleeding_records": bleeding_records,
            "verified_labs": {"LH": 17.8, "FSH": 6.1, "Testosterone": 68.0, "TSH": 1.9},  # LH:FSH = 2.92
            "expected_findings": ["PCOD_PCOS high confidence alert (>=75%)", "Prompt to schedule ultrasound"],
        }

    @classmethod
    def _generate_cohort_3(cls, start_date: date, days: int) -> Dict[str, Any]:
        """Patient 3: Hypothyroidism Mimic (Age 46, normal cycles, severe persistent fatigue, TSH 7.2)."""
        daily_records = []
        bleeding_records = []

        notes_pool = [
            "Overwhelming morning fatigue, couldn't get out of bed.",
            "Feeling constantly chilled even with heater turned on.",
            "Severe brain fog, struggled with memory and concentration at work.",
            "Constipation and sluggish energy all day.",
            "Felt exhausted despite getting 8.5 hours of sleep.",
            "Dry skin and muscle weakness in legs today.",
        ]

        for i in range(days):
            current_date = start_date + timedelta(days=i)
            is_bleeding = (i % 28) < 5

            bleeding_records.append({
                "record_date": str(current_date),
                "status": "normal" if is_bleeding else "none",
                "duration_days": (i % 28) + 1 if is_bleeding else 0,
                "has_clots": False,
                "basal_body_temp": 36.2,  # Hypothermic tendency
                "pelvic_pain_intensity": 0,
            })

            if random.random() < 0.80:
                # Fatigue displays progressive upward worsening (1.5 -> 3.5)
                trend_slope = 2.0 / 180.0
                ft = _calc_wave(day_idx=i, base=1.6, variance=0.5, trend_slope=trend_slope, min_val=1, max_val=4)
                hf = _calc_wave(day_idx=i, base=1.0, variance=0.5)
                ns = _clamp(hf - random.choice([0, 1]))
                sl = _calc_wave(day_idx=i, base=2.2, variance=0.6)  # Hypothyroid unrefreshing sleep
                md = _calc_wave(day_idx=i, base=1.9, variance=0.6, trend_slope=0.005)
                ax = _calc_wave(day_idx=i, base=1.3, variance=0.5)

                note = random.choice(notes_pool) if random.random() < 0.25 else None

                daily_records.extend([
                    {"question_code": "VM_HF", "intensity": hf, "date": str(current_date)},
                    {"question_code": "VM_NS", "intensity": ns, "date": str(current_date)},
                    {"question_code": "SL_SQ", "intensity": sl, "date": str(current_date)},
                    {"question_code": "PS_MD", "intensity": md, "date": str(current_date)},
                    {"question_code": "PS_AX", "intensity": ax, "date": str(current_date)},
                    {"question_code": "PH_FT", "intensity": ft, "date": str(current_date), "notes": note},
                ])

        return {
            "name": "Patient 3: Hypothyroidism Mimic",
            "age": 46,
            "straw_stage": "early_transition",
            "amenorrhea_days": 0,
            "daily_records": daily_records,
            "bleeding_records": bleeding_records,
            "verified_labs": {"TSH": 7.2, "Free T4": 0.65, "Hemoglobin": 13.0},
            "expected_findings": ["THYROID_HYPO high confidence alert (>=75%)", "Rule out thyroid mimic"],
        }

    @classmethod
    def _generate_cohort_4(cls, start_date: date, days: int) -> Dict[str, Any]:
        """Patient 4: Postmenopausal Bleeding Red Flag (Age 55, amenorrhea >18mo, sudden spotting Day 140)."""
        daily_records = []
        bleeding_records = []

        for i in range(days):
            current_date = start_date + timedelta(days=i)
            # Sudden spotting on Day 140 and 141 (recent event in 180-day window)
            is_spotting = (i in [140, 141])

            bleeding_records.append({
                "record_date": str(current_date),
                "status": "spotting" if is_spotting else "none",
                "duration_days": 1 if is_spotting else 0,
                "has_clots": False,
                "basal_body_temp": 36.5,
                "pelvic_pain_intensity": 1 if is_spotting else 0,
            })

            if random.random() < 0.75:
                # Normal postmenopausal fluctuations
                hf = _calc_wave(day_idx=i, base=1.2, variance=0.6)
                ns = _clamp(hf - random.choice([0, 1]))
                sl = _calc_wave(day_idx=i, base=1.5, variance=0.6)
                # Anxiety and mood swing spike on the bleeding days
                ax = 3 if is_spotting else _calc_wave(day_idx=i, base=1.0, variance=0.5)
                md = 3 if is_spotting else _calc_wave(day_idx=i, base=1.1, variance=0.5)
                ft = 2 if is_spotting else _calc_wave(day_idx=i, base=1.3, variance=0.5)

                note = (
                    "Shocked and alarmed to see fresh red spotting this morning after 1.5 years without any period!"
                    if is_spotting else None
                )

                daily_records.extend([
                    {"question_code": "VM_HF", "intensity": hf, "date": str(current_date)},
                    {"question_code": "VM_NS", "intensity": ns, "date": str(current_date)},
                    {"question_code": "SL_SQ", "intensity": sl, "date": str(current_date)},
                    {"question_code": "PS_MD", "intensity": md, "date": str(current_date)},
                    {"question_code": "PS_AX", "intensity": ax, "date": str(current_date), "notes": note},
                    {"question_code": "PH_FT", "intensity": ft, "date": str(current_date)},
                ])

        return {
            "name": "Patient 4: Postmenopausal Bleeding (Red Flag)",
            "age": 55,
            "straw_stage": "early_postmenopause",
            "amenorrhea_days": 540,  # 18 months amenorrhea
            "daily_records": daily_records,
            "bleeding_records": bleeding_records,
            "verified_labs": {"FSH": 65.0, "Estradiol": 10.0},
            "expected_findings": ["Immediate RED_PMB Emergency alert triggered on Day 140", "95% confidence"],
        }

    @classmethod
    def _generate_cohort_5(cls, start_date: date, days: int) -> Dict[str, Any]:
        """Patient 5: Uterine Fibroids & Secondary Anemia (Age 45, menorrhagia >=8d with clots, Hb 9.2)."""
        daily_records = []
        bleeding_records = []

        notes_pool = [
            "Heavy bleeding with dark blood clots, soaked through pad in 2 hours.",
            "Severe pelvic cramping and dragging lower back pain.",
            "Dizzy upon standing up, lips feel pale and weak.",
            "Flow starting to decrease, but profound fatigue lingers.",
            "Pelvic fullness making it uncomfortable to sit for long hours.",
        ]

        for i in range(days):
            current_date = start_date + timedelta(days=i)
            # Menorrhagia streaks (8-9 days of heavy bleeding every 26 days)
            day_in_cycle = i % 26
            is_heavy = day_in_cycle < 9

            bleeding_records.append({
                "record_date": str(current_date),
                "status": "heavy" if is_heavy else "none",
                "duration_days": day_in_cycle + 1 if is_heavy else 0,
                "has_clots": is_heavy,
                "basal_body_temp": 36.6,
                "pelvic_pain_intensity": 3 if is_heavy else 1,
            })

            if random.random() < 0.80:
                hf = _calc_wave(day_idx=i, base=1.2, variance=0.5)
                ns = _clamp(hf - random.choice([0, 1]))
                # Fatigue spikes severely to 3-4 during and immediately after heavy bleeding
                ft = _clamp(3 + random.choice([0, 1]) if is_heavy else 1.8 + random.gauss(0, 0.4))
                sl = _clamp(2 + (1 if is_heavy else 0))
                md = _calc_wave(day_idx=i, base=1.8, variance=0.6, cycle_period=26, cycle_amp=0.8)
                ax = _calc_wave(day_idx=i, base=1.6, variance=0.5)

                note = random.choice(notes_pool) if (is_heavy and random.random() < 0.35) else None

                daily_records.extend([
                    {"question_code": "VM_HF", "intensity": hf, "date": str(current_date)},
                    {"question_code": "VM_NS", "intensity": ns, "date": str(current_date)},
                    {"question_code": "SL_SQ", "intensity": sl, "date": str(current_date)},
                    {"question_code": "PS_MD", "intensity": md, "date": str(current_date)},
                    {"question_code": "PS_AX", "intensity": ax, "date": str(current_date)},
                    {"question_code": "PH_FT", "intensity": ft, "date": str(current_date), "notes": note},
                ])

        return {
            "name": "Patient 5: Uterine Fibroids & Anemia",
            "age": 45,
            "straw_stage": "early_transition",
            "amenorrhea_days": 0,
            "daily_records": daily_records,
            "bleeding_records": bleeding_records,
            "verified_labs": {"Hemoglobin": 9.2, "Ferritin": 14.0, "TSH": 2.0},  # Microcytic Anemia
            "expected_findings": ["FIBROIDS high confidence alert", "ANEMIA high confidence alert"],
        }

    @classmethod
    def _generate_cohort_6(cls, start_date: date, days: int) -> Dict[str, Any]:
        """Patient 6: True Premature Ovarian Insufficiency (Age 33, amenorrhea >120d, confirmed FSH 38.5)."""
        daily_records = []
        bleeding_records = []

        notes_pool = [
            "Severe night sweat woke me drenched in sweat, had to change my nightshirt.",
            "Intense heat surges radiating up my neck and face during workday.",
            "Only slept 3 hours of broken sleep, waking up burning hot.",
            "Extreme vaginal dryness causing intense irritation and discomfort.",
            "Feeling overwhelmed and anxious about these premature menopause symptoms at 33.",
        ]

        for i in range(days):
            current_date = start_date + timedelta(days=i)

            # Complete amenorrhea throughout 180 days
            bleeding_records.append({
                "record_date": str(current_date),
                "status": "none",
                "duration_days": 0,
                "has_clots": False,
                "basal_body_temp": 36.7,
                "pelvic_pain_intensity": 0,
            })

            if random.random() < 0.85:
                # Persistent severe vasomotor instability fluctuating between 2, 3, and 4
                hf = _calc_wave(day_idx=i, base=2.9, variance=0.6, cycle_period=24, cycle_amp=0.8, min_val=1, max_val=4)
                ns = _calc_wave(day_idx=i, base=2.7, variance=0.6, cycle_period=24, cycle_amp=0.7, min_val=1, max_val=4)
                sl = _calc_wave(day_idx=i, base=2.6, variance=0.6, min_val=1, max_val=4)
                md = _calc_wave(day_idx=i, base=2.0, variance=0.6)
                ax = _calc_wave(day_idx=i, base=2.2, variance=0.6)
                ft = _clamp(2 + (1 if sl >= 3 else 0))

                note = random.choice(notes_pool) if random.random() < 0.25 else None

                daily_records.extend([
                    {"question_code": "VM_HF", "intensity": hf, "date": str(current_date), "notes": note},
                    {"question_code": "VM_NS", "intensity": ns, "date": str(current_date)},
                    {"question_code": "SL_SQ", "intensity": sl, "date": str(current_date)},
                    {"question_code": "PS_MD", "intensity": md, "date": str(current_date)},
                    {"question_code": "PS_AX", "intensity": ax, "date": str(current_date)},
                    {"question_code": "PH_FT", "intensity": ft, "date": str(current_date)},
                ])

        return {
            "name": "Patient 6: True Premature Ovarian Insufficiency",
            "age": 33,
            "straw_stage": "late_transition",
            "amenorrhea_days": 140,  # >120 days amenorrhea under age 40
            "daily_records": daily_records,
            "bleeding_records": bleeding_records,
            "verified_labs": {"FSH": 38.5, "Estradiol": 18.0, "AMH": 0.12},  # Postmenopausal FSH >= 25
            "expected_findings": ["True POI high confidence alert (>=75%)", "Prompt genetic & autoimmune workup"],
        }

    @classmethod
    def _generate_cohort_7(cls, start_date: date, days: int) -> Dict[str, Any]:
        """Patient 7: Sporadic Low-Adherence User (Age 49, logs only once every 4-7 days)."""
        daily_records = []
        bleeding_records = []

        for i in range(days):
            current_date = start_date + timedelta(days=i)

            bleeding_records.append({
                "record_date": str(current_date),
                "status": "normal" if (i % 38 < 4) else "none",
                "duration_days": (i % 38) + 1 if (i % 38 < 4) else 0,
                "has_clots": False,
                "basal_body_temp": 36.5,
                "pelvic_pain_intensity": 0,
            })

            # Low adherence: Patient logs only ~22% of days
            if random.random() < 0.22:
                hf = _calc_wave(day_idx=i, base=1.6, variance=0.7)
                ns = _clamp(hf - random.choice([0, 1]))
                sl = _calc_wave(day_idx=i, base=1.8, variance=0.7)
                md = _calc_wave(day_idx=i, base=1.4, variance=0.6)
                ax = _calc_wave(day_idx=i, base=1.1, variance=0.5)
                ft = _calc_wave(day_idx=i, base=1.6, variance=0.6)

                daily_records.extend([
                    {"question_code": "VM_HF", "intensity": hf, "date": str(current_date)},
                    {"question_code": "VM_NS", "intensity": ns, "date": str(current_date)},
                    {"question_code": "SL_SQ", "intensity": sl, "date": str(current_date)},
                    {"question_code": "PS_MD", "intensity": md, "date": str(current_date)},
                    {"question_code": "PS_AX", "intensity": ax, "date": str(current_date)},
                    {"question_code": "PH_FT", "intensity": ft, "date": str(current_date)},
                ])

        return {
            "name": "Patient 7: Sporadic Low-Adherence User",
            "age": 49,
            "straw_stage": "late_transition",
            "amenorrhea_days": 60,
            "daily_records": daily_records,
            "bleeding_records": bleeding_records,
            "verified_labs": {},
            "expected_findings": ["Adherence flagged as poor (<40%)", "No premature false alert"],
        }
