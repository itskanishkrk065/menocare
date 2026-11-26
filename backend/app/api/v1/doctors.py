"""Doctor dashboard and clinical patient management endpoints."""

from datetime import datetime, date
import random
import string
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from backend.app.core.database import get_db
from backend.app.models import (
    User, DoctorProfile, DoctorPracticeCode, PatientDoctorAccess, PatientProfile,
    AnomalyAlert, AuditLog, AppointmentRequest, DoctorClinicalNote, LabReport,
    Assessment, Response, BleedingRecord
)
from backend.app.schemas import DoctorProfileResponse, PracticeCodeResponse
from backend.app.api.deps import get_current_user, get_current_doctor

router = APIRouter()


class DoctorCreateAppointment(BaseModel):
    patient_id: str
    requested_date: date
    reason: str
    meeting_link: Optional[str] = None


class AppointmentStatusUpdate(BaseModel):
    status: str  # 'confirmed', 'completed', 'cancelled'
    meeting_link: Optional[str] = None
    doctor_notes: Optional[str] = None


class ClinicalNoteCreate(BaseModel):
    note_type: str = "soap"
    subjective: Optional[str] = None
    objective: Optional[str] = None
    assessment: Optional[str] = None
    plan: Optional[str] = None


@router.get("/profile", response_model=DoctorProfileResponse)
async def get_doctor_profile(
    doctor: DoctorProfile = Depends(get_current_doctor),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves doctor profile with current active practice code."""
    # Find active practice code
    code_res = await db.execute(
        select(DoctorPracticeCode)
        .where(DoctorPracticeCode.doctor_id == doctor.id, DoctorPracticeCode.is_active == True)
        .order_by(DoctorPracticeCode.created_at.desc())
    )
    active_code = code_res.scalars().first()

    return DoctorProfileResponse(
        id=doctor.id,
        user_id=doctor.user_id,
        full_name=current_user.full_name,
        license_number=doctor.license_number,
        specialty=doctor.specialty,
        clinic_name=doctor.clinic_name,
        clinic_phone=doctor.clinic_phone,
        clinic_address=doctor.clinic_address,
        active_code=active_code.code if active_code else None,
    )


@router.get("/practice-code", response_model=PracticeCodeResponse)
async def get_practice_code(
    doctor: DoctorProfile = Depends(get_current_doctor),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves the active practice pairing code to share with patients."""
    code_res = await db.execute(
        select(DoctorPracticeCode)
        .where(DoctorPracticeCode.doctor_id == doctor.id, DoctorPracticeCode.is_active == True)
        .order_by(DoctorPracticeCode.created_at.desc())
    )
    active_code = code_res.scalars().first()

    if not active_code:
        # Generate new one
        clean_name = "".join(c for c in current_user.full_name if c.isalpha()).upper()[:5] or "DOC"
        new_code_str = f"DR-{clean_name}-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
        active_code = DoctorPracticeCode(doctor_id=doctor.id, code=new_code_str, is_active=True)
        db.add(active_code)
        await db.commit()

    return PracticeCodeResponse(
        code=active_code.code,
        doctor_name=current_user.full_name,
        clinic_name=doctor.clinic_name,
        created_at=active_code.created_at,
    )


@router.get("/patients")
async def list_authorized_patients(
    doctor: DoctorProfile = Depends(get_current_doctor),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Lists all active patients linked to this doctor with comprehensive clinical findings."""
    links_res = await db.execute(
        select(PatientDoctorAccess)
        .where(PatientDoctorAccess.doctor_id == doctor.id, PatientDoctorAccess.status == "active")
        .options(
            selectinload(PatientDoctorAccess.patient).selectinload(PatientProfile.user),
            selectinload(PatientDoctorAccess.patient).selectinload(PatientProfile.alerts),
        )
    )
    links = links_res.scalars().all()

    patient_list = []
    for link in links:
        patient = link.patient
        if not patient or not patient.user:
            continue

        unack_alerts = [a for a in patient.alerts if not a.is_acknowledged_by_doctor]
        has_red_flags = any(a.severity_level in ["urgent", "emergency"] for a in unack_alerts)

        alerts_summary = [
            {
                "id": a.id,
                "condition_name": a.condition_name,
                "severity_level": a.severity_level,
                "confidence_score": a.confidence_score,
                "description": a.description,
                "recommended_action": a.recommended_action,
                "is_acknowledged_by_doctor": a.is_acknowledged_by_doctor,
                "created_at": a.created_at.strftime("%Y-%m-%d") if a.created_at else None,
            }
            for a in patient.alerts
        ]

        patient_list.append({
            "patient_id": patient.id,
            "full_name": patient.user.full_name,
            "email": patient.user.email,
            "birth_year": patient.birth_year,
            "age": (date.today().year - patient.birth_year) if patient.birth_year else 48,
            "straw_stage": patient.straw_stage.replace("_", " ").title(),
            "linked_at": link.linked_at.strftime("%Y-%m-%d") if link.linked_at else None,
            "unacknowledged_alerts_count": len(unack_alerts),
            "has_high_priority_alerts": has_red_flags,
            "alerts": alerts_summary,
            "surgical_history": patient.surgical_history,
            "current_medications": patient.current_medications,
        })

    return patient_list


@router.get("/overview")
async def get_doctor_overview(
    doctor: DoctorProfile = Depends(get_current_doctor),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Clinical Command Center KPI metrics: patient counts, alerts, appointments."""
    # 1. Total linked patients
    p_count_res = await db.execute(
        select(func.count(PatientDoctorAccess.id)).where(
            PatientDoctorAccess.doctor_id == doctor.id,
            PatientDoctorAccess.status == "active",
        )
    )
    total_patients = p_count_res.scalar() or 0

    # 2. Alerts breakdown
    alerts_res = await db.execute(
        select(AnomalyAlert)
        .join(PatientDoctorAccess, PatientDoctorAccess.patient_id == AnomalyAlert.patient_id)
        .where(
            PatientDoctorAccess.doctor_id == doctor.id,
            PatientDoctorAccess.status == "active",
            AnomalyAlert.is_acknowledged_by_doctor == False,
        )
    )
    alerts = alerts_res.scalars().all()
    critical_alerts = [a for a in alerts if a.severity_level in ["urgent", "emergency"]]

    # 3. Scheduled appointments for today & upcoming
    today = date.today()
    appts_res = await db.execute(
        select(AppointmentRequest)
        .where(AppointmentRequest.doctor_id == doctor.id)
        .order_by(AppointmentRequest.requested_date.asc())
        .options(selectinload(AppointmentRequest.patient).selectinload(PatientProfile.user))
    )
    all_appts = appts_res.scalars().all()
    today_appts = [a for a in all_appts if a.requested_date == today and a.status != "cancelled"]

    # 4. STRAW stage breakdown
    stage_res = await db.execute(
        select(PatientProfile.straw_stage, func.count(PatientProfile.id))
        .join(PatientDoctorAccess, PatientDoctorAccess.patient_id == PatientProfile.id)
        .where(PatientDoctorAccess.doctor_id == doctor.id)
        .group_by(PatientProfile.straw_stage)
    )
    stages = {row[0].replace("_", " ").title(): row[1] for row in stage_res.all()}

    return {
        "doctor_name": current_user.full_name,
        "clinic_name": doctor.clinic_name,
        "total_patients": total_patients,
        "active_alerts_count": len(alerts),
        "critical_red_flags_count": len(critical_alerts),
        "today_appointments_count": len(today_appts),
        "straw_distribution": stages,
        "today_appointments": [
            {
                "id": a.id,
                "patient_id": a.patient_id,
                "patient_name": a.patient.user.full_name if a.patient and a.patient.user else "Patient",
                "requested_date": str(a.requested_date),
                "reason": a.reason,
                "status": a.status,
                "meeting_link": a.meeting_link,
            }
            for a in today_appts
        ],
    }


@router.post("/appointments")
async def create_doctor_appointment(
    payload: DoctorCreateAppointment,
    doctor: DoctorProfile = Depends(get_current_doctor),
    db: AsyncSession = Depends(get_db),
):
    """Doctor schedules or initiates a clinical meeting with a patient."""
    # Verify link
    link = await db.execute(
        select(PatientDoctorAccess).where(
            PatientDoctorAccess.doctor_id == doctor.id,
            PatientDoctorAccess.patient_id == payload.patient_id,
            PatientDoctorAccess.status == "active",
        )
    )
    if not link.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Patient is not authorized under this doctor.")

    appt = AppointmentRequest(
        patient_id=payload.patient_id,
        doctor_id=doctor.id,
        requested_date=payload.requested_date,
        reason=payload.reason,
        status="confirmed",
        meeting_link=payload.meeting_link or f"https://meet.jit.si/MenoCare-{payload.patient_id[:8]}",
    )
    db.add(appt)
    await db.commit()
    return {"message": "Consultation scheduled successfully", "id": appt.id, "meeting_link": appt.meeting_link}


@router.patch("/appointments/{appointment_id}")
async def update_appointment_status(
    appointment_id: str,
    payload: AppointmentStatusUpdate,
    doctor: DoctorProfile = Depends(get_current_doctor),
    db: AsyncSession = Depends(get_db),
):
    """Update appointment status, meeting link, or doctor notes."""
    res = await db.execute(
        select(AppointmentRequest).where(
            AppointmentRequest.id == appointment_id,
            AppointmentRequest.doctor_id == doctor.id,
        )
    )
    appt = res.scalar_one_or_none()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    appt.status = payload.status
    if payload.meeting_link is not None:
        appt.meeting_link = payload.meeting_link
    if payload.doctor_notes is not None:
        appt.doctor_notes = payload.doctor_notes

    await db.commit()
    return {"message": "Appointment updated", "id": appt.id, "status": appt.status}


@router.get("/patients/{patient_id}/notes")
async def list_patient_notes(
    patient_id: str,
    doctor: DoctorProfile = Depends(get_current_doctor),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves SOAP clinical consultation notes written by doctors for this patient."""
    res = await db.execute(
        select(DoctorClinicalNote)
        .where(
            DoctorClinicalNote.patient_id == patient_id,
            DoctorClinicalNote.doctor_id == doctor.id,
        )
        .order_by(DoctorClinicalNote.created_at.desc())
    )
    notes = res.scalars().all()
    return [
        {
            "id": n.id,
            "note_type": n.note_type,
            "subjective": n.subjective,
            "objective": n.objective,
            "assessment": n.assessment,
            "plan": n.plan,
            "created_at": n.created_at.strftime("%Y-%m-%d %H:%M") if n.created_at else None,
        }
        for n in notes
    ]


@router.post("/patients/{patient_id}/notes")
async def add_patient_clinical_note(
    patient_id: str,
    payload: ClinicalNoteCreate,
    doctor: DoctorProfile = Depends(get_current_doctor),
    db: AsyncSession = Depends(get_db),
):
    """Records a new clinical SOAP consultation note into patient's longitudinal record."""
    note = DoctorClinicalNote(
        patient_id=patient_id,
        doctor_id=doctor.id,
        note_type=payload.note_type,
        subjective=payload.subjective,
        objective=payload.objective,
        assessment=payload.assessment,
        plan=payload.plan,
    )
    db.add(note)
    await db.commit()
    return {"message": "Clinical note saved successfully", "id": note.id}


@router.get("/patients/{patient_id}/timeline")
async def get_patient_timeline_feed(
    patient_id: str,
    doctor: DoctorProfile = Depends(get_current_doctor),
    db: AsyncSession = Depends(get_db),
):
    """Returns a unified social-media-style chronological health feed for the patient.

    Combines daily check-in posts, patient voice notes, bleeding updates,
    anomaly alerts, lab panel milestones, and doctor SOAP notes.
    """
    # Verify authorization
    link_res = await db.execute(
        select(PatientDoctorAccess).where(
            PatientDoctorAccess.doctor_id == doctor.id,
            PatientDoctorAccess.patient_id == patient_id,
            PatientDoctorAccess.status == "active",
        )
    )
    if not link_res.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not authorized to access patient records.")

    events: List[Dict[str, Any]] = []

    # 1. Fetch Assessments & Responses with Patient Notes
    ass_res = await db.execute(
        select(Assessment)
        .where(Assessment.patient_id == patient_id)
        .order_by(Assessment.assessment_date.desc())
        .limit(60)
        .options(selectinload(Assessment.responses))
    )
    assessments = ass_res.scalars().all()

    symptom_labels = {
        "VM_HF": "Hot Flashes",
        "VM_NS": "Night Sweats",
        "SL_SQ": "Sleep Disruption",
        "PS_MD": "Mood Swings",
        "PS_AX": "Anxiety",
        "PH_FT": "Fatigue",
    }

    for a in assessments:
        symptoms = []
        user_notes = []
        for r in a.responses:
            lbl = symptom_labels.get(r.question_code, r.question_code)
            symptoms.append({
                "code": r.question_code,
                "label": lbl,
                "intensity": r.intensity,
            })
            if r.notes and r.notes.strip():
                user_notes.append(r.notes.strip())

        events.append({
            "id": f"checkin-{a.id}",
            "type": "checkin",
            "date": str(a.assessment_date),
            "timestamp": a.completed_at.isoformat() if a.completed_at else str(a.assessment_date),
            "title": f"Daily Symptom Check-In ({len(symptoms)} items tracked)",
            "symptoms": symptoms,
            "patient_notes": user_notes,
            "max_severity": max([s["intensity"] for s in symptoms], default=0),
        })

    # 2. Fetch Bleeding Records
    bleed_res = await db.execute(
        select(BleedingRecord)
        .where(BleedingRecord.patient_id == patient_id)
        .order_by(BleedingRecord.record_date.desc())
        .limit(40)
    )
    bleeding = bleed_res.scalars().all()
    for b in bleeding:
        if b.status != "none":
            events.append({
                "id": f"bleed-{b.id}",
                "type": "bleeding",
                "date": str(b.record_date),
                "timestamp": str(b.record_date),
                "title": f"Menstrual Flow Update: {b.status.capitalize()}",
                "status": b.status,
                "duration_days": b.duration_days,
                "has_clots": b.has_clots,
                "basal_body_temp": b.basal_body_temp,
                "pelvic_pain_intensity": b.pelvic_pain_intensity,
            })

    # 3. Fetch Anomaly Alerts
    alert_res = await db.execute(
        select(AnomalyAlert)
        .where(AnomalyAlert.patient_id == patient_id)
        .order_by(AnomalyAlert.created_at.desc())
    )
    alerts = alert_res.scalars().all()
    for al in alerts:
        events.append({
            "id": f"alert-{al.id}",
            "type": "alert",
            "date": al.created_at.strftime("%Y-%m-%d") if al.created_at else "",
            "timestamp": al.created_at.isoformat() if al.created_at else "",
            "title": f"Clinical Alert: {al.condition_name}",
            "severity_level": al.severity_level,
            "confidence_score": al.confidence_score,
            "description": al.description,
            "recommended_action": al.recommended_action,
        })

    # 4. Fetch Doctor SOAP Notes
    notes_res = await db.execute(
        select(DoctorClinicalNote)
        .where(DoctorClinicalNote.patient_id == patient_id)
        .order_by(DoctorClinicalNote.created_at.desc())
    )
    notes = notes_res.scalars().all()
    for n in notes:
        events.append({
            "id": f"note-{n.id}",
            "type": "doctor_note",
            "date": n.created_at.strftime("%Y-%m-%d") if n.created_at else "",
            "timestamp": n.created_at.isoformat() if n.created_at else "",
            "title": "Physician SOAP Consultation Record",
            "subjective": n.subjective,
            "objective": n.objective,
            "assessment": n.assessment,
            "plan": n.plan,
        })

    # 5. Fetch Lab Reports & Extracted Analytes
    labs_res = await db.execute(
        select(LabReport)
        .where(LabReport.patient_id == patient_id)
        .order_by(LabReport.created_at.desc())
        .options(selectinload(LabReport.analytes))
    )
    labs = labs_res.scalars().all()
    for lr in labs:
        analytes_summary = [
            {
                "name": a.analyte_name,
                "value": str(a.numeric_value) if a.numeric_value is not None else "",
                "unit": a.unit or "",
                "flag": a.flag or "normal",
            }
            for a in (lr.analytes or [])
        ]
        events.append({
            "id": f"lab-{lr.id}",
            "type": "lab",
            "date": lr.report_date.strftime("%Y-%m-%d") if lr.report_date else (lr.created_at.strftime("%Y-%m-%d") if lr.created_at else ""),
            "timestamp": lr.created_at.isoformat() if lr.created_at else "",
            "title": f"Laboratory Analyte Panel Verified: {lr.file_name}",
            "file_name": lr.file_name,
            "status": lr.status,
            "analytes": analytes_summary,
        })

    # Sort unified feed descending by date/timestamp
    events.sort(key=lambda x: x.get("timestamp", x.get("date", "")), reverse=True)

    return events


@router.get("/feed")
async def get_clinic_activity_ticker(
    doctor: DoctorProfile = Depends(get_current_doctor),
    db: AsyncSession = Depends(get_db),
):
    """Live clinic-wide activity ticker across all authorized patients."""
    links_res = await db.execute(
        select(PatientDoctorAccess)
        .where(PatientDoctorAccess.doctor_id == doctor.id, PatientDoctorAccess.status == "active")
        .options(selectinload(PatientDoctorAccess.patient).selectinload(PatientProfile.user))
    )
    links = links_res.scalars().all()
    patient_ids = [l.patient_id for l in links if l.patient]
    patient_map = {l.patient.id: l.patient.user.full_name for l in links if l.patient and l.patient.user}

    if not patient_ids:
        return []

    ticker: List[Dict[str, Any]] = []

    # Alerts across clinic
    alerts_res = await db.execute(
        select(AnomalyAlert)
        .where(AnomalyAlert.patient_id.in_(patient_ids))
        .order_by(AnomalyAlert.created_at.desc())
        .limit(10)
    )
    for a in alerts_res.scalars().all():
        ticker.append({
            "id": f"al-{a.id}",
            "patient_id": a.patient_id,
            "patient_name": patient_map.get(a.patient_id, "Patient"),
            "event_type": "alert",
            "severity": a.severity_level,
            "title": a.condition_name,
            "message": f"{a.confidence_score}% confidence: {a.description[:120]}...",
            "timestamp": a.created_at.strftime("%H:%M • %b %d") if a.created_at else "Today",
        })

    # Recent bleeding events
    bleed_res = await db.execute(
        select(BleedingRecord)
        .where(BleedingRecord.patient_id.in_(patient_ids), BleedingRecord.status != "none")
        .order_by(BleedingRecord.record_date.desc())
        .limit(10)
    )
    for b in bleed_res.scalars().all():
        ticker.append({
            "id": f"bl-{b.id}",
            "patient_id": b.patient_id,
            "patient_name": patient_map.get(b.patient_id, "Patient"),
            "event_type": "bleeding",
            "severity": "urgent" if b.status in ["heavy", "spotting"] else "info",
            "title": f"Menstrual Event: {b.status.capitalize()}",
            "message": f"Duration: {b.duration_days}d, Pain: {b.pelvic_pain_intensity}/4, Clots: {'Yes' if b.has_clots else 'No'}",
            "timestamp": str(b.record_date),
        })

    # Sort ticker
    ticker.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return ticker[:15]


class HrtAdvisorRequest(BaseModel):
    has_uterus: bool = True
    straw_stage: str = "early_transition"
    age: int = 49
    vasomotor_severity: int = 2
    has_breast_cancer_history: bool = False
    has_vte_risk: bool = False
    has_active_liver_disease: bool = False
    has_migraine_with_aura: bool = False
    has_unexplained_bleeding: bool = False


@router.post("/hrt-advisor")
async def evaluate_hrt_treatment(
    payload: HrtAdvisorRequest,
    current_doctor: DoctorProfile = Depends(get_current_doctor),
):
    """NAMS/BMS Evidence-Based Clinical Decision Support Protocol Evaluation."""
    from backend.app.clinical.guidelines import evaluate_hrt_eligibility
    return evaluate_hrt_eligibility(
        has_uterus=payload.has_uterus,
        straw_stage=payload.straw_stage,
        age=payload.age,
        vasomotor_severity=payload.vasomotor_severity,
        has_breast_cancer_history=payload.has_breast_cancer_history,
        has_vte_risk=payload.has_vte_risk,
        has_active_liver_disease=payload.has_active_liver_disease,
        has_migraine_with_aura=payload.has_migraine_with_aura,
        has_unexplained_bleeding=payload.has_unexplained_bleeding,
    )
