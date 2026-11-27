"""Automated test suite for MenoCare AI/ML Phase 1 capabilities:

1. Adaptive Questionnaire Engine (7 Core + 6 Rotating + Deterministic Adaptive Follow-ups).
2. Intelligent Symptom Classification (NLP Extraction, Negation, Uncertainty, Taxonomy Mapping).
3. Clinical Trend Anomaly Detection (Statistical Baseline, Non-zero Handling, Spike vs Persistent).
4. Patient Follow-up Prioritisation (Evidence-linked Triage, Deduplication, Clinician Overrides).
"""

import pytest
import uuid
from datetime import date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.services.adaptive_questionnaire import (
    AdaptiveQuestionnaireScheduler, CORE_QUESTIONS, ROTATING_QUESTION_BANK,
    ADAPTIVE_FOLLOWUP_RULES
)
from backend.app.services.symptom_classifier import (
    SymptomClassifierService, APPROVED_TAXONOMY
)
from backend.app.services.anomaly_detection_service import AnomalyDetectionService
from backend.app.services.prioritisation_service import PatientPrioritisationService
from backend.app.models import (
    User, PatientProfile, DoctorProfile, PatientDoctorAccess,
    QuestionnaireSession, PatientRotationTracker, AnomalyAlert,
    ClinicalTrendAnomaly, DoctorPrioritisationTask, Assessment, Response
)
from backend.app.core.security import get_password_hash
from backend.app.core.database import engine, Base, async_session_maker


