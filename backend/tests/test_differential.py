"""Unit tests for the Clinical Differential & Disease Pattern Screening Engine."""

import pytest
from backend.app.analytics.differential import DifferentialScreeningEngine
from backend.app.analytics.anomaly import AnomalyAlertEngine


def test_pcod_screening_pattern_detection():
    """Verifies that a patient with 8 consecutive days of bleeding, elevated basal temp, and LH:FSH > 2:1 triggers PCOD alert."""
    daily_records = [
        {"question_code": "VM_HF", "intensity": 2, "notes": "Feeling warm and noticed facial hair acne."},
        {"question_code": "PS_MD", "intensity": 3, "notes": "Irritable and bloated."},
    ]
    # 8 consecutive days of bleeding
    bleeding_records = [
        {"record_date": f"2026-02-0{i}", "status": "heavy", "has_clots": True, "basal_body_temp": 37.4, "pelvic_pain_intensity": 2}
        for i in range(1, 9)
    ]
    # LH:FSH = 18.0 / 6.0 = 3.0 (> 2.0)
    verified_labs = {
        "LH": 18.0,
        "FSH": 6.0,
        "Testosterone": 65.0,
    }

    screenings = DifferentialScreeningEngine.evaluate_patient_differential(
        patient_age=42,
        straw_stage="early_transition",
        daily_records=daily_records,
        bleeding_records=bleeding_records,
        verified_labs=verified_labs,
    )

    pcod_match = next((s for s in screenings if s["condition_code"] == "PCOD_PCOS"), None)
    assert pcod_match is not None
    assert pcod_match["confidence_score"] >= 70.0
    assert pcod_match["risk_tier"] in ["high", "critical"]
    assert any("continuous bleeding" in c for c in pcod_match["matching_criteria_met"])
    assert any("LH:FSH" in c for c in pcod_match["matching_criteria_met"])


def test_hypothyroidism_pattern_detection():
    """Verifies that elevated TSH combined with persistent severe fatigue triggers Thyroid screening."""
    # 8 days of severe fatigue (intensity 3)
    daily_records = [
        {"question_code": "PH_FT", "intensity": 3, "notes": "Extremely cold all the time and constipated."}
        for _ in range(8)
    ]
    bleeding_records = [{"status": "none", "duration_days": 0}]
    verified_labs = {
        "TSH": 7.4,  # elevated (> 4.5)
        "Free T4": 0.6,  # low
    }

    screenings = DifferentialScreeningEngine.evaluate_patient_differential(
        patient_age=47,
        straw_stage="early_transition",
        daily_records=daily_records,
        bleeding_records=bleeding_records,
        verified_labs=verified_labs,
    )

    thyroid_match = next((s for s in screenings if s["condition_code"] == "THYROID_HYPO"), None)
    assert thyroid_match is not None
    assert thyroid_match["confidence_score"] >= 75.0
    assert thyroid_match["risk_tier"] in ["high", "critical"]
    assert any("TSH" in c for c in thyroid_match["matching_criteria_met"])


def test_postmenopausal_bleeding_red_flag_alert():
    """Verifies that any active vaginal bleeding in a postmenopausal patient triggers an immediate 95% red flag."""
    daily_records = [{"question_code": "VM_HF", "intensity": 2}]
    bleeding_records = [{"record_date": "2026-03-01", "status": "spotting", "duration_days": 1}]

    alerts = AnomalyAlertEngine.check_for_anomalies(
        patient_id="test-patient-id",
        doctor_id="test-doctor-id",
        doctor_name="Sharma",
        patient_age=54,
        straw_stage="early_postmenopause",  # 12+ months amenorrhea
        daily_records=daily_records,
        bleeding_records=bleeding_records,
        verified_labs={},
    )

    red_flag = next((a for a in alerts if a["condition_code"] == "RED_PMB"), None)
    assert red_flag is not None
    assert red_flag["confidence_score"] == 95.0
    assert red_flag["severity_level"] == "emergency"
    assert "Dr. Sharma" in red_flag["recommended_action"]


def test_fibroids_menorrhagia_pattern():
    """Verifies that heavy prolonged bleeding with clots and low hemoglobin triggers Uterine Fibroids screening."""
    daily_records = [
        {"question_code": "PH_FT", "intensity": 3, "notes": "Heavy pelvic pressure and bladder fullness."}
    ]
    bleeding_records = [
        {"record_date": f"2026-04-0{i}", "status": "heavy", "has_clots": True, "pelvic_pain_intensity": 3}
        for i in range(1, 9)
    ]
    verified_labs = {
        "Hemoglobin": 9.8,  # low (secondary anemia)
    }

    screenings = DifferentialScreeningEngine.evaluate_patient_differential(
        patient_age=46,
        straw_stage="early_transition",
        daily_records=daily_records,
        bleeding_records=bleeding_records,
        verified_labs=verified_labs,
    )

    fibroid_match = next((s for s in screenings if s["condition_code"] == "UTERINE_FIBROIDS"), None)
    assert fibroid_match is not None
    assert fibroid_match["confidence_score"] >= 65.0
    assert any("Menorrhagia" in c for c in fibroid_match["matching_criteria_met"])
