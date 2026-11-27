"""API endpoints for Adaptive Questionnaire Engine."""

from datetime import date
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.models import User, PatientProfile
from backend.app.api.deps import get_current_user, get_current_patient
from backend.app.services.adaptive_questionnaire import (
    AdaptiveQuestionnaireScheduler, CORE_QUESTIONS, ROTATING_QUESTION_BANK
)

router = APIRouter()


class DraftSaveRequest(BaseModel):
    answers: Dict[str, Any]


class SessionCompleteRequest(BaseModel):
    final_answers: Dict[str, Any]
    time_to_complete_seconds: int = Field(default=60, ge=10, le=3600)


@router.get("/questions/bank")
async def get_question_bank():
    """Returns the complete validated question bank with core and rotating tiers."""
    return {
        "core_count": len(CORE_QUESTIONS),
        "rotating_count": len(ROTATING_QUESTION_BANK),
        "core_questions": CORE_QUESTIONS,
        "rotating_questions": ROTATING_QUESTION_BANK,
    }


@router.get("/session/daily")
async def get_or_create_daily_session(
    target_date: Optional[date] = Query(None),
    patient: PatientProfile = Depends(get_current_patient),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves or initializes a daily adaptive assessment session."""
    assessment_date = target_date or date.today()
    session, questions = await AdaptiveQuestionnaireScheduler.get_or_create_daily_session(
        db, patient.id, assessment_date
    )

    return {
        "session_id": session.id,
        "assessment_date": str(session.assessment_date),
        "status": session.status,
        "core_count": len(session.core_question_codes),
        "rotating_count": len(session.rotating_question_codes),
        "adaptive_count": len(session.adaptive_question_codes),
        "questions": questions,
        "answers": session.answers or {},
        "is_completed": session.status == "completed",
    }


@router.post("/session/{session_id}/draft")
async def save_session_draft(
    session_id: str,
    draft_req: DraftSaveRequest,
    patient: PatientProfile = Depends(get_current_patient),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Saves partial answers and dynamically recalculates adaptive follow-up questions."""
    try:
        session, questions = await AdaptiveQuestionnaireScheduler.save_session_draft(
            db, session_id, patient.id, draft_req.answers
        )
        return {
            "success": True,
            "session_id": session.id,
            "status": session.status,
            "questions": questions,
            "answers": session.answers,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/session/{session_id}/complete")
async def complete_session(
    session_id: str,
    complete_req: SessionCompleteRequest,
    patient: PatientProfile = Depends(get_current_patient),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Validates required completion, updates rotation cycle coverage, and records assessment."""
    try:
        result = await AdaptiveQuestionnaireScheduler.complete_session(
            db,
            session_id=session_id,
            patient_id=patient.id,
            final_answers=complete_req.final_answers,
            time_to_complete_seconds=complete_req.time_to_complete_seconds,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))


@router.get("/rotation/status")
async def get_rotation_status(
    patient: PatientProfile = Depends(get_current_patient),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves patient rotation cycle progress and guaranteed coverage metrics."""
    tracker = await AdaptiveQuestionnaireScheduler.get_or_create_tracker(
        db, patient.id, date.today()
    )
    total_bank_size = len(ROTATING_QUESTION_BANK)
    completed_codes = tracker.completed_pool_history or []
    coverage_pct = round((len(completed_codes) / total_bank_size) * 100, 1)

    return {
        "cycle_number": tracker.cycle_number,
        "cycle_start_date": str(tracker.cycle_start_date),
        "total_bank_size": total_bank_size,
        "completed_count": len(completed_codes),
        "coverage_percentage": coverage_pct,
        "completed_codes": completed_codes,
        "unanswered_recovery_count": len(tracker.unanswered_recovery_pool or []),
    }
