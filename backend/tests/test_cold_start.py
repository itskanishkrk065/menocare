"""Unit tests for cold-start suppression and two-tier alert temporal gating."""

import pytest
from backend.app.analytics.differential import DifferentialScreeningEngine
from backend.app.analytics.anomaly import AnomalyAlertEngine


def test_day_1_poi_suppression_under_age_40():
    """Verifies that a single day's log from a patient aged <40 does NOT trigger a premature POI alert."""
    # Day 1: Patient age 36 logs severe hot flashes (intensity 3)
    daily_records = [
        {"question_code": "VM_HF", "intensity": 3, "date": "2026-11-17", "notes": "Having severe hot flushes."}
    ]
    bleeding_records = [{"status": "none", "duration_days": 0, "record_date": "2026-11-17"}]
    verified_labs = {}  # No lab report yet

    alerts = AnomalyAlertEngine.check_for_anomalies(
        patient_id="patient-cold-start-01",
        doctor_id=None,
        doctor_name=None,
        patient_age=36,  # Age < 40
        straw_stage="early_transition",
        daily_records=daily_records,
        bleeding_records=bleeding_records,
        verified_labs=verified_labs,
        total_recorded_days=1,  # Day 1!
    )

    # Confirm POI is NOT triggered on Day 1!
    poi_alert = next((a for a in alerts if "POI" in a["condition_code"]), None)
    assert poi_alert is None, "POI alert must be suppressed on Day 1 without lab confirmation or >=14 days tracking."


def test_day_1_red_flag_immediate_trigger():
    """Verifies that acute clinical red flags (e.g. Postmenopausal Bleeding) DO alert immediately on Day 1."""
    # Day 1: Postmenopausal patient logs spotting
    daily_records = [{"question_code": "VM_HF", "intensity": 2, "date": "2026-11-17"}]
    bleeding_records = [{"status": "spotting", "duration_days": 1, "record_date": "2026-11-17"}]

    alerts = AnomalyAlertEngine.check_for_anomalies(
        patient_id="patient-pmb-01",
        doctor_id=None,
        doctor_name=None,
        patient_age=56,
        straw_stage="early_postmenopause",  # 12+ months amenorrhea
        daily_records=daily_records,
        bleeding_records=bleeding_records,
        verified_labs={},
        total_recorded_days=1,  # Day 1!
    )

    red_flag = next((a for a in alerts if a["condition_code"] == "RED_PMB"), None)
    assert red_flag is not None, "Postmenopausal bleeding red flag must trigger immediately on Day 1."
    assert red_flag["confidence_score"] == 95.0


def test_true_poi_triggers_with_verified_labs_and_amenorrhea():
    """Verifies that true POI is accurately triggered when clinical prerequisites (FSH >25 and amenorrhea) are met."""
    daily_records = [
        {"question_code": "VM_HF", "intensity": 3, "date": f"2026-11-{i:02d}"}
        for i in range(1, 16)  # 15 days of severe hot flashes
    ]
    bleeding_records = [{"status": "none", "duration_days": 0}]
    verified_labs = {
        "FSH": 38.5,  # Confirmed postmenopausal FSH
        "Estradiol": 14.0,  # Low estradiol
    }

    alerts = AnomalyAlertEngine.check_for_anomalies(
        patient_id="patient-true-poi-01",
        doctor_id=None,
        doctor_name=None,
        patient_age=33,  # Under 40
        straw_stage="late_transition",
        daily_records=daily_records,
        bleeding_records=bleeding_records,
        verified_labs=verified_labs,
        total_recorded_days=15,
        amenorrhea_days=120,
    )

    poi_alert = next((a for a in alerts if a["condition_code"] == "POI_EARLY_MENOPAUSE"), None)
    assert poi_alert is not None
    assert poi_alert["confidence_score"] >= 80.0