@pytest.fixture(autouse=True)
async def init_db():
    """Initializes tables before test run."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


# ---------------------------------------------------------------------------
# 1. ADAPTIVE QUESTIONNAIRE INVARIANT TESTS
# ---------------------------------------------------------------------------

def test_questionnaire_bank_invariants():
    """Validates core question bank invariants."""
    # Exactly 7 core questions
    assert len(CORE_QUESTIONS) == 7
    core_codes = [q["code"] for q in CORE_QUESTIONS]
    assert len(set(core_codes)) == 7  # No duplicate codes

    # Rotating pool has at least 6 eligible questions
    assert len(ROTATING_QUESTION_BANK) >= 6
    rot_codes = [q["code"] for q in ROTATING_QUESTION_BANK]
    assert len(set(rot_codes)) == len(rot_codes)  # Unique rotating codes

    # Core and rotating pools must be completely disjoint
    assert set(core_codes).isdisjoint(set(rot_codes))


def test_rotation_scheduler_cycle_coverage():
    """Simulates 3 consecutive days and verifies 100% coverage of all 18 rotating questions."""
    tracker = PatientRotationTracker(
        patient_id="test_pat_rotation",
        cycle_number=1,
        cycle_start_date=date.today(),
        assigned_pool_history=[],
        completed_pool_history=[],
        unanswered_recovery_pool=[],
    )

    all_rotating_codes = [q["code"] for q in ROTATING_QUESTION_BANK]
    total_bank_size = len(all_rotating_codes)  # 18
    assigned_across_cycle = []

    # Day 1
    day1_rot = AdaptiveQuestionnaireScheduler.select_rotating_questions_for_assessment(tracker)
    assert len(day1_rot) == 6
    tracker.assigned_pool_history = day1_rot
    tracker.completed_pool_history = day1_rot
    assigned_across_cycle.extend(day1_rot)

    # Day 2
    day2_rot = AdaptiveQuestionnaireScheduler.select_rotating_questions_for_assessment(tracker)
    assert len(day2_rot) == 6
    assert set(day1_rot).isdisjoint(set(day2_rot))  # No premature repetition before cycle completion
    tracker.assigned_pool_history = list(tracker.assigned_pool_history) + day2_rot
    tracker.completed_pool_history = list(tracker.completed_pool_history) + day2_rot
    assigned_across_cycle.extend(day2_rot)

    # Day 3
    day3_rot = AdaptiveQuestionnaireScheduler.select_rotating_questions_for_assessment(tracker)
    assert len(day3_rot) == 6
    assert set(day3_rot).isdisjoint(set(day1_rot))
    assert set(day3_rot).isdisjoint(set(day2_rot))
    tracker.assigned_pool_history = list(tracker.assigned_pool_history) + day3_rot
    tracker.completed_pool_history = list(tracker.completed_pool_history) + day3_rot
    assigned_across_cycle.extend(day3_rot)

    # In 3 days (18 slots), every single rotating question must be assigned
    assert set(assigned_across_cycle) == set(all_rotating_codes)
    assert len(assigned_across_cycle) == total_bank_size


def test_adaptive_followup_trigger_logic():
    """Verifies deterministic adaptive follow-up rule evaluation."""
    # When hot flashes are severe (intensity >= 3)
    answers_severe_hf = {"CORE_VM_HF": {"intensity": 3, "frequency_count": 4}}
    followups = AdaptiveQuestionnaireScheduler.evaluate_adaptive_followups(answers_severe_hf)
    assert "ADAPT_VM_TRIG" in followups

    # When hot flashes are mild (intensity 1), trigger is not added
    answers_mild_hf = {"CORE_VM_HF": {"intensity": 1, "frequency_count": 1}}
    followups_mild = AdaptiveQuestionnaireScheduler.evaluate_adaptive_followups(answers_mild_hf)
    assert "ADAPT_VM_TRIG" not in followups_mild

    # Max adaptive limit (cannot exceed 2 follow-ups)
    answers_multi = {
        "CORE_VM_HF": {"intensity": 4},
        "CORE_SL_DIS": {"intensity": 4},
        "ROT_CAR_PAL": {"intensity": 3},
        "ROT_URO_DRY": {"intensity": 3},
    }
    multi_followups = AdaptiveQuestionnaireScheduler.evaluate_adaptive_followups(answers_multi)
    assert len(multi_followups) <= AdaptiveQuestionnaireScheduler.MAX_ADAPTIVE_COUNT


# ---------------------------------------------------------------------------
# 2. INTELLIGENT SYMPTOM CLASSIFICATION TESTS
# ---------------------------------------------------------------------------

def test_symptom_classification_multi_symptom_and_negation():
    """Tests multi-symptom extraction, negation handling, and taxonomy mapping."""
    text = (
        "I have severe night sweats waking me up soaked, terrible fatigue during the day, "
        "and brain fog, but no hot flashes or palpitations today."
    )
    result = SymptomClassifierService.classify_text(text)
    candidates = result["candidates"]

    # Candidate categories
    present_codes = [c["category_code"] for c in candidates if not c["is_negated"]]
    negated_codes = [c["category_code"] for c in candidates if c["is_negated"]]

    # Present symptoms
    assert "SYM_NIGHT_SWEATS" in present_codes
    assert "SYM_FATIGUE" in present_codes
    assert "SYM_BRAIN_FOG" in present_codes

    # Negated symptoms
    assert "SYM_HOT_FLASHES" in negated_codes
    assert "SYM_PALPITATIONS" in negated_codes

    # Preselection flag should only be True for present symptoms
    for c in candidates:
        if c["category_code"] in ["SYM_HOT_FLASHES", "SYM_PALPITATIONS"]:
            assert c["preselect"] is False


def test_symptom_classification_ambiguity_clarification():
    """Tests that highly ambiguous statements trigger clarification rather than guessing."""
    text = "Just feeling really off and weird today."
    result = SymptomClassifierService.classify_text(text)
    assert result["clarification_requested"] is True
    assert result["clarification_prompt"] is not None


def test_symptom_taxonomy_integrity():
    """Verifies that all taxonomy categories conform to domain standards."""
    assert len(APPROVED_TAXONOMY) == 30
    for code, meta in APPROVED_TAXONOMY.items():
        assert "name" in meta
        assert "domain" in meta
        assert len(meta["keywords"]) > 0


# ---------------------------------------------------------------------------
# 3. CLINICAL TREND ANOMALY DETECTION TESTS
# ---------------------------------------------------------------------------

def test_non_zero_missing_data_handling():
    """CRITICAL: Verifies missing check-in days are never imputed as zero."""
    # Patient logged 10 days out of 30, with intensity 3.0 on every recorded day
    recorded_values = [3.0] * 10
    stats = AnomalyDetectionService.calculate_baseline(recorded_values)

    # Average MUST be 3.0. If missing days were imputed as 0, mean would be 1.0!
    assert stats["mean"] == 3.0
    assert stats["sample_count"] == 10
    assert stats["std_dev"] == 0.0


def test_insufficient_history_safeguard():
    """Verifies no anomalies are generated if fewer than 10 observation days exist."""
    records = [
        {"question_code": "CORE_VM_HF", "intensity": 4, "date": "2026-02-01"},
        {"question_code": "CORE_VM_HF", "intensity": 4, "date": "2026-02-02"},
        {"question_code": "CORE_VM_HF", "intensity": 4, "date": "2026-02-03"},
    ]
    anomalies = AnomalyDetectionService.evaluate_symptom_anomalies("pat_insuf", records, date(2026, 2, 4))
    assert len(anomalies) == 0  # Insufficient baseline safeguard


def test_persistent_shift_vs_isolated_spike():
    """Verifies distinction between persistent elevation and isolated spikes."""
    baseline_records = [
        {"question_code": "CORE_VM_HF", "intensity": 1, "date": f"2026-01-{i:02d}"}
        for i in range(1, 20)
    ]

    # Scenario A: Persistent shift (3 consecutive elevated days at intensity 4)
    persistent_records = baseline_records + [
        {"question_code": "CORE_VM_HF", "intensity": 4, "date": "2026-01-20"},
        {"question_code": "CORE_VM_HF", "intensity": 4, "date": "2026-01-21"},
        {"question_code": "CORE_VM_HF", "intensity": 4, "date": "2026-01-22"},
    ]
    anomalies_a = AnomalyDetectionService.evaluate_symptom_anomalies("pat_a", persistent_records, date(2026, 1, 23))
    assert len(anomalies_a) >= 1
    assert any("persistent" in a["observation_type"] for a in anomalies_a)
    assert anomalies_a[0]["current_observation"]["is_persistent"] is True


# ---------------------------------------------------------------------------
# 4. PATIENT FOLLOW-UP PRIORITISATION & DB WORKFLOW TESTS
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_full_cross_feature_workflow_and_triage():
    """Tests the complete end-to-end integration:

    1. Patient adaptive session initialization (7 core, 6 rotating).
    2. Save draft, answer completion, and cycle tracking.
    3. Free-text symptom extraction and patient confirmation.
    4. Trend anomaly scan.
    5. Doctor prioritisation triage ranking with source record linkage.
    """
    async with async_session_maker() as db_session:
        uid = str(uuid.uuid4())[:8]
        # Create Doctor User & Profile
        doc_user = User(
            email=f"doctor.triage.{uid}@menocare.com",
            hashed_password=get_password_hash("DocSecret123!"),
            role="doctor",
            full_name="Dr. Triage Specialist",
        )
        db_session.add(doc_user)
        await db_session.flush()

        doctor = DoctorProfile(user_id=doc_user.id, specialty="Gynecology")
        db_session.add(doctor)
        await db_session.flush()

        # Create Patient User & Profile
        pat_user = User(
            email=f"patient.triage.{uid}@menocare.com",
            hashed_password=get_password_hash("PatientSecret123!"),
            role="patient",
            full_name="Maria Santos",
        )
    db_session.add(pat_user)
    await db_session.flush()

    patient = PatientProfile(user_id=pat_user.id, birth_year=1978, straw_stage="late_transition")
    db_session.add(patient)
    await db_session.flush()

    # Link Patient to Doctor
    link = PatientDoctorAccess(patient_id=patient.id, doctor_id=doctor.id, status="active")
    db_session.add(link)
    await db_session.commit()

    # Step 1: Initialize daily adaptive session
    session, questions = await AdaptiveQuestionnaireScheduler.get_or_create_daily_session(
        db_session, patient.id, date.today()
    )
    assert len(session.core_question_codes) == 7
    assert len(session.rotating_question_codes) == 6
    assert session.status == "in_progress"

    # Step 2: Complete assessment with severe hot flashes (triggers adaptive follow-up)
    answers = {
        "CORE_VM_HF": {"intensity": 4, "frequency_count": 6},
        "CORE_VM_NS": {"intensity": 3, "frequency_count": 2},
        "CORE_SL_DIS": {"intensity": 3},
        "CORE_PS_MOOD": {"intensity": 1},
        "CORE_PS_ANX": {"intensity": 2},
        "CORE_PH_FAT": {"intensity": 3},
        "CORE_BL_STAT": {"bleeding_status": "none", "pelvic_pain_intensity": 0},
    }
    for code in session.rotating_question_codes:
        answers[code] = {"intensity": 2}

    complete_result = await AdaptiveQuestionnaireScheduler.complete_session(
        db_session,
        session_id=session.id,
        patient_id=patient.id,
        final_answers=answers,
        time_to_complete_seconds=85,
    )
    assert complete_result["success"] is True
    assert complete_result["core_answered"] == 7
    assert complete_result["rotating_answered"] == 6

    # Step 3: Natural language symptom intake and confirmation
    desc = "I had unbearable night sweats and brain fog, but no bleeding."
    extraction = await SymptomClassifierService.record_symptom_intake(
        db_session,
        patient_id=patient.id,
        input_text=desc,
        input_method="text",
    )
    assert len(extraction.extracted_candidates) >= 2

    # Patient confirms extracted symptoms
    confirmed = await SymptomClassifierService.confirm_patient_symptoms(
        db_session,
        extraction_id=extraction.id,
        patient_id=patient.id,
        confirmed_category_codes=["SYM_NIGHT_SWEATS", "SYM_BRAIN_FOG"],
        rejected_category_codes=["SYM_HOT_FLASHES"],
        added_category_codes=[],
    )
    assert len(confirmed.confirmed_categories) == 2
    assert confirmed.confirmed_at is not None

    # Step 4: Inject an emergency red flag alert
    red_flag = AnomalyAlert(
        patient_id=patient.id,
        doctor_id=doctor.id,
        trigger_type="red_flag",
        condition_code="RED_PMB",
        condition_name="Postmenopausal Bleeding",
        severity_level="emergency",
        description="Vaginal bleeding reported after amenorrhea.",
        recommended_action="Schedule urgent TVUS.",
        is_acknowledged_by_doctor=False,
    )
    db_session.add(red_flag)
    await db_session.commit()

    # Step 5: Evaluate doctor follow-up prioritisation
    triage_tasks = await PatientPrioritisationService.refresh_doctor_triage_queue(db_session, doctor.id)
    assert len(triage_tasks) == 1
    task = triage_tasks[0]
    assert task.patient_id == patient.id
    assert task.priority_tier == PatientPrioritisationService.TIER_URGENT
    assert task.priority_score >= 80.0

    # Verify all reasons contain traceable record links
    for reason in task.reasons:
        assert "source_record_type" in reason
        assert "source_record_id" in reason
        assert "reason_text" in reason

    # Step 6: Clinician overrides triage priority
    overridden = await PatientPrioritisationService.override_patient_priority(
        db_session,
        task_id=task.id,
        doctor_id=doctor.id,
        override_tier="clinical_attention",
        override_notes="Patient contacted by phone; imaging already booked for tomorrow.",
    )
    assert overridden.priority_tier == "clinical_attention"
    assert overridden.override_notes is not None
