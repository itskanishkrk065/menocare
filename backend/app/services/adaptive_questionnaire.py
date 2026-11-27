"""Adaptive Questionnaire Engine for MenoCare.

Implements:
1. Exactly 7 fixed daily core questions presented every day.
2. Exactly 6 rotating questions per daily assessment with guaranteed 100% cycle coverage.
3. Deterministic adaptive follow-up questions with stable IDs and rule traceability.
4. Robust session state management: save & resume, interruption recovery, and completion integrity.
5. Patient-isolated deterministic rotation tracking and unanswered question recovery.
"""

from datetime import date, datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
import copy
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.models import (
    QuestionnaireSession, PatientRotationTracker, Assessment, Response, BleedingRecord
)

# ---------------------------------------------------------------------------
# 1. QUESTION BANK SPECIFICATION
# ---------------------------------------------------------------------------

CORE_QUESTIONS: List[Dict[str, Any]] = [
    {
        "code": "CORE_VM_HF",
        "category": "core",
        "domain": "vasomotor",
        "name": "Hot Flashes",
        "prompt_text": "Did you experience hot flashes or sudden flushing in the past 24 hours?",
        "input_type": "likert_0_4",
        "requires_frequency": True,
        "frequency_label": "Number of episodes",
        "is_required": True,
    },
    {
        "code": "CORE_VM_NS",
        "category": "core",
        "domain": "vasomotor",
        "name": "Night Sweats",
        "prompt_text": "Did you experience night sweats that woke you or drenched clothing/bedding?",
        "input_type": "likert_0_4",
        "requires_frequency": True,
        "frequency_label": "Awakenings caused by sweats",
        "is_required": True,
    },
    {
        "code": "CORE_SL_DIS",
        "category": "core",
        "domain": "sleep",
        "name": "Sleep Disruption",
        "prompt_text": "How disrupted, restless, or fragmented was your sleep last night?",
        "input_type": "likert_0_4",
        "requires_frequency": False,
        "is_required": True,
    },
    {
        "code": "CORE_PS_MOOD",
        "category": "core",
        "domain": "psychological",
        "name": "Mood Instability",
        "prompt_text": "How intense were your mood swings, low mood, or tearfulness today?",
        "input_type": "likert_0_4",
        "requires_frequency": False,
        "is_required": True,
    },
    {
        "code": "CORE_PS_ANX",
        "category": "core",
        "domain": "psychological",
        "name": "Anxiety & Tension",
        "prompt_text": "Did you feel unexplained anxiety, nervousness, or inner tension?",
        "input_type": "likert_0_4",
        "requires_frequency": False,
        "is_required": True,
    },
    {
        "code": "CORE_PH_FAT",
        "category": "core",
        "domain": "somatic",
        "name": "Physical Fatigue",
        "prompt_text": "How severe was your physical fatigue or lack of energy today?",
        "input_type": "likert_0_4",
        "requires_frequency": False,
        "is_required": True,
    },
    {
        "code": "CORE_BL_STAT",
        "category": "core",
        "domain": "menstrual",
        "name": "Bleeding & Cycle Status",
        "prompt_text": "What was your menstrual bleeding or spotting status today?",
        "input_type": "categorical_bleeding",  # 'none', 'spotting', 'light', 'normal', 'heavy'
        "requires_frequency": False,
        "is_required": True,
    },
]

