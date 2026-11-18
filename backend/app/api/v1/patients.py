"""Patient profile management and doctor pairing endpoints."""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.app.core.database import get_db
from backend.app.models import (
    User, PatientProfile, DoctorProfile, DoctorPracticeCode, PatientDoctorAccess, AuditLog
)
from backend.app.schemas import PatientProfileResponse, LinkDoctorRequest
from backend.app.api.deps import get_current_user, get_current_patient

router = APIRouter()


@router.get("/profile", response_model=PatientProfileResponse)
async def get_patient_profile(
    patient: PatientProfile = Depends(get_current_patient),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves patient profile with linked doctor information."""
    # Find active doctor link if any
    link_res = await db.execute(
        select(PatientDoctorAccess)
        .where(PatientDoctorAccess.patient_id == patient.id, PatientDoctorAccess.status == "active")
        .options(selectinload(PatientDoctorAccess.doctor).selectinload(DoctorProfile.user))
    )
    active_link = link_res.scalar_one_or_none()

    doctor_name = None
    doctor_id = None
    if active_link and active_link.doctor and active_link.doctor.user:
        doctor_name = active_link.doctor.user.full_name
        doctor_id = active_link.doctor_id

    return PatientProfileResponse(
        id=patient.id,
        user_id=patient.user_id,
        full_name=current_user.full_name,
        birth_year=patient.birth_year,
        straw_stage=patient.straw_stage,
        linked_doctor_name=doctor_name,
        linked_doctor_id=doctor_id,
        created_at=patient.created_at,
    )


@router.post("/link-doctor")
async def link_doctor_by_code(
    payload: LinkDoctorRequest,
    patient: PatientProfile = Depends(get_current_patient),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Pairs a patient with a doctor using the doctor's practice code (e.g. 'DR-SHARMA-91A')."""
    clean_code = payload.practice_code.strip().upper()

    # Search for active practice code
    code_res = await db.execute(
        select(DoctorPracticeCode)
        .where(DoctorPracticeCode.code == clean_code, DoctorPracticeCode.is_active == True)
        .options(selectinload(DoctorPracticeCode.doctor).selectinload(DoctorProfile.user))
    )
    practice_code_record = code_res.scalar_one_or_none()

    if not practice_code_record or not practice_code_record.doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or expired doctor practice code. Please confirm the code with your clinician.",
        )

    doctor = practice_code_record.doctor

    # Check if existing link exists
    existing_link_res = await db.execute(
        select(PatientDoctorAccess).where(
            PatientDoctorAccess.patient_id == patient.id,
            PatientDoctorAccess.doctor_id == doctor.id,
        )
    )
    existing_link = existing_link_res.scalar_one_or_none()

    if existing_link:
        existing_link.status = "active"
        existing_link.linked_via_code = clean_code
        existing_link.linked_at = datetime.now(timezone.utc)
    else:
        new_link = PatientDoctorAccess(
            patient_id=patient.id,
            doctor_id=doctor.id,
            linked_via_code=clean_code,
            status="active",
        )
        db.add(new_link)

    # Log audit entry
    audit = AuditLog(
        actor_id=current_user.id,
        patient_id=patient.id,
        action="LINK_DOCTOR",
        details=f"Linked patient to Dr. {doctor.user.full_name} via code {clean_code}",
    )
    db.add(audit)
    await db.commit()

    return {
        "success": True,
        "message": f"Successfully linked your care record with Dr. {doctor.user.full_name}.",
        "doctor_name": doctor.user.full_name,
        "clinic_name": doctor.clinic_name,
        "clinic_phone": doctor.clinic_phone,
    }


@router.delete("/unlink-doctor")
async def unlink_doctor(
    patient: PatientProfile = Depends(get_current_patient),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Revokes clinician access to patient record (DPDPA consent revocation)."""
    links_res = await db.execute(
        select(PatientDoctorAccess).where(
            PatientDoctorAccess.patient_id == patient.id,
            PatientDoctorAccess.status == "active",
        )
    )
    active_links = links_res.scalars().all()

    for link in active_links:
        link.status = "revoked"
        link.revoked_at = datetime.now(timezone.utc)

    audit = AuditLog(
        actor_id=current_user.id,
        patient_id=patient.id,
        action="REVOKE_DOCTOR_ACCESS",
        details="Patient revoked clinician access to longitudinal health records.",
    )
    db.add(audit)
    await db.commit()

    return {"success": True, "message": "Doctor access successfully revoked."}
