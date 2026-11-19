"""Direct clinical messaging between patients and attending physicians."""

from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from pydantic import BaseModel

from backend.app.core.database import get_db
from backend.app.models import User, PatientProfile, DoctorProfile, PatientDoctorAccess, PatientDoctorMessage
from backend.app.api.deps import get_current_user

router = APIRouter()


class MessageCreate(BaseModel):
    message_text: str
    patient_id: Optional[str] = None  # Required if sender is doctor


@router.get("/")
async def get_messages(
    patient_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves conversation thread between patient and attending doctor."""
    target_patient_id: Optional[str] = None
    target_doctor_id: Optional[str] = None

    if current_user.role == "patient":
        p_res = await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))
        patient = p_res.scalar_one_or_none()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found.")
        target_patient_id = patient.id

        # Find linked doctor
        link_res = await db.execute(
            select(PatientDoctorAccess).where(
                PatientDoctorAccess.patient_id == patient.id,
                PatientDoctorAccess.status == "active",
            )
        )
        link = link_res.scalars().first()
        if not link:
            return []
        target_doctor_id = link.doctor_id

    elif current_user.role == "doctor":
        d_res = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == current_user.id))
        doctor = d_res.scalar_one_or_none()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found.")
        target_doctor_id = doctor.id
        target_patient_id = patient_id

    if not target_patient_id or not target_doctor_id:
        return []

    msgs_res = await db.execute(
        select(PatientDoctorMessage)
        .where(
            PatientDoctorMessage.patient_id == target_patient_id,
            PatientDoctorMessage.doctor_id == target_doctor_id,
        )
        .order_by(PatientDoctorMessage.created_at.asc())
    )
    messages = msgs_res.scalars().all()

    return [
        {
            "id": m.id,
            "sender_role": m.sender_role,
            "message_text": m.message_text,
            "is_read": m.is_read,
            "created_at": m.created_at.isoformat(),
        }
        for m in messages
    ]


@router.post("/")
async def send_message(
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Sends a clinical message in the patient-doctor conversation thread."""
    if not payload.message_text.strip():
        raise HTTPException(status_code=400, detail="Message text cannot be empty.")

    target_patient_id: Optional[str] = None
    target_doctor_id: Optional[str] = None
    sender_role = current_user.role

    if current_user.role == "patient":
        p_res = await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))
        patient = p_res.scalar_one_or_none()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found.")
        target_patient_id = patient.id

        link_res = await db.execute(
            select(PatientDoctorAccess).where(
                PatientDoctorAccess.patient_id == patient.id,
                PatientDoctorAccess.status == "active",
            )
        )
        link = link_res.scalars().first()
        if not link:
            raise HTTPException(
                status_code=400,
                detail="You must pair with your doctor via their practice code before sending messages.",
            )
        target_doctor_id = link.doctor_id

    elif current_user.role == "doctor":
        d_res = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == current_user.id))
        doctor = d_res.scalar_one_or_none()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found.")
        target_doctor_id = doctor.id
        if not payload.patient_id:
            raise HTTPException(status_code=400, detail="patient_id is required when physician sends message.")
        target_patient_id = payload.patient_id

    msg = PatientDoctorMessage(
        patient_id=target_patient_id,
        doctor_id=target_doctor_id,
        sender_role=sender_role,
        message_text=payload.message_text.strip(),
        is_read=False,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    return {
        "id": msg.id,
        "sender_role": msg.sender_role,
        "message_text": msg.message_text,
        "is_read": msg.is_read,
        "created_at": msg.created_at.isoformat(),
    }
