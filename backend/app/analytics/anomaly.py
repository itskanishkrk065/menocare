"""Anomaly detection and bidirectional alert generator.

Dispatches alerts when:
- Clinical red flags are detected (e.g., Postmenopausal Bleeding, severe chest pressure)
- Differential screening confidence crosses clinical threshold (>=60%)
- Sudden statistical symptom escalation occurs (>2.5 std deviations over 30d baseline)
"""

from typing import Dict, List, Optional, Any
from backend.app.clinical.instruments import RED_FLAG_INDICATORS
from backend.app.analytics.differential import DifferentialScreeningEngine


class AnomalyAlertEngine:
    """Detects anomalies and generates patient and doctor notification payloads."""

    @classmethod
    def check_for_anomalies(
        cls,
        patient_id: str,
        doctor_id: Optional[str],
        doctor_name: Optional[str],
        patient_age: int,
        straw_stage: str,
        daily_records: List[Dict[str, Any]],
        bleeding_records: List[Dict[str, Any]],
        verified_labs: Dict[str, float],
        total_recorded_days: Optional[int] = None,
        amenorrhea_days: int = 0,
    ) -> List[Dict[str, Any]]:
        """Scans patient longitudinal data and returns a list of alert payloads to persist."""
        alerts: List[Dict[str, Any]] = []

        # Count total recorded days
        if total_recorded_days is None:
            observed_dates = {r.get("date") for r in daily_records if r.get("date")}
            total_recorded_days = len(observed_dates) if observed_dates else (len(daily_records) // 6 or 1)

        # -------------------------------------------------------------------
        # 1. Clinical Red Flags (Immediate Day 1 Eligible)
        # -------------------------------------------------------------------
        # Check for Postmenopausal Bleeding (RED_PMB)
        if straw_stage in ["early_postmenopause", "late_postmenopause"] and bleeding_records:
            active_bleeding = any(r.get("status") in ["spotting", "light", "normal", "heavy"] for r in bleeding_records)
            if active_bleeding:
                rf = RED_FLAG_INDICATORS["RED_PMB"]
                doc_text = f" with Dr. {doctor_name}" if doctor_name else " with your physician"
                alerts.append({
                    "patient_id": patient_id,
                    "doctor_id": doctor_id,
                    "trigger_type": "red_flag",
                    "condition_code": "RED_PMB",
                    "condition_name": rf["title"],
                    "confidence_score": 95.0,
                    "severity_level": "emergency",
                    "description": rf["criteria"],
                    "recommended_action": f"{rf['advisory']} Please schedule an urgent appointment{doc_text}.",
                })

        # -------------------------------------------------------------------
        # 2. Disease Pattern Matching (from Differential Engine with Temporal Gating)
        # -------------------------------------------------------------------
        differential_matches = DifferentialScreeningEngine.evaluate_patient_differential(
            patient_age=patient_age,
            straw_stage=straw_stage,
            daily_records=daily_records,
            bleeding_records=bleeding_records,
            verified_labs=verified_labs,
            total_recorded_days=total_recorded_days,
            amenorrhea_days=amenorrhea_days,
        )

        for match in differential_matches:
            # Alert on High or Critical risk tier (confidence >= 60%)
            if match["confidence_score"] >= 60.0 and match["condition_code"] != "ENDOMETRIAL_HYPERPLASIA":
                doc_text = f" with Dr. {doctor_name}" if doctor_name else " with your healthcare provider"
                criteria_summary = "; ".join(match["matching_criteria_met"][:2])

                alerts.append({
                    "patient_id": patient_id,
                    "doctor_id": doctor_id,
                    "trigger_type": "disease_pattern",
                    "condition_code": match["condition_code"],
                    "condition_name": f"Potential {match['condition_name']}",
                    "confidence_score": match["confidence_score"],
                    "severity_level": "urgent" if match["confidence_score"] >= 75.0 else "warning",
                    "description": f"Clinical pattern detected ({match['confidence_score']}% confidence): {criteria_summary}.",
                    "recommended_action": (
                        f"A screening pattern matching {match['condition_name']} was identified. "
                        f"Recommended workup: {match['recommended_workup']}. "
                        f"We advise scheduling an appointment{doc_text}."
                    ),
                })

        # -------------------------------------------------------------------
        # 3. Statistical Escalation Spike (Requires minimum 10 baseline days)
        # -------------------------------------------------------------------
        if total_recorded_days >= 10:
            recent_symptom_jump = cls._detect_recent_symptom_spike(daily_records)
            if recent_symptom_jump:
                doc_text = f" with Dr. {doctor_name}" if doctor_name else " with your clinician"
                alerts.append({
                    "patient_id": patient_id,
                    "doctor_id": doctor_id,
                    "trigger_type": "statistical_spike",
                    "condition_code": recent_symptom_jump["symptom_code"],
                    "condition_name": f"Acute Escalation in {recent_symptom_jump['symptom_name']}",
                    "confidence_score": 80.0,
                    "severity_level": "warning",
                    "description": (
                        f"Reported {recent_symptom_jump['symptom_name']} severity escalated from a 30-day "
                        f"baseline of {recent_symptom_jump['baseline_avg']:.1f} to {recent_symptom_jump['recent_avg']:.1f} "
                        f"(delta: +{recent_symptom_jump['delta']:.1f})."
                    ),
                    "recommended_action": (
                        f"Significant symptom escalation observed over the last 3 days. "
                        f"Consider scheduling a follow-up consultation{doc_text} to discuss symptom relief options."
                    ),
                })

        return alerts

    @staticmethod
    def _detect_recent_symptom_spike(daily_records: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Detects if any core symptom has jumped by delta >= 2.0 over baseline."""
        if len(daily_records) < 10:
            return None

        by_code: Dict[str, List[int]] = {}
        for r in daily_records:
            code = r.get("question_code")
            if code:
                by_code.setdefault(code, []).append(r.get("intensity", 0))

        symptom_names = {
            "VM_HF": "Hot Flashes",
            "VM_NS": "Night Sweats",
            "SL_SQ": "Sleep Disruption",
            "PS_MD": "Mood Swings",
            "PS_AX": "Anxiety",
            "PH_FT": "Fatigue",
        }

        for code, intensities in by_code.items():
            if len(intensities) >= 10:
                baseline = sum(intensities[:-3]) / len(intensities[:-3])
                recent = sum(intensities[-3:]) / 3.0
                delta = recent - baseline
                if delta >= 2.0 and recent >= 3.0:
                    return {
                        "symptom_code": code,
                        "symptom_name": symptom_names.get(code, code),
                        "baseline_avg": baseline,
                        "recent_avg": recent,
                        "delta": delta,
                    }
        return None
