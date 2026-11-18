"""Deterministic time-series charts and differential screening endpoints."""

from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.app.core.database import get_db
from backend.app.models import (
    User, PatientProfile, DoctorProfile, Assessment, Response, BleedingRecord,
    LabReport, LabAnalyte, PatientDoctorAccess
)
from backend.app.analytics.engine import DeterministicAnalyticsEngine
from backend.app.analytics.differential import DifferentialScreeningEngine
from backend.app.api.deps import get_current_user

router = APIRouter()


async def _resolve_patient_target(
    patient_id: Optional[str], current_user: User, db: AsyncSession
) -> PatientProfile:
    """Validates authorization and returns target patient profile."""
    if current_user.role == "patient":
        res = await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))
        patient = res.scalar_one_or_none()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found.")
        return patient

    elif current_user.role == "doctor":
        if not patient_id:
            raise HTTPException(status_code=400, detail="Doctor must provide patient_id query parameter.")
        d_res = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == current_user.id))
        doctor = d_res.scalar_one()

        # Check explicit access permission
        link_res = await db.execute(
            select(PatientDoctorAccess).where(
                PatientDoctorAccess.doctor_id == doctor.id,
                PatientDoctorAccess.patient_id == patient_id,
                PatientDoctorAccess.status == "active",
            )
        )
        if not link_res.scalar_one_or_none():
            raise HTTPException(status_code=403, detail="Not authorized to access this patient's records.")

        p_res = await db.execute(select(PatientProfile).where(PatientProfile.id == patient_id))
        patient = p_res.scalar_one_or_none()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found.")
        return patient

    raise HTTPException(status_code=403, detail="Unauthorized.")


@router.get("/charts")
async def get_time_series_charts(
    days: int = Query(default=30, ge=7, le=365),
    patient_id: Optional[str] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Computes SMA-7 and SMA-30 time-series data for interactive frontend graphs."""
    patient = await _resolve_patient_target(patient_id, current_user, db)

    start_date = date.today() - timedelta(days=days)

    # Fetch assessments in date range
    res = await db.execute(
        select(Assessment)
        .where(Assessment.patient_id == patient.id, Assessment.assessment_date >= start_date)
        .order_by(Assessment.assessment_date.asc())
        .options(selectinload(Assessment.responses))
    )
    assessments = res.scalars().all()

    # Organize by symptom code
    by_symptom: Dict[str, List[Dict[str, Any]]] = {
        "VM_HF": [],
        "VM_NS": [],
        "SL_SQ": [],
        "PS_MD": [],
        "PS_AX": [],
        "PH_FT": [],
    }

    recorded_dates = []
    for a in assessments:
        recorded_dates.append(a.assessment_date)
        resp_map = {r.question_code: r for r in a.responses}
        for code in by_symptom.keys():
            r = resp_map.get(code)
            by_symptom[code].append({
                "date": str(a.assessment_date),
                "intensity": r.intensity if r else 0,
                "frequency_count": r.frequency_count if r else 0,
            })

    # Compute moving averages for each symptom
    smoothed_charts: Dict[str, Any] = {}
    symptom_summary: Dict[str, Any] = {}

    symptom_labels = {
        "VM_HF": "Hot Flashes",
        "VM_NS": "Night Sweats",
        "SL_SQ": "Sleep Disruption",
        "PS_MD": "Mood Swings",
        "PS_AX": "Anxiety",
        "PH_FT": "Fatigue",
    }

    for code, series in by_symptom.items():
        smoothed_charts[code] = DeterministicAnalyticsEngine.compute_moving_averages(series)
        intensities = [item["intensity"] for item in series]
        metrics = DeterministicAnalyticsEngine.calculate_symptom_metrics(intensities)
        mk_test = DeterministicAnalyticsEngine.mann_kendall_trend_test(intensities)

        current_sma30 = smoothed_charts[code][-1]["sma_30"] if smoothed_charts[code] else 0.0

        symptom_summary[code] = {
            "name": symptom_labels.get(code, code),
            "trend": mk_test["trend"],
            "confidence": mk_test["confidence"],
            "p_value": mk_test["p_value"],
            "presence_rate_pct": metrics["presence_rate_pct"],
            "mean_intensity": metrics["mean_intensity"],
            "current_sma_30": current_sma30,
        }

    adherence_pct = DeterministicAnalyticsEngine.calculate_adherence_rate(
        recorded_dates, start_date, date.today()
    )

    return {
        "evaluation_window_days": days,
        "adherence_rate_pct": adherence_pct,
        "total_recorded_days": len(set(recorded_dates)),
        "symptom_summary": symptom_summary,
        "time_series_data": smoothed_charts,
    }


@router.get("/differential")
async def get_differential_screenings(
    patient_id: Optional[str] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Evaluates longitudinal data against the 15-condition differential screening matrix."""
    patient = await _resolve_patient_target(patient_id, current_user, db)

    # Fetch daily symptoms
    resp_res = await db.execute(
        select(Response, Assessment.assessment_date)
        .join(Assessment, Response.assessment_id == Assessment.id)
        .where(Assessment.patient_id == patient.id)
        .order_by(Assessment.assessment_date.asc())
    )
    daily_records_dict = [
        {"question_code": r.Response.question_code, "intensity": r.Response.intensity, "notes": r.Response.notes}
        for r in resp_res.all()
    ]

    # Fetch bleeding records
    bleeding_res = await db.execute(
        select(BleedingRecord).where(BleedingRecord.patient_id == patient.id)
    )
    bleeding_dicts = [
        {
            "status": b.status,
            "duration_days": b.duration_days,
            "has_clots": b.has_clots,
            "basal_body_temp": b.basal_body_temp,
            "pelvic_pain_intensity": b.pelvic_pain_intensity,
            "record_date": str(b.record_date),
        }
        for b in bleeding_res.scalars().all()
    ]

    # Fetch verified lab markers
    labs_res = await db.execute(
        select(LabAnalyte)
        .join(LabReport, LabAnalyte.lab_report_id == LabReport.id)
        .where(LabReport.patient_id == patient.id, LabAnalyte.is_verified_by_user == True)
    )
    verified_labs = {l.analyte_name: l.numeric_value for l in labs_res.scalars().all()}

    unique_dates = len({r["date"] for r in daily_records_dict if r.get("date")})
    matches = DifferentialScreeningEngine.evaluate_patient_differential(
        patient_age=datetime.now().year - patient.birth_year,
        straw_stage=patient.straw_stage,
        daily_records=daily_records_dict,
        bleeding_records=bleeding_dicts,
        verified_labs=verified_labs,
        total_recorded_days=unique_dates,
    )

    return {
        "patient_id": patient.id,
        "straw_stage": patient.straw_stage,
        "screenings": matches,
        "verified_labs_used": verified_labs,
    }
