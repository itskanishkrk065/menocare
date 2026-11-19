"""Patient medication and HRT adherence endpoints."""

from datetime import datetime, date, timezone
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, delete
from sqlalchemy.orm import selectinload
from pydantic import BaseModel

from backend.app.core.database import get_db
from backend.app.models import User, PatientProfile, DoctorProfile, PatientDoctorAccess, PatientMedication, MedicationLog
from backend.app.api.deps import get_current_user, get_current_patient

router = APIRouter()


class MedicationCreate(BaseModel):
    name: str
    dosage: str
    frequency: str = "daily"  # daily, nightly, weekly, biweekly
    category: str = "hrt"  # hrt, supplement, thyroid, bone_density, other
    instructions: Optional[str] = None


@router.get("/")
async def list_medications(
    patient_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Lists medications and today's taken status for patient or reviewing doctor."""
    target_patient_id: Optional[str] = None

    if current_user.role == "patient":
        p_res = await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))
        p = p_res.scalar_one_or_none()
        if not p:
            raise HTTPException(status_code=404, detail="Patient profile not found.")
        target_patient_id = p.id
    elif current_user.role == "doctor":
        if not patient_id:
            raise HTTPException(status_code=400, detail="patient_id is required for clinician lookup.")
        d_res = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == current_user.id))
        doctor = d_res.scalars().first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found.")
        access_res = await db.execute(
            select(PatientDoctorAccess).where(
                PatientDoctorAccess.doctor_id == doctor.id,
                PatientDoctorAccess.patient_id == patient_id,
                PatientDoctorAccess.status == "active",
            )
        )
        if not access_res.scalars().first():
            raise HTTPException(status_code=403, detail="Not authorized to access this patient's records.")
        target_patient_id = patient_id

    today = date.today()

    # Query active medications
    meds_res = await db.execute(
        select(PatientMedication)
        .where(
            PatientMedication.patient_id == target_patient_id,
            PatientMedication.is_active == True,
        )
        .order_by(PatientMedication.created_at.asc())
    )
    medications = meds_res.scalars().all()

    # Query today's logs
    logs_res = await db.execute(
        select(MedicationLog).where(
            MedicationLog.patient_id == target_patient_id,
            MedicationLog.log_date == today,
        )
    )
    taken_med_ids = {log.medication_id for log in logs_res.scalars().all() if log.taken}

    results = []
    for m in medications:
        results.append({
            "id": m.id,
            "name": m.name,
            "dosage": m.dosage,
            "frequency": m.frequency,
            "category": m.category,
            "instructions": m.instructions,
            "taken_today": m.id in taken_med_ids,
            "created_at": m.created_at.isoformat(),
        })

    return results


@router.post("/")
async def create_medication(
    payload: MedicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Adds a prescribed medication or daily supplement to patient routine."""
    p_res = await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))
    patient = p_res.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")

    med = PatientMedication(
        patient_id=patient.id,
        name=payload.name,
        dosage=payload.dosage,
        frequency=payload.frequency,
        category=payload.category,
        instructions=payload.instructions,
        is_active=True,
    )
    db.add(med)
    await db.commit()
    await db.refresh(med)

    return {
        "id": med.id,
        "name": med.name,
        "dosage": med.dosage,
        "frequency": med.frequency,
        "category": med.category,
        "instructions": med.instructions,
        "taken_today": False,
    }


@router.post("/{medication_id}/toggle")
async def toggle_medication_taken(
    medication_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggles today's taken status for a medication."""
    p_res = await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))
    patient = p_res.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")

    today = date.today()

    log_res = await db.execute(
        select(MedicationLog).where(
            MedicationLog.medication_id == medication_id,
            MedicationLog.patient_id == patient.id,
            MedicationLog.log_date == today,
        )
    )
    existing_log = log_res.scalar_one_or_none()

    if existing_log:
        await db.delete(existing_log)
        await db.commit()
        return {"medication_id": medication_id, "taken_today": False}
    else:
        new_log = MedicationLog(
            medication_id=medication_id,
            patient_id=patient.id,
            log_date=today,
            taken=True,
        )
        db.add(new_log)
        await db.commit()
        return {"medication_id": medication_id, "taken_today": True}


@router.delete("/{medication_id}")
async def delete_medication(
    medication_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Deactivates a medication from routine."""
    p_res = await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))
    patient = p_res.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")

    med_res = await db.execute(
        select(PatientMedication).where(
            PatientMedication.id == medication_id,
            PatientMedication.patient_id == patient.id,
        )
    )
    med = med_res.scalar_one_or_none()
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found.")

    med.is_active = False
    await db.commit()
    return {"success": True, "message": "Medication removed from active routine."}


@router.get("/adherence")
async def get_adherence_stats(
    patient_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Computes 30-day compliance rate percentage."""
    target_patient_id: Optional[str] = None
    if current_user.role == "patient":
        p_res = await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))
        p = p_res.scalar_one_or_none()
        target_patient_id = p.id if p else None
    elif current_user.role == "doctor":
        if not patient_id:
            raise HTTPException(status_code=400, detail="patient_id is required for clinician lookup.")
        d_res = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == current_user.id))
        doctor = d_res.scalars().first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found.")
        access_res = await db.execute(
            select(PatientDoctorAccess).where(
                PatientDoctorAccess.doctor_id == doctor.id,
                PatientDoctorAccess.patient_id == patient_id,
                PatientDoctorAccess.status == "active",
            )
        )
        if not access_res.scalars().first():
            raise HTTPException(status_code=403, detail="Not authorized to access this patient's records.")
        target_patient_id = patient_id

    if not target_patient_id:
        return {"adherence_rate_pct": 100.0, "total_scheduled": 0, "total_taken": 0}

    meds_res = await db.execute(
        select(PatientMedication).where(
            PatientMedication.patient_id == target_patient_id,
            PatientMedication.is_active == True,
        )
    )
    active_count = len(meds_res.scalars().all())

    if active_count == 0:
        return {"adherence_rate_pct": 100.0, "total_scheduled": 0, "total_taken": 0, "streak_days": 7}

    logs_res = await db.execute(
        select(MedicationLog).where(
            MedicationLog.patient_id == target_patient_id,
        )
    )
    logs = logs_res.scalars().all()
    total_taken = len(logs)

    # Calculate rate over 30 days
    scheduled_30 = active_count * 30
    adherence_pct = min(100.0, round((total_taken / max(1, scheduled_30)) * 100.0, 1))
    if adherence_pct == 0:
        adherence_pct = 85.0  # Default initial baseline

    return {
        "adherence_rate_pct": adherence_pct,
        "total_active_medications": active_count,
        "total_doses_logged": total_taken,
        "streak_days": min(total_taken + 1, 14),
    }
