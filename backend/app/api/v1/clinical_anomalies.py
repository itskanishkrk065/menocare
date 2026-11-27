"""API endpoints for Clinical Trend Anomaly Detection."""

from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.core.database import get_db
from backend.app.models import User, PatientProfile, DoctorProfile, ClinicalTrendAnomaly
from backend.app.api.deps import get_current_user, get_current_doctor
from backend.app.services.anomaly_detection_service import AnomalyDetectionService

router = APIRouter()


class AnomalyFeedbackRequest(BaseModel):
    clinician_feedback: Optional[str] = None


@router.get("/patient/{patient_id}")
async def list_patient_anomalies(
    patient_id: str,
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves longitudinal trend anomalies for a given patient."""
    query = select(ClinicalTrendAnomaly).where(ClinicalTrendAnomaly.patient_id == patient_id)
    if status_filter:
        query = query.where(ClinicalTrendAnomaly.status == status_filter)
    query = query.order_by(ClinicalTrendAnomaly.detection_date.desc())

    res = await db.execute(query)
    anomalies = res.scalars().all()

    return [
        {
            "id": a.id,
            "patient_id": a.patient_id,
            "observation_type": a.observation_type,
            "detection_date": a.detection_date.isoformat(),
            "comparison_period_days": a.comparison_period_days,
            "historical_baseline": a.historical_baseline,
            "current_observation": a.current_observation,
            "reason_for_flagging": a.reason_for_flagging,
            "relevant_source_records": a.relevant_source_records,
            "status": a.status,
            "clinician_feedback": a.clinician_feedback,
            "detection_method_version": a.detection_method_version,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in anomalies
    ]


@router.post("/scan/{patient_id}")
async def trigger_anomaly_scan(
    patient_id: str,
    doctor: DoctorProfile = Depends(get_current_doctor),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Triggers an on-demand statistical anomaly scan for a patient."""
    persisted = await AnomalyDetectionService.scan_and_persist_anomalies(
        db,
        patient_id=patient_id,
        detection_date=date.today(),
        doctor_id=doctor.id,
    )
    return {
        "success": True,
        "scanned_patient_id": patient_id,
        "new_anomalies_detected": len(persisted),
    }


@router.post("/{anomaly_id}/acknowledge")
async def acknowledge_anomaly(
    anomaly_id: str,
    feedback: Optional[AnomalyFeedbackRequest] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Marks an anomaly as acknowledged by clinician with optional clinical notes."""
    res = await db.execute(select(ClinicalTrendAnomaly).where(ClinicalTrendAnomaly.id == anomaly_id))
    anomaly = res.scalar_one_or_none()
    if not anomaly:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Anomaly not found.")

    anomaly.status = "acknowledged"
    if feedback and feedback.clinician_feedback:
        anomaly.clinician_feedback = feedback.clinician_feedback

    await db.commit()
    return {"success": True, "anomaly_id": anomaly.id, "status": anomaly.status}


@router.post("/{anomaly_id}/dismiss")
async def dismiss_anomaly(
    anomaly_id: str,
    feedback: Optional[AnomalyFeedbackRequest] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Marks an anomaly as dismissed by clinician with reason."""
    res = await db.execute(select(ClinicalTrendAnomaly).where(ClinicalTrendAnomaly.id == anomaly_id))
    anomaly = res.scalar_one_or_none()
    if not anomaly:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Anomaly not found.")

    anomaly.status = "dismissed"
    if feedback and feedback.clinician_feedback:
        anomaly.clinician_feedback = feedback.clinician_feedback

    await db.commit()
    return {"success": True, "anomaly_id": anomaly.id, "status": anomaly.status}
