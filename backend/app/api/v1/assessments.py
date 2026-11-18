"""Longitudinal symptom tracking and baseline assessment endpoints."""

from datetime import datetime, date, timezone
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.app.core.database import get_db
from backend.app.models import (
    User, PatientProfile, Assessment, Response, BleedingRecord, AnomalyAlert,
    PatientDoctorAccess, DoctorProfile, LabReport, LabAnalyte, AuditLog
)
from backend.app.schemas import DailyCheckInRequest, BaselineMRSRequest
from backend.app.clinical.instruments import (
    DAILY_SENTINEL_ITEMS, MRS_QUESTIONS, calculate_mrs_score, determine_straw_stage
)
from backend.app.analytics.anomaly import AnomalyAlertEngine
from backend.app.api.deps import get_current_user, get_current_patient

router = APIRouter()


@router.get("/questions/sentinel")
async def get_sentinel_questions():
    """Returns the 6-item daily sentinel symptom questionnaire."""
    return DAILY_SENTINEL_ITEMS


@router.get("/questions/mrs")
async def get_mrs_questions():
    """Returns the 11-item Menopause Rating Scale question bank."""
    return MRS_QUESTIONS


@router.post("/daily")
async def submit_daily_check_in(
    check_in: DailyCheckInRequest,
    patient: PatientProfile = Depends(get_current_patient),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submits daily micro-check-in (<90s), bleeding record, and triggers anomaly detection."""
    # 1. Upsert Assessment for this date
    existing_assessment_res = await db.execute(
        select(Assessment).where(
            Assessment.patient_id == patient.id,
            Assessment.assessment_date == check_in.assessment_date,
        ).options(selectinload(Assessment.responses))
    )
    assessment = existing_assessment_res.scalar_one_or_none()

    if not assessment:
        assessment = Assessment(
            patient_id=patient.id,
            assessment_date=check_in.assessment_date,
            completed_at=datetime.now(timezone.utc),
        )
        db.add(assessment)
        await db.flush()
    else:
        # Clear existing responses for update
        for r in assessment.responses:
            await db.delete(r)
        await db.flush()

    # 2. Add Responses for sentinel questions
    for item in check_in.responses:
        resp = Response(
            assessment_id=assessment.id,
            question_code=item.question_code,
            intensity=item.intensity,
            frequency_count=item.frequency_count,
            functional_impact=item.functional_impact,
            notes=check_in.additional_symptom_notes if item.question_code == "VM_HF" else None,
        )
        db.add(resp)

    # 3. Upsert Bleeding Record
    existing_bleeding_res = await db.execute(
        select(BleedingRecord).where(
            BleedingRecord.patient_id == patient.id,
            BleedingRecord.record_date == check_in.assessment_date,
        )
    )
    bleeding_rec = existing_bleeding_res.scalar_one_or_none()
    if not bleeding_rec:
        bleeding_rec = BleedingRecord(
            patient_id=patient.id,
            record_date=check_in.assessment_date,
            status=check_in.bleeding_status,
            duration_days=check_in.duration_days,
            has_clots=check_in.has_clots,
            basal_body_temp=check_in.basal_body_temp,
            pelvic_pain_intensity=check_in.pelvic_pain_intensity,
        )
        db.add(bleeding_rec)
    else:
        bleeding_rec.status = check_in.bleeding_status
        bleeding_rec.duration_days = check_in.duration_days
        bleeding_rec.has_clots = check_in.has_clots
        bleeding_rec.basal_body_temp = check_in.basal_body_temp
        bleeding_rec.pelvic_pain_intensity = check_in.pelvic_pain_intensity

    await db.commit()

    # 4. Run Deterministic Anomaly & Differential Engine
    # Fetch patient's linked doctor
    doc_link_res = await db.execute(
        select(PatientDoctorAccess)
        .where(PatientDoctorAccess.patient_id == patient.id, PatientDoctorAccess.status == "active")
        .options(selectinload(PatientDoctorAccess.doctor).selectinload(DoctorProfile.user))
    )
    doc_link = doc_link_res.scalar_one_or_none()
    doctor_id = doc_link.doctor_id if doc_link else None
    doctor_name = doc_link.doctor.user.full_name if doc_link and doc_link.doctor and doc_link.doctor.user else None

    # Fetch longitudinal historical daily records
    hist_resp_res = await db.execute(
        select(Response, Assessment.assessment_date)
        .join(Assessment, Response.assessment_id == Assessment.id)
        .where(Assessment.patient_id == patient.id)
        .order_by(Assessment.assessment_date.asc())
    )
    all_responses = hist_resp_res.all()
    daily_records_dict = [
        {
            "question_code": r.Response.question_code,
            "intensity": r.Response.intensity,
            "notes": r.Response.notes,
            "date": str(r.assessment_date),
        }
        for r in all_responses
    ]

    # Fetch all bleeding records
    hist_bleeding_res = await db.execute(
        select(BleedingRecord)
        .where(BleedingRecord.patient_id == patient.id)
        .order_by(BleedingRecord.record_date.asc())
    )
    all_bleeding = hist_bleeding_res.scalars().all()
    bleeding_dicts = [
        {
            "status": b.status,
            "duration_days": b.duration_days,
            "has_clots": b.has_clots,
            "basal_body_temp": b.basal_body_temp,
            "pelvic_pain_intensity": b.pelvic_pain_intensity,
            "record_date": str(b.record_date),
        }
        for b in all_bleeding
    ]

    # Fetch verified labs
    labs_res = await db.execute(
        select(LabAnalyte)
        .join(LabReport, LabAnalyte.lab_report_id == LabReport.id)
        .where(LabReport.patient_id == patient.id, LabAnalyte.is_verified_by_user == True)
    )
    all_labs = labs_res.scalars().all()
    verified_labs_dict = {l.analyte_name: l.numeric_value for l in all_labs}

    # Evaluate anomalies with total_recorded_days temporal gating
    unique_dates = len({r["date"] for r in daily_records_dict if r.get("date")})
    detected_alerts = AnomalyAlertEngine.check_for_anomalies(
        patient_id=patient.id,
        doctor_id=doctor_id,
        doctor_name=doctor_name,
        patient_age=datetime.now().year - patient.birth_year,
        straw_stage=patient.straw_stage,
        daily_records=daily_records_dict,
        bleeding_records=bleeding_dicts,
        verified_labs=verified_labs_dict,
        total_recorded_days=unique_dates,
    )

    created_alerts = []
    for alert_data in detected_alerts:
        # Check if identical alert was already generated in the last 3 days to prevent notification spam
        existing_alert_res = await db.execute(
            select(AnomalyAlert).where(
                AnomalyAlert.patient_id == patient.id,
                AnomalyAlert.condition_code == alert_data["condition_code"],
                AnomalyAlert.is_acknowledged_by_patient == False,
            )
        )
        if not existing_alert_res.scalar_one_or_none():
            alert_obj = AnomalyAlert(**alert_data)
            db.add(alert_obj)
            created_alerts.append(alert_data)

    if created_alerts:
        await db.commit()

    return {
        "success": True,
        "message": "Daily check-in recorded successfully.",
        "assessment_date": check_in.assessment_date,
        "new_alerts_triggered": created_alerts,
    }


@router.get("/history")
async def get_check_in_history(
    patient: PatientProfile = Depends(get_current_patient),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves patient's longitudinal symptom history for calendar and logs."""
    assessments_res = await db.execute(
        select(Assessment)
        .where(Assessment.patient_id == patient.id)
        .order_by(Assessment.assessment_date.desc())
        .options(selectinload(Assessment.responses))
    )
    assessments = assessments_res.scalars().all()

    bleeding_res = await db.execute(
        select(BleedingRecord)
        .where(BleedingRecord.patient_id == patient.id)
        .order_by(BleedingRecord.record_date.desc())
    )
    bleeding_map = {b.record_date: b for b in bleeding_res.scalars().all()}

    history = []
    for a in assessments:
        b = bleeding_map.get(a.assessment_date)
        history.append({
            "assessment_id": a.id,
            "date": str(a.assessment_date),
            "responses": {r.question_code: {"intensity": r.intensity, "frequency": r.frequency_count} for r in a.responses},
            "bleeding": {
                "status": b.status if b else "none",
                "duration_days": b.duration_days if b else 0,
                "has_clots": b.has_clots if b else False,
                "basal_body_temp": b.basal_body_temp if b else None,
                "pelvic_pain_intensity": b.pelvic_pain_intensity if b else 0,
            } if b else None,
        })

    return history


@router.post("/baseline-mrs")
async def submit_baseline_mrs(
    payload: BaselineMRSRequest,
    patient: PatientProfile = Depends(get_current_patient),
    db: AsyncSession = Depends(get_db),
):
    """Calculates and stores initial Menopause Rating Scale (MRS) benchmark & STRAW+10 stage."""
    mrs_result = calculate_mrs_score(payload.responses)

    # Determine STRAW+10 reproductive aging stage
    straw_stage = determine_straw_stage(
        age=datetime.now().year - patient.birth_year,
        cycle_length_variation_days=payload.cycle_length_variation_days,
        amenorrhea_days=payload.amenorrhea_days,
        is_bilateral_oophorectomy=payload.is_bilateral_oophorectomy,
    )

    patient.straw_stage = straw_stage
    patient.surgical_history = {
        "is_bilateral_oophorectomy": payload.is_bilateral_oophorectomy,
        "last_menstrual_period": str(payload.last_menstrual_period_date) if payload.last_menstrual_period_date else None,
        "baseline_mrs": mrs_result,
    }

    await db.commit()

    return {
        "success": True,
        "mrs_score": mrs_result,
        "straw_stage": straw_stage,
        "straw_stage_label": straw_stage.replace("_", " ").title(),
    }
