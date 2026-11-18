"""Clinical report generation and certified PDF download endpoints."""

from datetime import datetime, date, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response as FastAPIResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.app.core.database import get_db
from backend.app.models import (
    User, PatientProfile, DoctorProfile, ClinicalReport, Assessment, Response,
    BleedingRecord, LabReport, LabAnalyte, PatientDoctorAccess, AuditLog
)
from backend.app.analytics.engine import DeterministicAnalyticsEngine
from backend.app.analytics.differential import DifferentialScreeningEngine
from backend.app.services.ai_summarizer import AISummarizationGateway
from backend.app.services.pdf_generator import ClinicalPDFGenerator
from backend.app.api.deps import get_current_user

router = APIRouter()


async def _compile_deterministic_payload(
    patient: PatientProfile, days: int, db: AsyncSession
) -> dict:
    """Compiles the ground truth mathematical payload for a patient."""
    start_date = date.today() - timedelta(days=days)

    # 1. Fetch assessments
    res = await db.execute(
        select(Assessment)
        .where(Assessment.patient_id == patient.id, Assessment.assessment_date >= start_date)
        .order_by(Assessment.assessment_date.asc())
        .options(selectinload(Assessment.responses))
    )
    assessments = res.scalars().all()

    by_symptom: dict[str, list] = {
        "VM_HF": [], "VM_NS": [], "SL_SQ": [], "PS_MD": [], "PS_AX": [], "PH_FT": []
    }
    recorded_dates = []
    notes_list = []

    for a in assessments:
        recorded_dates.append(a.assessment_date)
        resp_map = {r.question_code: r for r in a.responses}
        for code in by_symptom.keys():
            r = resp_map.get(code)
            by_symptom[code].append(r.intensity if r else 0)
            if r and r.notes:
                notes_list.append(r.notes)

    symptom_labels = {
        "VM_HF": "Hot Flashes", "VM_NS": "Night Sweats", "SL_SQ": "Sleep Disruption",
        "PS_MD": "Mood Swings", "PS_AX": "Anxiety", "PH_FT": "Fatigue"
    }

    symptom_trends = {}
    for code, intensities in by_symptom.items():
        metrics = DeterministicAnalyticsEngine.calculate_symptom_metrics(intensities)
        mk = DeterministicAnalyticsEngine.mann_kendall_trend_test(intensities)
        # Compute SMA-30
        series_objs = [{"date": str(a.assessment_date), "intensity": intensities[i]} for i, a in enumerate(assessments)]
        smoothed = DeterministicAnalyticsEngine.compute_moving_averages(series_objs)
        current_sma30 = smoothed[-1]["sma_30"] if smoothed else 0.0

        symptom_trends[code] = {
            "name": symptom_labels.get(code, code),
            "trend": mk["trend"],
            "confidence": mk["confidence"],
            "presence_rate_pct": metrics["presence_rate_pct"],
            "current_sma_30": current_sma30,
        }

    adherence = DeterministicAnalyticsEngine.calculate_adherence_rate(recorded_dates, start_date, date.today())

    # 2. Bleeding records
    b_res = await db.execute(select(BleedingRecord).where(BleedingRecord.patient_id == patient.id))
    bleeding_dicts = [
        {"status": b.status, "duration_days": b.duration_days, "has_clots": b.has_clots, "basal_body_temp": b.basal_body_temp, "pelvic_pain_intensity": b.pelvic_pain_intensity}
        for b in b_res.scalars().all()
    ]

    # 3. Verified Labs
    l_res = await db.execute(
        select(LabAnalyte)
        .join(LabReport, LabAnalyte.lab_report_id == LabReport.id)
        .where(LabReport.patient_id == patient.id, LabAnalyte.is_verified_by_user == True)
    )
    verified_labs_objs = l_res.scalars().all()
    verified_labs_dict = {l.analyte_name: l.numeric_value for l in verified_labs_objs}
    lab_markers_summary = [
        {"analyte_name": l.analyte_name, "numeric_value": l.numeric_value, "unit": l.unit, "flag": l.flag, "reference_range_low": l.reference_range_low, "reference_range_high": l.reference_range_high}
        for l in verified_labs_objs
    ]

    # 4. Differential Screenings
    daily_records_dict = [
        {"question_code": r.question_code, "intensity": r.intensity, "notes": r.notes}
        for a in assessments for r in a.responses
    ]
    patient_age = datetime.now().year - patient.birth_year

    screenings = DifferentialScreeningEngine.evaluate_patient_differential(
        patient_age=patient_age,
        straw_stage=patient.straw_stage,
        daily_records=daily_records_dict,
        bleeding_records=bleeding_dicts,
        verified_labs=verified_labs_dict,
        total_recorded_days=len(set(recorded_dates)),
    )

    # Check for active red flags
    active_red_flags = []
    if patient.straw_stage in ["early_postmenopause", "late_postmenopause"] and any(b["status"] in ["spotting", "light", "normal", "heavy"] for b in bleeding_dicts):
        active_red_flags.append({"indicator": "RED_PMB", "description": "Postmenopausal bleeding active"})

    return {
        "patient_id": patient.id,
        "evaluation_window_days": days,
        "adherence_rate_pct": adherence,
        "total_recorded_days": len(set(recorded_dates)),
        "symptom_trends": symptom_trends,
        "differential_screenings": screenings,
        "active_red_flags": active_red_flags,
        "verified_lab_markers": lab_markers_summary,
    }


