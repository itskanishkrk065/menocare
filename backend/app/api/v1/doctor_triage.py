"""API endpoints for Doctor Follow-up Prioritisation & Triage Queue."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.app.core.database import get_db
from backend.app.models import User, DoctorProfile, DoctorPrioritisationTask, PatientProfile
from backend.app.api.deps import get_current_user, get_current_doctor
from backend.app.services.prioritisation_service import PatientPrioritisationService

router = APIRouter()


class PriorityOverrideRequest(BaseModel):
    override_tier: str = Field(..., pattern="^(urgent_clinical|clinical_attention|administrative_followup|routine)$")
    override_notes: str = Field(..., min_length=3, max_length=1000)


class StatusUpdateRequest(BaseModel):
    status: str = Field(..., pattern="^(pending|reviewed|acknowledged|resolved)$")


@router.get("/queue")
async def get_triage_queue(
    tier_filter: Optional[str] = Query(None),
    doctor: DoctorProfile = Depends(get_current_doctor),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves ranked doctor triage queue with linked patient info, transparent scores, and evidence."""
    tasks = await PatientPrioritisationService.refresh_doctor_triage_queue(db, doctor.id)

    # Fetch patient profiles for returned tasks
    patient_ids = [t.patient_id for t in tasks]
    patients_map = {}
    if patient_ids:
        p_res = await db.execute(
            select(PatientProfile)
            .where(PatientProfile.id.in_(patient_ids))
            .options(selectinload(PatientProfile.user))
        )
        for p in p_res.scalars().all():
            patients_map[p.id] = p

    results = []
    for t in tasks:
        if tier_filter and t.priority_tier != tier_filter:
            continue
        p = patients_map.get(t.patient_id)
        results.append({
            "task_id": t.id,
            "patient_id": t.patient_id,
            "patient_name": p.user.full_name if p and p.user else "Patient",
            "patient_age": (2026 - p.birth_year) if p and p.birth_year else 48,
            "straw_stage": p.straw_stage if p else "unknown",
            "priority_tier": t.priority_tier,
            "priority_score": t.priority_score,
            "status": t.status,
            "override_tier": t.override_tier,
            "override_notes": t.override_notes,
            "reasons": t.reasons,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "updated_at": t.updated_at.isoformat() if t.updated_at else None,
        })

    return results


@router.post("/task/{task_id}/override")
async def override_task_priority(
    task_id: str,
    override_req: PriorityOverrideRequest,
    doctor: DoctorProfile = Depends(get_current_doctor),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Allows clinician to override triage tier with justification."""
    try:
        updated = await PatientPrioritisationService.override_patient_priority(
            db,
            task_id=task_id,
            doctor_id=doctor.id,
            override_tier=override_req.override_tier,
            override_notes=override_req.override_notes,
        )
        return {
            "success": True,
            "task_id": updated.id,
            "new_priority_tier": updated.priority_tier,
            "override_tier": updated.override_tier,
            "override_notes": updated.override_notes,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/task/{task_id}/status")
async def update_task_status(
    task_id: str,
    status_req: StatusUpdateRequest,
    doctor: DoctorProfile = Depends(get_current_doctor),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Updates the status of a prioritisation task (e.g. reviewed, acknowledged, resolved)."""
    res = await db.execute(
        select(DoctorPrioritisationTask).where(
            DoctorPrioritisationTask.id == task_id,
            DoctorPrioritisationTask.doctor_id == doctor.id,
        )
    )
    task = res.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Triage task not found.")

    task.status = status_req.status
    await db.commit()
    return {"success": True, "task_id": task.id, "status": task.status}