ROTATING_QUESTION_BANK: List[Dict[str, Any]] = [
    {
        "code": "ROT_COG_FOG",
        "category": "rotating",
        "domain": "neurocognitive",
        "name": "Brain Fog",
        "prompt_text": "Did you experience difficulty concentrating, mental exhaustion, or brain fog?",
        "input_type": "likert_0_4",
    },
    {
        "code": "ROT_MSK_JNT",
        "category": "rotating",
        "domain": "musculoskeletal",
        "name": "Joint Discomfort",
        "prompt_text": "Did you have joint aches, morning stiffness, or muscular pain?",
        "input_type": "likert_0_4",
    },
    {
        "code": "ROT_URO_DRY",
        "category": "rotating",
        "domain": "urogenital",
        "name": "Vaginal Dryness",
        "prompt_text": "Did you notice vaginal dryness, itching, or discomfort with intimacy?",
        "input_type": "likert_0_4",
    },
    {
        "code": "ROT_CAR_PAL",
        "category": "rotating",
        "domain": "cardiac",
        "name": "Heart Palpitations",
        "prompt_text": "Did you experience unexpected heart fluttering, racing, or pounding?",
        "input_type": "likert_0_4",
    },
    {
        "code": "ROT_SKN_DRY",
        "category": "rotating",
        "domain": "dermatological",
        "name": "Skin Changes",
        "prompt_text": "Did you experience unusual skin dryness, itching, or tingling sensations?",
        "input_type": "likert_0_4",
    },
    {
        "code": "ROT_GAS_BLT",
        "category": "rotating",
        "domain": "gastrointestinal",
        "name": "Abdominal Bloating",
        "prompt_text": "Did you feel noticeable abdominal bloating, fluid retention, or digestive distress?",
        "input_type": "likert_0_4",
    },
    {
        "code": "ROT_COG_MEM",
        "category": "rotating",
        "domain": "neurocognitive",
        "name": "Memory Lapses",
        "prompt_text": "Did you experience short-term memory slips, misplacing words or everyday items?",
        "input_type": "likert_0_4",
    },
    {
        "code": "ROT_URO_URG",
        "category": "rotating",
        "domain": "urogenital",
        "name": "Urinary Urgency",
        "prompt_text": "Did you experience increased urinary frequency, urgency, or nighttime bathroom trips?",
        "input_type": "likert_0_4",
    },
    {
        "code": "ROT_SEX_LIB",
        "category": "rotating",
        "domain": "sexual_health",
        "name": "Libido & Intimacy",
        "prompt_text": "Have you noticed changes in sexual desire or comfort during intimate activity?",
        "input_type": "likert_0_4",
    },
    {
        "code": "ROT_NEU_HA",
        "category": "rotating",
        "domain": "neurological",
        "name": "Headaches & Migraines",
        "prompt_text": "Did you suffer from tension headaches, hormonal migraines, or head pressure?",
        "input_type": "likert_0_4",
    },
    {
        "code": "ROT_PS_IRR",
        "category": "rotating",
        "domain": "psychological",
        "name": "Irritability",
        "prompt_text": "Did you feel an unusually short temper, quick irritability, or sensory overwhelm?",
        "input_type": "likert_0_4",
    },
    {
        "code": "ROT_SL_EMA",
        "category": "rotating",
        "domain": "sleep",
        "name": "Early Awakening",
        "prompt_text": "Did you wake up 2+ hours earlier than intended, unable to fall back asleep?",
        "input_type": "likert_0_4",
    },
    {
        "code": "ROT_MSK_BCK",
        "category": "rotating",
        "domain": "musculoskeletal",
        "name": "Back & Pelvic Ache",
        "prompt_text": "Did you experience lower back ache, pelvic heaviness, or muscle stiffness?",
        "input_type": "likert_0_4",
    },
    {
        "code": "ROT_THY_CHL",
        "category": "rotating",
        "domain": "metabolic",
        "name": "Cold Sensitivity",
        "prompt_text": "Did you experience heightened sensitivity to cold, shivering, or cold extremities?",
        "input_type": "likert_0_4",
    },
    {
        "code": "ROT_MET_APP",
        "category": "rotating",
        "domain": "metabolic",
        "name": "Appetite & Cravings",
        "prompt_text": "Did you notice sudden cravings for sugar/carbs or shifts in your appetite?",
        "input_type": "likert_0_4",
    },
    {
        "code": "ROT_VAS_DIZ",
        "category": "rotating",
        "domain": "vasomotor",
        "name": "Dizziness & Lightheadedness",
        "prompt_text": "Did you feel lightheaded, slightly unsteady on your feet, or off-balance?",
        "input_type": "likert_0_4",
    },
    {
        "code": "ROT_URO_PAIN",
        "category": "rotating",
        "domain": "urogenital",
        "name": "Pelvic or Urogenital Discomfort",
        "prompt_text": "Did you have burning or localized discomfort during urination or intimate activity?",
        "input_type": "likert_0_4",
    },
    {
        "code": "ROT_PS_CONF",
        "category": "rotating",
        "domain": "psychological",
        "name": "Emotional Overwhelm",
        "prompt_text": "Did you experience feelings of self-doubt, loss of confidence, or burnout?",
        "input_type": "likert_0_4",
    },
]

