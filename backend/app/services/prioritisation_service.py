"""Doctor-facing Patient Follow-up Prioritisation Engine.

Ranks patients requiring clinical or administrative follow-up using transparent,
evidence-linked rules, deduplicates tasks, tracks review states, and supports
clinician tier overrides with full audit traceability.
"""

from datetime import date, datetime, timedelta, timezone
from typing import Dict, List, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from backend.app.models import (
    DoctorPrioritisationTask, PatientDoctorAccess, PatientProfile, User,
    AnomalyAlert, ClinicalTrendAnomaly, Assessment, Response, BleedingRecord,
    DoctorClinicalNote, AppointmentRequest
)


class PatientPrioritisationService:
    """Triage and follow-up prioritisation engine with transparent criteria."""

    TIER_URGENT: str = "urgent_clinical"
    TIER_ATTENTION: str = "clinical_attention"
    TIER_ADMIN: str = "administrative_followup"
    TIER_ROUTINE: str = "routine"

    @classmethod
    async def evaluate_patient_priority(
        cls,
        db: AsyncSession,
        patient_id: str,
        doctor_id: str,
    ) -> Dict[str, Any]:
        """Evaluates patient records against transparent rules and returns score, tier, and linked reasons."""
        reasons: List[Dict[str, Any]] = []
        score: float = 0.0

        today = date.today()

        # -------------------------------------------------------------------
        # 1. Acute Clinical Red Flags (Emergency / Urgent Safety)
        # -------------------------------------------------------------------
        alert_res = await db.execute(
            select(AnomalyAlert).where(
                AnomalyAlert.patient_id == patient_id,
                AnomalyAlert.is_acknowledged_by_doctor == False,
            )
        )
        unacked_alerts = alert_res.scalars().all()

        has_emergency_red_flag = False
        for alert in unacked_alerts:
            if alert.severity_level in ["emergency", "urgent"] or alert.trigger_type == "red_flag":
                has_emergency_red_flag = True
                reasons.append({
                    "category": "red_flag",
                    "reason_text": f"Unreviewed clinical red flag: {alert.condition_name} ({alert.severity_level.upper()})",
                    "source_record_type": "anomaly_alert",
                    "source_record_id": alert.id,
                    "timestamp": alert.created_at.isoformat() if alert.created_at else None,
                })

        if has_emergency_red_flag:
            score += 90.0

        # -------------------------------------------------------------------
        # 2. Unreviewed Clinical Trend Anomalies
        # -------------------------------------------------------------------
        anomaly_res = await db.execute(
            select(ClinicalTrendAnomaly).where(
                ClinicalTrendAnomaly.patient_id == patient_id,
                ClinicalTrendAnomaly.status == "unreviewed",
            )
        )
        unacked_anomalies = anomaly_res.scalars().all()

        for a in unacked_anomalies:
            is_persistent = a.current_observation.get("is_persistent", False) if a.current_observation else False
            score += 35.0 if is_persistent else 20.0
            reasons.append({
                "category": "trend_anomaly",
                "reason_text": f"{'Persistent' if is_persistent else 'Acute'} anomaly: {a.reason_for_flagging}",
                "source_record_type": "clinical_trend_anomaly",
                "source_record_id": a.id,
                "timestamp": a.detection_date.isoformat(),
            })

        # -------------------------------------------------------------------
        # 3. Newly Reported Severe Symptoms (Intensity 4 in last 3 days)
        # -------------------------------------------------------------------
        three_days_ago = today - timedelta(days=3)
        recent_resp_res = await db.execute(
            select(Response, Assessment.assessment_date, Assessment.id)
            .join(Assessment, Response.assessment_id == Assessment.id)
            .where(
                Assessment.patient_id == patient_id,
                Assessment.assessment_date >= three_days_ago,
                Response.intensity == 4,
            )
        )
        severe_resps = recent_resp_res.all()

        if severe_resps:
            score += 25.0
            for r in severe_resps[:2]:  # limit to top 2 reasons to avoid bloating
                reasons.append({
                    "category": "severe_symptom",
                    "reason_text": f"Maximum severity (4/4) reported for {r.Response.question_code} on {r.assessment_date}",
                    "source_record_type": "response",
                    "source_record_id": r.Response.id,
                    "timestamp": r.assessment_date.isoformat(),
                })

        # -------------------------------------------------------------------
        # 4. Tracking Gaps / Inactivity (>7 days without assessment)
        # -------------------------------------------------------------------
        latest_assessment_res = await db.execute(
            select(Assessment)
            .where(Assessment.patient_id == patient_id)
            .order_by(Assessment.assessment_date.desc())
        )
        latest_assessment = latest_assessment_res.scalars().first()

        if latest_assessment:
            days_since_checkin = (today - latest_assessment.assessment_date).days
            if days_since_checkin >= 7:
                score += 15.0
                reasons.append({
                    "category": "tracking_gap",
                    "reason_text": f"Digital tracking gap: {days_since_checkin} days inactive since {latest_assessment.assessment_date}",
                    "source_record_type": "assessment",
                    "source_record_id": latest_assessment.id,
                    "timestamp": latest_assessment.assessment_date.isoformat(),
                })
        else:
            # Enrolled patient with no check-ins at all
            score += 10.0
            reasons.append({
                "category": "tracking_gap",
                "reason_text": "Newly linked patient has not recorded initial check-in",
                "source_record_type": "patient_profile",
                "source_record_id": patient_id,
                "timestamp": today.isoformat(),
            })

        # -------------------------------------------------------------------
        # 5. Overdue Follow-up (>30 days without clinical note)
        # -------------------------------------------------------------------
        latest_note_res = await db.execute(
            select(DoctorClinicalNote)
            .where(
                DoctorClinicalNote.patient_id == patient_id,
                DoctorClinicalNote.doctor_id == doctor_id,
            )
            .order_by(DoctorClinicalNote.created_at.desc())
        )
        latest_note = latest_note_res.scalars().first()

        if latest_note and latest_note.created_at:
            note_date = latest_note.created_at.date() if hasattr(latest_note.created_at, "date") else today
            days_since_note = (today - note_date).days
            if days_since_note >= 30:
                score += 10.0
                reasons.append({
                    "category": "overdue_review",
                    "reason_text": f"Routine review due: {days_since_note} days since last clinical note",
                    "source_record_type": "doctor_clinical_note",
                    "source_record_id": latest_note.id,
                    "timestamp": latest_note.created_at.isoformat(),
                })

        # Determine tier from composite score and clinical categories
        clamped_score = min(100.0, score)

        if has_emergency_red_flag or clamped_score >= 80.0:
            tier = cls.TIER_URGENT
        elif clamped_score >= 50.0:
            tier = cls.TIER_ATTENTION
        elif clamped_score >= 20.0:
            tier = cls.TIER_ADMIN
        else:
            tier = cls.TIER_ROUTINE

        return {
            "score": round(clamped_score, 1),
            "tier": tier,
            "reasons": reasons,
        }

    @classmethod
    async def refresh_doctor_triage_queue(
        cls,
        db: AsyncSession,
        doctor_id: str,
    ) -> List[DoctorPrioritisationTask]:
        """Refreshes or creates priority queue tasks for all active patients linked to doctor."""
        links_res = await db.execute(
            select(PatientDoctorAccess).where(
                PatientDoctorAccess.doctor_id == doctor_id,
                PatientDoctorAccess.status == "active",
            )
        )
        links = links_res.scalars().all()

        tasks: List[DoctorPrioritisationTask] = []

        for link in links:
            patient_id = link.patient_id
            eval_result = await cls.evaluate_patient_priority(db, patient_id, doctor_id)

            # Check if task already exists
            existing_task_res = await db.execute(
                select(DoctorPrioritisationTask).where(
                    DoctorPrioritisationTask.doctor_id == doctor_id,
                    DoctorPrioritisationTask.patient_id == patient_id,
                )
            )
            task = existing_task_res.scalar_one_or_none()

            effective_tier = eval_result["tier"]
            if task and task.override_tier:
                effective_tier = task.override_tier

            if not task:
                task = DoctorPrioritisationTask(
                    doctor_id=doctor_id,
                    patient_id=patient_id,
                    priority_tier=effective_tier,
                    priority_score=eval_result["score"],
                    reasons=eval_result["reasons"],
                    status="pending",
                )
                db.add(task)
            else:
                # Update existing task with fresh evaluation data
                task.priority_tier = effective_tier
                task.priority_score = eval_result["score"]
                task.reasons = eval_result["reasons"]
                task.updated_at = datetime.now(timezone.utc)

            tasks.append(task)

        await db.commit()
        # Sort queue: highest priority score first
        tasks.sort(key=lambda t: t.priority_score, reverse=True)
        return tasks

    @classmethod
    async def override_patient_priority(
        cls,
        db: AsyncSession,
        task_id: str,
        doctor_id: str,
        override_tier: str,
        override_notes: str,
    ) -> DoctorPrioritisationTask:
        """Allows clinician to override triage tier with justification."""
        res = await db.execute(
            select(DoctorPrioritisationTask).where(
                DoctorPrioritisationTask.id == task_id,
                DoctorPrioritisationTask.doctor_id == doctor_id,
            )
        )
        task = res.scalar_one_or_none()
        if not task:
            raise ValueError(f"Prioritisation task {task_id} not found.")

        task.override_tier = override_tier
        task.priority_tier = override_tier
        task.override_notes = override_notes
        task.updated_at = datetime.now(timezone.utc)

        await db.commit()
        return task
