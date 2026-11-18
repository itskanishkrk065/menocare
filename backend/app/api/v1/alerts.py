"""Anomaly alert management and appointment booking endpoints."""

from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.app.core.database import get_db
from backend.app.models import (
    User, PatientProfile, DoctorProfile, AnomalyAlert, AppointmentRequest, PatientDoctorAccess
)
from backend.app.schemas import (
    AnomalyAlertResponse, AppointmentRequestCreate, AppointmentRequestResponse
)
from backend.app.api.deps import get_current_user

router = APIRouter()


@router.get("/", response_model=List[AnomalyAlertResponse])
async def list_alerts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves anomaly and red-flag alerts for the current patient or doctor."""
    if current_user.role == "patient":
        p_res = await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))
        patient = p_res.scalar_one_or_none()
        if not patient:
            return []

        res = await db.execute(
            select(AnomalyAlert)
            .where(AnomalyAlert.patient_id == patient.id)
            .order_by(AnomalyAlert.created_at.desc())
        )
        return res.scalars().all()

    elif current_user.role == "doctor":
        d_res = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == current_user.id))
        doctor = d_res.scalar_one_or_none()
        if not doctor:
            return []

        res = await db.execute(
            select(AnomalyAlert)
            .where(AnomalyAlert.doctor_id == doctor.id)
            .order_by(AnomalyAlert.created_at.desc())
        )
        return res.scalars().all()

    return []


@router.post("/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Marks an anomaly alert as acknowledged by the patient or doctor."""
    res = await db.execute(select(AnomalyAlert).where(AnomalyAlert.id == alert_id))
    alert = res.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found.")

    if current_user.role == "patient":
        alert.is_acknowledged_by_patient = True
    elif current_user.role == "doctor":
        alert.is_acknowledged_by_doctor = True

    await db.commit()
    return {"success": True, "message": "Alert marked as acknowledged."}


@router.post("/appointments", response_model=AppointmentRequestResponse)
async def request_appointment(
    payload: AppointmentRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Allows patient to request a clinical appointment based on an anomaly alert or check-in."""
    if current_user.role != "patient":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only patients can request appointments.")

    p_res = await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))
    patient = p_res.scalar_one()

    # Find linked doctor
    link_res = await db.execute(
        select(PatientDoctorAccess).where(
            PatientDoctorAccess.patient_id == patient.id,
            PatientDoctorAccess.status == "active",
        )
    )
    link = link_res.scalar_one_or_none()
    if not link:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must be linked to a doctor via their practice code before booking an appointment.",
        )

    appt = AppointmentRequest(
        patient_id=patient.id,
        doctor_id=link.doctor_id,
        alert_id=payload.alert_id,
        requested_date=payload.requested_date,
        reason=payload.reason,
        status="pending",
    )
    db.add(appt)
    await db.commit()

    return AppointmentRequestResponse(
        id=appt.id,
        patient_id=patient.id,
        patient_name=current_user.full_name,
        doctor_id=link.doctor_id,
        requested_date=appt.requested_date,
        reason=appt.reason,
        status=appt.status,
        created_at=appt.created_at,
    )


@router.get("/appointments")
async def list_appointments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Lists appointments for either the patient or the attending doctor."""
    if current_user.role == "patient":
        p_res = await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))
        patient = p_res.scalar_one_or_none()
        if not patient:
            return []

        res = await db.execute(
            select(AppointmentRequest)
            .where(AppointmentRequest.patient_id == patient.id)
            .order_by(AppointmentRequest.created_at.desc())
        )
        appts = res.scalars().all()
        return [
            {
                "id": a.id,
                "requested_date": a.requested_date,
                "reason": a.reason,
                "status": a.status,
                "created_at": a.created_at,
            }
            for a in appts
        ]

    elif current_user.role == "doctor":
        d_res = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == current_user.id))
        doctor = d_res.scalar_one_or_none()
        if not doctor:
            return []

        res = await db.execute(
            select(AppointmentRequest)
            .where(AppointmentRequest.doctor_id == doctor.id)
            .order_by(AppointmentRequest.created_at.desc())
            .options(selectinload(AppointmentRequest.patient).selectinload(PatientProfile.user))
        )
        appts = res.scalars().all()
        return [
            {
                "id": a.id,
                "patient_id": a.patient_id,
                "patient_name": a.patient.user.full_name if a.patient and a.patient.user else "Patient",
                "requested_date": a.requested_date,
                "reason": a.reason,
                "status": a.status,
                "created_at": a.created_at,
            }
            for a in appts
        ]

    return []