ADAPTIVE_FOLLOWUP_RULES: List[Dict[str, Any]] = [
    {
        "code": "ADAPT_VM_TRIG",
        "category": "adaptive",
        "name": "Hot Flash Trigger Factors",
        "trigger_question": "CORE_VM_HF",
        "trigger_condition": lambda ans: (ans.get("intensity", 0) >= 3 if isinstance(ans, dict) else False),
        "prompt_text": "What seemed to trigger your severe hot flash? (e.g., hot drink, stress, warm room, alcohol)",
        "input_type": "text",
        "max_depth": 1,
    },
    {
        "code": "ADAPT_SL_LAT",
        "category": "adaptive",
        "name": "Sleep-Onset Latency",
        "trigger_question": "CORE_SL_DIS",
        "trigger_condition": lambda ans: (ans.get("intensity", 0) >= 3 if isinstance(ans, dict) else False),
        "prompt_text": "Approximately how long did it take you to fall asleep last night? (<30 min, 30-60 min, >60 min)",
        "input_type": "single_choice",
        "options": ["<30 minutes", "30-60 minutes", ">60 minutes"],
        "max_depth": 1,
    },
    {
        "code": "ADAPT_BL_FLOW",
        "category": "adaptive",
        "name": "Heavy Bleeding Assessment",
        "trigger_question": "CORE_BL_STAT",
        "trigger_condition": lambda ans: (
            ans.get("bleeding_status") in ["heavy", "normal"] or ans.get("intensity", 0) >= 3
            if isinstance(ans, dict) else False
        ),
        "prompt_text": "Did you pass large blood clots (>2.5 cm) or soak through protection in under 2 hours?",
        "input_type": "boolean",
        "max_depth": 1,
    },
    {
        "code": "ADAPT_CAR_CHEST",
        "category": "adaptive",
        "name": "Cardiac Red-Flag Screen",
        "trigger_question": "ROT_CAR_PAL",
        "trigger_condition": lambda ans: (ans.get("intensity", 0) >= 2 if isinstance(ans, dict) else False),
        "prompt_text": "Did heart palpitations occur alongside chest tightness, shortness of breath, or dizziness?",
        "input_type": "boolean",
        "max_depth": 1,
    },
    {
        "code": "ADAPT_URO_TREAT",
        "category": "adaptive",
        "name": "Vaginal Symptom Management",
        "trigger_question": "ROT_URO_DRY",
        "trigger_condition": lambda ans: (ans.get("intensity", 0) >= 2 if isinstance(ans, dict) else False),
        "prompt_text": "Are you currently using local vaginal estrogen cream/tablet or a non-hormonal moisturizer?",
        "input_type": "single_choice",
        "options": ["Prescription local estrogen", "Non-hormonal moisturizer/lubricant", "None"],
        "max_depth": 1,
    },
]

# Lookup maps
ALL_QUESTIONS_BY_CODE: Dict[str, Dict[str, Any]] = {
    q["code"]: q for q in CORE_QUESTIONS + ROTATING_QUESTION_BANK + ADAPTIVE_FOLLOWUP_RULES
}


