"""API endpoints for Intelligent Symptom Classification & Patient Confirmation."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.core.database import get_db
from backend.app.models import User, PatientProfile, SymptomExtraction
from backend.app.api.deps import get_current_user, get_current_patient
from backend.app.services.symptom_classifier import (
    SymptomClassifierService, APPROVED_TAXONOMY
)

router = APIRouter()


class SymptomClassificationRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    input_method: str = Field("text", pattern="^(text|voice)$")
    reviewed_transcript: Optional[str] = None
    assessment_id: Optional[str] = None


class SymptomConfirmationRequest(BaseModel):
    confirmed_codes: List[str] = Field(default_factory=list)
    rejected_codes: List[str] = Field(default_factory=list)
    added_codes: List[str] = Field(default_factory=list)


@router.get("/taxonomy")
async def get_taxonomy():
    """Returns MenoCare's 30 approved symptom taxonomy categories."""
    categories = [
        {
            "code": code,
            "name": meta["name"],
            "domain": meta["domain"],
            "description": meta["description"],
        }
        for code, meta in APPROVED_TAXONOMY.items()
    ]
    return {
        "count": len(categories),
        "categories": categories,
    }


@router.post("/classify")
async def classify_symptoms(
    req: SymptomClassificationRequest,
    patient: PatientProfile = Depends(get_current_patient),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Processes free-text or speech transcript, extracts candidate symptoms, and records draft extraction."""
    extraction = await SymptomClassifierService.record_symptom_intake(
        db,
        patient_id=patient.id,
        input_text=req.text,
        input_method=req.input_method,
        reviewed_transcript=req.reviewed_transcript,
        assessment_id=req.assessment_id,
    )
    return {
        "extraction_id": extraction.id,
        "input_method": extraction.input_method,
        "raw_text": extraction.raw_input_text,
        "reviewed_transcript": extraction.reviewed_transcript,
        "candidates": extraction.extracted_candidates,
        "clarification_requested": extraction.clarification_requested,
        "clarification_prompt": extraction.clarification_prompt,
        "model_version": extraction.model_version,
    }


@router.post("/{extraction_id}/confirm")
async def confirm_symptoms(
    extraction_id: str,
    confirm_req: SymptomConfirmationRequest,
    patient: PatientProfile = Depends(get_current_patient),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Persists patient's explicit review and confirmation with full provenance."""
    try:
        updated = await SymptomClassifierService.confirm_patient_symptoms(
            db,
            extraction_id=extraction_id,
            patient_id=patient.id,
            confirmed_category_codes=confirm_req.confirmed_codes,
            rejected_category_codes=confirm_req.rejected_codes,
            added_category_codes=confirm_req.added_codes,
        )
        return {
            "success": True,
            "extraction_id": updated.id,
            "confirmed_categories": updated.confirmed_categories,
            "rejected_categories": updated.rejected_categories,
            "added_categories": updated.added_manually_categories,
            "confirmed_at": updated.confirmed_at.isoformat() if updated.confirmed_at else None,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/history")
async def get_patient_symptom_history(
    patient: PatientProfile = Depends(get_current_patient),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves patient's confirmed symptom intake history."""
    res = await db.execute(
        select(SymptomExtraction)
        .where(SymptomExtraction.patient_id == patient.id)
        .order_by(SymptomExtraction.created_at.desc())
    )
    extractions = res.scalars().all()
    return [
        {
            "id": e.id,
            "input_method": e.input_method,
            "raw_text": e.raw_input_text,
            "confirmed_categories": e.confirmed_categories,
            "created_at": e.created_at.isoformat() if e.created_at else None,
        }
        for e in extractions
    ]