@router.post("/generate")
async def generate_clinical_summary(
    patient_id: Optional[str] = Query(default=None),
    days: int = Query(default=30, ge=7, le=90),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generates an epistemic clinical summary via Gemini 1.5 with deterministic fallback."""
    # Resolve target patient
    if current_user.role == "patient":
        p_res = await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))
        patient = p_res.scalar_one()
    elif current_user.role == "doctor":
        if not patient_id:
            raise HTTPException(status_code=400, detail="patient_id required for doctor requests.")
        p_res = await db.execute(select(PatientProfile).where(PatientProfile.id == patient_id))
        patient = p_res.scalar_one_or_none()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found.")
    else:
        raise HTTPException(status_code=403, detail="Unauthorized.")

    payload = await _compile_deterministic_payload(patient, days, db)
    pseudonym = f"Patient-{datetime.now().year - patient.birth_year}-{patient.straw_stage.upper()}"

    summary_dict, is_fallback = await AISummarizationGateway.generate_clinical_summary(
        deterministic_payload=payload, patient_pseudonym=pseudonym
    )

    # Save report to DB
    start_date = date.today() - timedelta(days=days)
    report = ClinicalReport(
        patient_id=patient.id,
        start_date=start_date,
        end_date=date.today(),
        analytical_payload=payload,
        ai_summary=summary_dict,
        is_fallback_template=is_fallback,
        generated_by=current_user.id,
    )
    db.add(report)

    # Log audit entry
    audit = AuditLog(
        actor_id=current_user.id,
        patient_id=patient.id,
        action="GENERATE_CLINICAL_REPORT",
        details=f"Generated clinical summary (fallback={is_fallback}) for {days} days.",
    )
    db.add(audit)
    await db.commit()

    return {
        "report_id": report.id,
        "is_fallback_template": is_fallback,
        "ai_summary": summary_dict,
        "analytical_payload": payload,
        "generated_at": report.created_at,
    }


@router.get("/download-pdf")
async def download_clinical_pdf(
    patient_id: Optional[str] = Query(default=None),
    days: int = Query(default=30, ge=7, le=90),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generates and downloads a watermarked clinical PDF document."""
    if current_user.role == "patient":
        p_res = await db.execute(
            select(PatientProfile)
            .where(PatientProfile.user_id == current_user.id)
            .options(selectinload(PatientProfile.user))
        )
        patient = p_res.scalar_one()
    elif current_user.role == "doctor":
        if not patient_id:
            raise HTTPException(status_code=400, detail="patient_id required.")
        p_res = await db.execute(
            select(PatientProfile)
            .where(PatientProfile.id == patient_id)
            .options(selectinload(PatientProfile.user))
        )
        patient = p_res.scalar_one()

    # Find linked doctor info
    link_res = await db.execute(
        select(PatientDoctorAccess)
        .where(PatientDoctorAccess.patient_id == patient.id, PatientDoctorAccess.status == "active")
        .options(selectinload(PatientDoctorAccess.doctor).selectinload(DoctorProfile.user))
    )
    doc_link = link_res.scalar_one_or_none()
    doctor_info = None
    if doc_link and doc_link.doctor:
        doctor_info = {
            "full_name": doc_link.doctor.user.full_name,
            "clinic_name": doc_link.doctor.clinic_name,
        }

    payload = await _compile_deterministic_payload(patient, days, db)
    summary_dict, _ = await AISummarizationGateway.generate_clinical_summary(
        deterministic_payload=payload, patient_pseudonym=f"Patient-{patient.user.full_name}"
    )

    start_date = date.today() - timedelta(days=days)
    pdf_bytes = ClinicalPDFGenerator.generate_report_pdf(
        patient_info={
            "full_name": patient.user.full_name,
            "birth_year": patient.birth_year,
            "straw_stage": patient.straw_stage,
        },
        doctor_info=doctor_info,
        start_date=start_date,
        end_date=date.today(),
        analytics_payload=payload,
        ai_summary=summary_dict,
    )

    # Log audit
    audit = AuditLog(
        actor_id=current_user.id,
        patient_id=patient.id,
        action="EXPORT_PDF_REPORT",
        details=f"Exported clinical consultation PDF report for {days} days.",
    )
    db.add(audit)
    await db.commit()

    return FastAPIResponse(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Clinical_Summary_{patient.user.full_name.replace(' ', '_')}.pdf"},
    )
