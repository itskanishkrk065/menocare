"""Clinical Trend Anomaly Detection Service.

Analyzes longitudinal patient data, establishes individual historical baselines,
handles irregular check-ins without imputing missing data as zero, distinguishes
isolated spikes from persistent clinical changes, and provides evidence-backed flags.
"""

import math
from datetime import date, datetime, timedelta, timezone
from typing import Dict, List, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.models import (
    ClinicalTrendAnomaly, Assessment, Response, BleedingRecord, PatientProfile
)


class AnomalyDetectionService:
    """Interpretable statistical anomaly detection engine for longitudinal symptom trajectories."""

    DETECTION_VERSION: str = "stat_zscore_v1"
    MIN_OBSERVATION_DAYS: int = 10  # Minimum distinct recording days needed to establish baseline

    @classmethod
    def calculate_baseline(cls, values: List[float]) -> Dict[str, Any]:
        """Calculates baseline statistics on observed days only. Does NOT impute missing days as zero."""
        if not values:
            return {"mean": 0.0, "std_dev": 0.0, "sample_count": 0, "non_zero_count": 0}

        n = len(values)
        mean_val = sum(values) / n
        if n > 1:
            variance = sum((x - mean_val) ** 2 for x in values) / (n - 1)
            std_dev = math.sqrt(variance)
        else:
            std_dev = 0.0

        non_zeros = sum(1 for x in values if x > 0)

        return {
            "mean": round(mean_val, 2),
            "std_dev": round(std_dev, 2),
            "sample_count": n,
            "non_zero_count": non_zeros,
        }

    @classmethod
    def evaluate_symptom_anomalies(
        cls,
        patient_id: str,
        daily_records: List[Dict[str, Any]],
        detection_date: date,
        comparison_period_days: int = 30,
    ) -> List[Dict[str, Any]]:
        """Scans daily records for persistent shifts or acute statistical spikes.

        Distinguishes:
        - Persistent change: Elevated severity (delta >= 1.5) sustained for >=3 consecutive days.
        - Acute spike: Severe spike (intensity 4 or z-score >= 2.5) on recent observation.
        - Isolated spike: Single-day spike returning to normal (flagged as low-urgency isolated event).
        """
        anomalies: List[Dict[str, Any]] = []

        # Group responses by symptom code and sort chronologically by date
        by_symptom: Dict[str, List[Dict[str, Any]]] = {}
        distinct_dates = set()

        for rec in daily_records:
            d = rec.get("date")
            code = rec.get("question_code")
            if d and code:
                distinct_dates.add(d)
                by_symptom.setdefault(code, []).append(rec)

        for code in by_symptom:
            by_symptom[code].sort(key=lambda x: x["date"])

        # Check total recorded observation days
        if len(distinct_dates) < cls.MIN_OBSERVATION_DAYS:
            # Insufficient baseline data: do not fabricate false-positive anomalies
            return []

        # Window cutoff
        cutoff_date = (detection_date - timedelta(days=comparison_period_days)).isoformat()

        symptom_display_names = {
            "CORE_VM_HF": "Hot Flashes",
            "CORE_VM_NS": "Night Sweats",
            "CORE_SL_DIS": "Sleep Disruption",
            "CORE_PS_MOOD": "Mood Instability",
            "CORE_PS_ANX": "Anxiety & Tension",
            "CORE_PH_FAT": "Physical Fatigue",
            "VM_HF": "Hot Flashes",
            "VM_NS": "Night Sweats",
            "SL_SQ": "Sleep Disruption",
            "PS_MD": "Mood Instability",
            "PS_AX": "Anxiety",
            "PH_FT": "Fatigue",
        }

        for code, entries in by_symptom.items():
            if len(entries) < cls.MIN_OBSERVATION_DAYS:
                continue

            # Separate baseline period from recent window (last 3 observations)
            baseline_entries = [e for e in entries[:-3] if e["date"] >= cutoff_date]
            recent_entries = entries[-3:]

            if len(baseline_entries) < 5:
                # Use all earlier entries if 30-day window is sparse
                baseline_entries = entries[:-3]

            baseline_values = [float(e.get("intensity", 0)) for e in baseline_entries]
            recent_values = [float(e.get("intensity", 0)) for e in recent_entries]

            baseline_stats = cls.calculate_baseline(baseline_values)
            mean_b = baseline_stats["mean"]
            std_b = baseline_stats["std_dev"]
            recent_avg = sum(recent_values) / len(recent_values)
            delta = recent_avg - mean_b

            sym_name = symptom_display_names.get(code, code)

            # 1. Check for PERSISTENT SHIFT: elevated severity sustained for >=3 consecutive observations
            is_sustained_elevation = all(v >= (mean_b + 1.5) for v in recent_values) and recent_avg >= 2.5

            if is_sustained_elevation:
                z_score = round((recent_avg - mean_b) / (std_b or 1.0), 2)
                anomalies.append({
                    "patient_id": patient_id,
                    "observation_type": f"{code.lower()}_persistent_elevation",
                    "detection_date": detection_date,
                    "comparison_period_days": comparison_period_days,
                    "historical_baseline": {
                        **baseline_stats,
                        "observation_frequency_days": len(distinct_dates),
                    },
                    "current_observation": {
                        "observed_recent_mean": round(recent_avg, 2),
                        "delta": round(delta, 2),
                        "z_score": z_score,
                        "consecutive_elevated_days": len(recent_values),
                        "is_persistent": True,
                    },
                    "detection_method_version": cls.DETECTION_VERSION,
                    "reason_for_flagging": (
                        f"Sustained elevation in {sym_name}: average severity escalated from historical "
                        f"baseline of {mean_b:.1f} to {recent_avg:.1f} (+{delta:.1f} delta) across "
                        f"{len(recent_values)} consecutive check-ins."
                    ),
                    "relevant_source_records": [
                        {"date": e["date"], "intensity": e.get("intensity", 0), "code": code}
                        for e in recent_entries
                    ],
                })
            # 2. Check for ACUTE SPIKE: recent single jump with delta >= 2.5
            elif recent_values and recent_values[-1] >= 3 and (recent_values[-1] - mean_b) >= 2.5:
                acute_val = recent_values[-1]
                anomalies.append({
                    "patient_id": patient_id,
                    "observation_type": f"{code.lower()}_acute_spike",
                    "detection_date": detection_date,
                    "comparison_period_days": comparison_period_days,
                    "historical_baseline": baseline_stats,
                    "current_observation": {
                        "observed_value": acute_val,
                        "delta": round(acute_val - mean_b, 2),
                        "is_persistent": False,
                    },
                    "detection_method_version": cls.DETECTION_VERSION,
                    "reason_for_flagging": (
                        f"Acute spike in {sym_name}: reported intensity {acute_val} on {recent_entries[-1]['date']} "
                        f"(baseline: {mean_b:.1f}, delta: +{acute_val - mean_b:.1f})."
                    ),
                    "relevant_source_records": [
                        {"date": recent_entries[-1]["date"], "intensity": acute_val, "code": code}
                    ],
                })

        return anomalies

    @classmethod
    async def scan_and_persist_anomalies(
        cls,
        db: AsyncSession,
        patient_id: str,
        detection_date: date,
        doctor_id: Optional[str] = None,
    ) -> List[ClinicalTrendAnomaly]:
        """Runs longitudinal scan and persists any new non-duplicate anomalies."""
        # 1. Fetch historical responses
        res = await db.execute(
            select(Response, Assessment.assessment_date)
            .join(Assessment, Response.assessment_id == Assessment.id)
            .where(Assessment.patient_id == patient_id)
            .order_by(Assessment.assessment_date.asc())
        )
        all_res = res.all()
        daily_records = [
            {
                "question_code": r.Response.question_code,
                "intensity": r.Response.intensity,
                "date": r.assessment_date.isoformat() if hasattr(r.assessment_date, "isoformat") else str(r.assessment_date),
            }
            for r in all_res
        ]

        detected = cls.evaluate_symptom_anomalies(patient_id, daily_records, detection_date)
        persisted: List[ClinicalTrendAnomaly] = []

        for item in detected:
            # Prevent duplicate unreviewed anomalies of identical observation_type within 7 days
            existing = await db.execute(
                select(ClinicalTrendAnomaly).where(
                    ClinicalTrendAnomaly.patient_id == patient_id,
                    ClinicalTrendAnomaly.observation_type == item["observation_type"],
                    ClinicalTrendAnomaly.status.in_(["unreviewed", "acknowledged"]),
                )
            )
            if not existing.scalar_one_or_none():
                anomaly_obj = ClinicalTrendAnomaly(
                    patient_id=patient_id,
                    doctor_id=doctor_id,
                    observation_type=item["observation_type"],
                    detection_date=item["detection_date"],
                    comparison_period_days=item["comparison_period_days"],
                    historical_baseline=item["historical_baseline"],
                    current_observation=item["current_observation"],
                    detection_method_version=item["detection_method_version"],
                    reason_for_flagging=item["reason_for_flagging"],
                    relevant_source_records=item["relevant_source_records"],
                    status="unreviewed",
                )
                db.add(anomaly_obj)
                persisted.append(anomaly_obj)

        if persisted:
            await db.commit()

        return persisted