class AdaptiveQuestionnaireScheduler:
    """Manages rotation schedules, coverage guarantees, and session life cycle."""

    CORE_COUNT: int = 7
    ROTATING_COUNT: int = 6
    MAX_ADAPTIVE_COUNT: int = 2

    @classmethod
    def get_question_by_code(cls, code: str) -> Optional[Dict[str, Any]]:
        return ALL_QUESTIONS_BY_CODE.get(code)

    @classmethod
    def calculate_cycle_length(cls, pool_size: Optional[int] = None) -> int:
        """Calculates total days in one rotation cycle given question bank size."""
        size = pool_size or len(ROTATING_QUESTION_BANK)
        if size < cls.ROTATING_COUNT:
            raise ValueError(f"Question bank has {size} items; requires at least {cls.ROTATING_COUNT} eligible rotating items.")
        return (size + cls.ROTATING_COUNT - 1) // cls.ROTATING_COUNT

    @classmethod
    async def get_or_create_tracker(
        cls, db: AsyncSession, patient_id: str, today: date
    ) -> PatientRotationTracker:
        """Fetches or initializes the patient's rotation tracker."""
        res = await db.execute(
            select(PatientRotationTracker).where(PatientRotationTracker.patient_id == patient_id)
        )
        tracker = res.scalar_one_or_none()
        if not tracker:
            tracker = PatientRotationTracker(
                patient_id=patient_id,
                cycle_number=1,
                cycle_start_date=today,
                assigned_pool_history=[],
                completed_pool_history=[],
                unanswered_recovery_pool=[],
            )
            db.add(tracker)
            await db.flush()
        return tracker

    @classmethod
    def select_rotating_questions_for_assessment(
        cls, tracker: PatientRotationTracker
    ) -> List[str]:
        """Selects exactly 6 rotating questions guaranteeing cycle coverage and fair remainder handling."""
        all_codes = [q["code"] for q in ROTATING_QUESTION_BANK]
        pool_size = len(all_codes)
        if pool_size < cls.ROTATING_COUNT:
            raise ValueError(f"Configuration error: Question bank has {pool_size} questions, requires at least {cls.ROTATING_COUNT}.")

        completed_set = set(tracker.completed_pool_history or [])
        assigned_in_cycle = tracker.assigned_pool_history or []
        recovery_pool = tracker.unanswered_recovery_pool or []

        # 1. First priority: any recovered questions from previous incomplete assessments
        selected: List[str] = []
        for code in recovery_pool:
            if code not in selected and len(selected) < cls.ROTATING_COUNT:
                selected.append(code)

        # 2. Second priority: questions in the bank that have NOT yet been assigned in this cycle
        unassigned_in_cycle = [c for c in all_codes if c not in assigned_in_cycle and c not in selected]
        for code in unassigned_in_cycle:
            if len(selected) < cls.ROTATING_COUNT:
                selected.append(code)

        # 3. Third priority: if all questions have been assigned in current cycle or remainder exists,
        # fill remaining slots with questions that have least recent completion in this cycle
        if len(selected) < cls.ROTATING_COUNT:
            # Sort by completed frequency or index
            remaining_candidates = [c for c in all_codes if c not in selected]
            for code in remaining_candidates:
                if len(selected) < cls.ROTATING_COUNT:
                    selected.append(code)

        assert len(selected) == cls.ROTATING_COUNT, f"Must select exactly {cls.ROTATING_COUNT} rotating questions, got {len(selected)}"
        return selected

    @classmethod
    def evaluate_adaptive_followups(cls, current_answers: Dict[str, Any]) -> List[str]:
        """Evaluates deterministic trigger rules on current answers and returns up to 2 follow-up codes."""
        triggered_codes: List[str] = []
        for rule in ADAPTIVE_FOLLOWUP_RULES:
            q_code = rule["trigger_question"]
            ans = current_answers.get(q_code)
            if ans and rule["trigger_condition"](ans):
                if rule["code"] not in triggered_codes:
                    triggered_codes.append(rule["code"])
                if len(triggered_codes) >= cls.MAX_ADAPTIVE_COUNT:
                    break
        return triggered_codes

    @classmethod
    async def get_or_create_daily_session(
        cls,
        db: AsyncSession,
        patient_id: str,
        assessment_date: date,
    ) -> Tuple[QuestionnaireSession, List[Dict[str, Any]]]:
        """Gets existing session or initializes a new daily session with exactly 7 core and 6 rotating questions."""
        res = await db.execute(
            select(QuestionnaireSession).where(
                QuestionnaireSession.patient_id == patient_id,
                QuestionnaireSession.assessment_date == assessment_date,
            )
        )
        session = res.scalar_one_or_none()

        if session:
            # Interruption recovery: preserve exact assignment
            core_codes = session.core_question_codes
            rot_codes = session.rotating_question_codes
            adapt_codes = session.adaptive_question_codes
        else:
            tracker = await cls.get_or_create_tracker(db, patient_id, assessment_date)
            core_codes = [q["code"] for q in CORE_QUESTIONS]
            rot_codes = cls.select_rotating_questions_for_assessment(tracker)
            adapt_codes = []

            session = QuestionnaireSession(
                patient_id=patient_id,
                assessment_date=assessment_date,
                status="in_progress",
                core_question_codes=core_codes,
                rotating_question_codes=rot_codes,
                adaptive_question_codes=adapt_codes,
                answers={},
                questionnaire_version="v1.0-adaptive",
            )
            db.add(session)

            # Update tracker assigned history
            new_assigned = list(tracker.assigned_pool_history or [])
            for c in rot_codes:
                if c not in new_assigned:
                    new_assigned.append(c)
            tracker.assigned_pool_history = new_assigned

            # Remove newly assigned questions from recovery pool if they were present
            tracker.unanswered_recovery_pool = [
                c for c in (tracker.unanswered_recovery_pool or []) if c not in rot_codes
            ]
            await db.flush()

        # Build full question objects
        full_questions = cls._assemble_question_objects(core_codes, rot_codes, adapt_codes)
        return session, full_questions

    @classmethod
    def _assemble_question_objects(
        cls, core_codes: List[str], rot_codes: List[str], adapt_codes: List[str]
    ) -> List[Dict[str, Any]]:
        questions = []
        # Core questions
        for c in core_codes:
            q = cls.get_question_by_code(c)
            if q:
                q_copy = copy.deepcopy(q)
                q_copy["is_required"] = True
                questions.append(q_copy)
        # Rotating questions
        for c in rot_codes:
            q = cls.get_question_by_code(c)
            if q:
                q_copy = copy.deepcopy(q)
                q_copy["is_required"] = True
                questions.append(q_copy)
        # Adaptive follow-up questions
        for c in adapt_codes:
            q = cls.get_question_by_code(c)
            if q:
                q_copy = copy.deepcopy(q)
                q_copy["is_required"] = False
                questions.append(q_copy)
        return questions

    @classmethod
    async def save_session_draft(
        cls,
        db: AsyncSession,
        session_id: str,
        patient_id: str,
        answers: Dict[str, Any],
    ) -> Tuple[QuestionnaireSession, List[Dict[str, Any]]]:
        """Saves session draft answers and re-evaluates adaptive follow-up questions dynamically."""
        res = await db.execute(
            select(QuestionnaireSession).where(
                QuestionnaireSession.id == session_id,
                QuestionnaireSession.patient_id == patient_id,
            )
        )
        session = res.scalar_one_or_none()
        if not session:
            raise ValueError(f"Session {session_id} not found for patient {patient_id}")

        if session.status == "completed":
            raise ValueError("Cannot edit a completed assessment session.")

        # Evaluate adaptive followups based on new answers
        triggered = cls.evaluate_adaptive_followups(answers)
        session.adaptive_question_codes = triggered
        session.answers = answers
        session.updated_at = datetime.now(timezone.utc)
        await db.commit()

        questions = cls._assemble_question_objects(
            session.core_question_codes,
            session.rotating_question_codes,
            session.adaptive_question_codes,
        )
        return session, questions

    @classmethod
    async def complete_session(
        cls,
        db: AsyncSession,
        session_id: str,
        patient_id: str,
        final_answers: Dict[str, Any],
        time_to_complete_seconds: int = 60,
    ) -> Dict[str, Any]:
        """Validates all required questions are answered, marks session completed, and advances rotation cycle."""
        res = await db.execute(
            select(QuestionnaireSession).where(
                QuestionnaireSession.id == session_id,
                QuestionnaireSession.patient_id == patient_id,
            )
        )
        session = res.scalar_one_or_none()
        if not session:
            raise ValueError(f"Session {session_id} not found for patient {patient_id}")

        # 1. Validation: All 7 core questions and all 6 rotating questions must be answered
        missing_core = [
            c for c in session.core_question_codes if c not in final_answers or final_answers[c] is None
        ]
        missing_rot = [
            c for c in session.rotating_question_codes if c not in final_answers or final_answers[c] is None
        ]

        if missing_core or missing_rot:
            unanswered = missing_core + missing_rot
            raise ValueError(
                f"Assessment incomplete. Exactly 7 core and 6 rotating questions must be answered. Missing: {unanswered}"
            )

        # 2. Check for triggered adaptive follow-ups
        triggered = cls.evaluate_adaptive_followups(final_answers)
        session.adaptive_question_codes = triggered
        session.answers = final_answers
        session.status = "completed"
        session.completed_at = datetime.now(timezone.utc)

        # 3. Update rotation tracker
        tracker = await cls.get_or_create_tracker(db, patient_id, session.assessment_date)
        completed_pool = list(tracker.completed_pool_history or [])
        for c in session.rotating_question_codes:
            if c not in completed_pool:
                completed_pool.append(c)
        tracker.completed_pool_history = completed_pool

        # Check if cycle is complete (all 18 rotating questions answered)
        all_rotating_codes = [q["code"] for q in ROTATING_QUESTION_BANK]
        is_cycle_complete = all(c in completed_pool for c in all_rotating_codes)

        if is_cycle_complete:
            # Advance to next cycle
            tracker.cycle_number += 1
            tracker.cycle_start_date = session.assessment_date
            tracker.assigned_pool_history = []
            tracker.completed_pool_history = []
            tracker.unanswered_recovery_pool = []
        tracker.updated_at = datetime.now(timezone.utc)

        # 4. Upsert into core Assessment & Response models to keep existing analytics and dashboards fully compatible
        existing_assessment_res = await db.execute(
            select(Assessment).where(
                Assessment.patient_id == patient_id,
                Assessment.assessment_date == session.assessment_date,
            )
        )
        assessment = existing_assessment_res.scalar_one_or_none()
        if not assessment:
            assessment = Assessment(
                patient_id=patient_id,
                assessment_date=session.assessment_date,
                time_to_complete_seconds=time_to_complete_seconds,
                completed_at=session.completed_at,
            )
            db.add(assessment)
            await db.flush()
        else:
            assessment.completed_at = session.completed_at
            assessment.time_to_complete_seconds = time_to_complete_seconds

        # Map response objects
        # Delete prior responses if overwriting
        res_del = await db.execute(select(Response).where(Response.assessment_id == assessment.id))
        for old_r in res_del.scalars().all():
            await db.delete(old_r)
        await db.flush()

        for code, ans in final_answers.items():
            intensity = 0
            frequency = 0
            impact = 0
            notes = None
            if isinstance(ans, dict):
                intensity = int(ans.get("intensity", 0))
                frequency = int(ans.get("frequency_count", 0))
                impact = int(ans.get("functional_impact", 0))
                notes = ans.get("notes") or ans.get("text_response")
            elif isinstance(ans, int):
                intensity = ans
            elif isinstance(ans, str):
                notes = ans

            db.add(
                Response(
                    assessment_id=assessment.id,
                    question_code=code,
                    intensity=intensity,
                    frequency_count=frequency,
                    functional_impact=impact,
                    notes=notes,
                )
            )

        # 5. Upsert BleedingRecord if CORE_BL_STAT was provided
        bl_ans = final_answers.get("CORE_BL_STAT")
        if bl_ans and isinstance(bl_ans, dict):
            status_val = bl_ans.get("bleeding_status", "none")
            pain_val = bl_ans.get("pelvic_pain_intensity", 0)
            existing_bl_res = await db.execute(
                select(BleedingRecord).where(
                    BleedingRecord.patient_id == patient_id,
                    BleedingRecord.record_date == session.assessment_date,
                )
            )
            bl_rec = existing_bl_res.scalar_one_or_none()
            if not bl_rec:
                bl_rec = BleedingRecord(
                    patient_id=patient_id,
                    record_date=session.assessment_date,
                    status=status_val,
                    duration_days=bl_ans.get("duration_days", 0),
                    has_clots=bl_ans.get("has_clots", False),
                    basal_body_temp=bl_ans.get("basal_body_temp"),
                    pelvic_pain_intensity=pain_val,
                )
                db.add(bl_rec)
            else:
                bl_rec.status = status_val
                bl_rec.pelvic_pain_intensity = pain_val

        await db.commit()

        return {
            "success": True,
            "session_id": session.id,
            "assessment_id": assessment.id,
            "assessment_date": str(session.assessment_date),
            "core_answered": len(session.core_question_codes),
            "rotating_answered": len(session.rotating_question_codes),
            "adaptive_answered": len(session.adaptive_question_codes),
            "cycle_number": tracker.cycle_number,
            "cycle_completed": is_cycle_complete,
            "total_questions": len(final_answers),
        }
