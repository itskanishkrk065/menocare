"""SQLAlchemy 2.0 database models for user, clinical, questionnaire, lab, alert, and reporting entities."""

import uuid
from datetime import datetime, date, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import (
    String, Boolean, Integer, Float, Date, DateTime, Text, ForeignKey, JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.core.database import Base


def generate_uuid() -> str:
    """Generates a UUID string."""
    return str(uuid.uuid4())


def utc_now() -> datetime:
    """Returns current UTC timestamp."""
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# 1. User & Identity
# ---------------------------------------------------------------------------

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(32), nullable=False, default="patient")  # 'patient', 'doctor', 'admin'
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    patient_profile: Mapped[Optional["PatientProfile"]] = relationship("PatientProfile", back_populates="user", uselist=False)
    doctor_profile: Mapped[Optional["DoctorProfile"]] = relationship("DoctorProfile", back_populates="user", uselist=False)


# ---------------------------------------------------------------------------
# 2. Doctor Profile & Practice Codes
# ---------------------------------------------------------------------------

class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    license_number: Mapped[str] = mapped_column(String(64), nullable=True)
    specialty: Mapped[str] = mapped_column(String(128), default="Gynecology & Menopause Care")
    clinic_name: Mapped[str] = mapped_column(String(255), nullable=True)
    clinic_phone: Mapped[str] = mapped_column(String(64), nullable=True)
    clinic_address: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    user: Mapped["User"] = relationship("User", back_populates="doctor_profile")
    practice_codes: Mapped[List["DoctorPracticeCode"]] = relationship("DoctorPracticeCode", back_populates="doctor", cascade="all, delete-orphan")
    patient_links: Mapped[List["PatientDoctorAccess"]] = relationship("PatientDoctorAccess", back_populates="doctor")
    appointments: Mapped[List["AppointmentRequest"]] = relationship("AppointmentRequest", back_populates="doctor", cascade="all, delete-orphan")
    messages: Mapped[List["PatientDoctorMessage"]] = relationship("PatientDoctorMessage", back_populates="doctor", cascade="all, delete-orphan")


class DoctorPracticeCode(Base):
    __tablename__ = "doctor_practice_codes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    doctor_id: Mapped[str] = mapped_column(String(36), ForeignKey("doctor_profiles.id", ondelete="CASCADE"), index=True)
    code: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    doctor: Mapped["DoctorProfile"] = relationship("DoctorProfile", back_populates="practice_codes")


# ---------------------------------------------------------------------------
# 3. Patient Profile & Doctor Pairing
# ---------------------------------------------------------------------------

class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    birth_year: Mapped[int] = mapped_column(Integer, nullable=False)
    straw_stage: Mapped[str] = mapped_column(String(64), default="reproductive_late")
    surgical_history: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    current_medications: Mapped[List[str]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    user: Mapped["User"] = relationship("User", back_populates="patient_profile")
    doctor_links: Mapped[List["PatientDoctorAccess"]] = relationship("PatientDoctorAccess", back_populates="patient", cascade="all, delete-orphan")
    assessments: Mapped[List["Assessment"]] = relationship("Assessment", back_populates="patient", cascade="all, delete-orphan")
    bleeding_records: Mapped[List["BleedingRecord"]] = relationship("BleedingRecord", back_populates="patient", cascade="all, delete-orphan")
    lab_reports: Mapped[List["LabReport"]] = relationship("LabReport", back_populates="patient", cascade="all, delete-orphan")
    alerts: Mapped[List["AnomalyAlert"]] = relationship("AnomalyAlert", back_populates="patient", cascade="all, delete-orphan")
    appointments: Mapped[List["AppointmentRequest"]] = relationship("AppointmentRequest", back_populates="patient", cascade="all, delete-orphan")
    medications: Mapped[List["PatientMedication"]] = relationship("PatientMedication", back_populates="patient", cascade="all, delete-orphan")
    messages: Mapped[List["PatientDoctorMessage"]] = relationship("PatientDoctorMessage", back_populates="patient", cascade="all, delete-orphan")


class PatientDoctorAccess(Base):
    __tablename__ = "patient_doctor_access"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), index=True)
    doctor_id: Mapped[str] = mapped_column(String(36), ForeignKey("doctor_profiles.id", ondelete="CASCADE"), index=True)
    linked_via_code: Mapped[str] = mapped_column(String(32), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="active")  # 'active', 'revoked'
    linked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    patient: Mapped["PatientProfile"] = relationship("PatientProfile", back_populates="doctor_links")
    doctor: Mapped["DoctorProfile"] = relationship("DoctorProfile", back_populates="patient_links")


# ---------------------------------------------------------------------------
# 4. Questionnaire Versions & Questions
# ---------------------------------------------------------------------------

class QuestionnaireVersion(Base):
    __tablename__ = "questionnaire_versions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    version_code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    tier_type: Mapped[str] = mapped_column(String(32), nullable=False)  # 'baseline_mrs', 'daily_sentinel', 'weekly_deepdive'
    description: Mapped[str] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    questions: Mapped[List["Question"]] = relationship("Question", back_populates="version", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    version_id: Mapped[str] = mapped_column(String(36), ForeignKey("questionnaire_versions.id", ondelete="CASCADE"), index=True)
    code: Mapped[str] = mapped_column(String(64), nullable=False)
    domain: Mapped[str] = mapped_column(String(64), nullable=False)
    prompt_text: Mapped[str] = mapped_column(Text, nullable=False)
    input_type: Mapped[str] = mapped_column(String(32), nullable=False)  # 'likert_0_4', 'integer_count', 'text'
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_red_flag: Mapped[bool] = mapped_column(Boolean, default=False)

    version: Mapped["QuestionnaireVersion"] = relationship("QuestionnaireVersion", back_populates="questions")
    responses: Mapped[List["Response"]] = relationship("Response", back_populates="question")


# ---------------------------------------------------------------------------
# 5. Assessments, Daily Logs & Bleeding Records
# ---------------------------------------------------------------------------

class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), index=True)
    version_id: Mapped[str] = mapped_column(String(36), ForeignKey("questionnaire_versions.id"), nullable=True)
    assessment_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    time_to_complete_seconds: Mapped[int] = mapped_column(Integer, default=60)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    patient: Mapped["PatientProfile"] = relationship("PatientProfile", back_populates="assessments")
    responses: Mapped[List["Response"]] = relationship("Response", back_populates="assessment", cascade="all, delete-orphan")


class Response(Base):
    __tablename__ = "responses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    assessment_id: Mapped[str] = mapped_column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), index=True)
    question_id: Mapped[str] = mapped_column(String(36), ForeignKey("questions.id"), nullable=True)
    question_code: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    intensity: Mapped[int] = mapped_column(Integer, default=0)  # 0 to 4
    frequency_count: Mapped[int] = mapped_column(Integer, default=0)
    functional_impact: Mapped[int] = mapped_column(Integer, default=0)  # 0 to 3
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="responses")
    question: Mapped[Optional["Question"]] = relationship("Question", back_populates="responses")


# ---------------------------------------------------------------------------
# 5b. Adaptive Questionnaire Sessions & Rotation Tracking
# ---------------------------------------------------------------------------

class QuestionnaireSession(Base):
    __tablename__ = "questionnaire_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), index=True)
    assessment_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(32), default="in_progress")  # 'in_progress', 'completed', 'interrupted'
    core_question_codes: Mapped[List[str]] = mapped_column(JSON, default=list)  # exactly 7
    rotating_question_codes: Mapped[List[str]] = mapped_column(JSON, default=list)  # exactly 6
    adaptive_question_codes: Mapped[List[str]] = mapped_column(JSON, default=list)  # 0 to 2
    answers: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    questionnaire_version: Mapped[str] = mapped_column(String(32), default="v1.0-adaptive")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class PatientRotationTracker(Base):
    __tablename__ = "patient_rotation_trackers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), unique=True, index=True)
    cycle_number: Mapped[int] = mapped_column(Integer, default=1)
    cycle_start_date: Mapped[date] = mapped_column(Date, nullable=False)
    assigned_pool_history: Mapped[List[str]] = mapped_column(JSON, default=list)
    completed_pool_history: Mapped[List[str]] = mapped_column(JSON, default=list)
    unanswered_recovery_pool: Mapped[List[str]] = mapped_column(JSON, default=list)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


# ---------------------------------------------------------------------------
# 5c. Intelligent Symptom Extraction & Provenance
# ---------------------------------------------------------------------------

class SymptomExtraction(Base):
    __tablename__ = "symptom_extractions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), index=True)
    assessment_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("assessments.id", ondelete="SET NULL"), nullable=True)
    input_method: Mapped[str] = mapped_column(String(32), default="text")  # 'text', 'voice'
    raw_input_text: Mapped[str] = mapped_column(Text, nullable=False)
    reviewed_transcript: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    extracted_candidates: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list)
    confirmed_categories: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list)
    rejected_categories: Mapped[List[str]] = mapped_column(JSON, default=list)
    added_manually_categories: Mapped[List[str]] = mapped_column(JSON, default=list)
    clarification_requested: Mapped[bool] = mapped_column(Boolean, default=False)
    clarification_prompt: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    model_version: Mapped[str] = mapped_column(String(32), default="hybrid-nlp-v1")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    confirmed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


# ---------------------------------------------------------------------------
# 5d. Longitudinal Trend Anomalies & Prioritisation
# ---------------------------------------------------------------------------

class ClinicalTrendAnomaly(Base):
    __tablename__ = "clinical_trend_anomalies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), index=True)
    doctor_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("doctor_profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    observation_type: Mapped[str] = mapped_column(String(64), nullable=False)
    detection_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    comparison_period_days: Mapped[int] = mapped_column(Integer, default=30)
    historical_baseline: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    current_observation: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    detection_method_version: Mapped[str] = mapped_column(String(32), default="stat_zscore_v1")
    reason_for_flagging: Mapped[str] = mapped_column(Text, nullable=False)
    relevant_source_records: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String(32), default="unreviewed")  # 'unreviewed', 'acknowledged', 'dismissed', 'action_taken'
    clinician_feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class DoctorPrioritisationTask(Base):
    __tablename__ = "doctor_prioritisation_tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    doctor_id: Mapped[str] = mapped_column(String(36), ForeignKey("doctor_profiles.id", ondelete="CASCADE"), index=True)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), index=True)
    priority_tier: Mapped[str] = mapped_column(String(32), nullable=False)  # 'urgent_clinical', 'clinical_attention', 'administrative_followup', 'routine'
    priority_score: Mapped[float] = mapped_column(Float, default=0.0)
    reasons: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String(32), default="pending")  # 'pending', 'reviewed', 'acknowledged', 'resolved'
    override_tier: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    override_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class BleedingRecord(Base):
    __tablename__ = "bleeding_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), index=True)
    record_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(32), default="none")  # 'none', 'spotting', 'light', 'normal', 'heavy'
    duration_days: Mapped[int] = mapped_column(Integer, default=0)
    has_clots: Mapped[bool] = mapped_column(Boolean, default=False)
    basal_body_temp: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # in Celsius e.g. 36.8
    pelvic_pain_intensity: Mapped[int] = mapped_column(Integer, default=0)  # 0 to 4
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    patient: Mapped["PatientProfile"] = relationship("PatientProfile", back_populates="bleeding_records")


# ---------------------------------------------------------------------------
# 6. Local Lab Reports & Analytes
# ---------------------------------------------------------------------------

class LabReport(Base):
    __tablename__ = "lab_reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), index=True)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(64), nullable=False)
    report_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="pending_verification")  # 'pending_verification', 'verified'
    raw_ocr_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    patient: Mapped["PatientProfile"] = relationship("PatientProfile", back_populates="lab_reports")
    analytes: Mapped[List["LabAnalyte"]] = relationship("LabAnalyte", back_populates="lab_report", cascade="all, delete-orphan")


class LabAnalyte(Base):
    __tablename__ = "lab_analytes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    lab_report_id: Mapped[str] = mapped_column(String(36), ForeignKey("lab_reports.id", ondelete="CASCADE"), index=True)
    analyte_name: Mapped[str] = mapped_column(String(64), nullable=False, index=True)  # 'FSH', 'LH', 'TSH', etc.
    numeric_value: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(32), default="")
    reference_range_low: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    reference_range_high: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    flag: Mapped[str] = mapped_column(String(32), default="normal")  # 'normal', 'high', 'low', 'critical'
    is_verified_by_user: Mapped[bool] = mapped_column(Boolean, default=False)

    lab_report: Mapped["LabReport"] = relationship("LabReport", back_populates="analytes")


# ---------------------------------------------------------------------------
# 7. Anomaly Alerts & Consultation Requests
# ---------------------------------------------------------------------------

class AnomalyAlert(Base):
    __tablename__ = "anomaly_alerts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), index=True)
    doctor_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("doctor_profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    trigger_type: Mapped[str] = mapped_column(String(64), nullable=False)  # 'red_flag', 'disease_pattern', 'statistical_spike'
    condition_code: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)  # 'PCOD_PCOS', 'THYROID_HYPO', etc.
    condition_name: Mapped[str] = mapped_column(String(128), nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0)  # 0.0 to 100.0
    severity_level: Mapped[str] = mapped_column(String(32), default="warning")  # 'warning', 'urgent', 'emergency'
    description: Mapped[str] = mapped_column(Text, nullable=False)
    recommended_action: Mapped[str] = mapped_column(Text, nullable=False)
    is_acknowledged_by_patient: Mapped[bool] = mapped_column(Boolean, default=False)
    is_acknowledged_by_doctor: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    patient: Mapped["PatientProfile"] = relationship("PatientProfile", back_populates="alerts")


class AppointmentRequest(Base):
    __tablename__ = "appointment_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), index=True)
    doctor_id: Mapped[str] = mapped_column(String(36), ForeignKey("doctor_profiles.id", ondelete="CASCADE"), index=True)
    alert_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("anomaly_alerts.id"), nullable=True)
    requested_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="pending")  # 'pending', 'confirmed', 'completed', 'cancelled'
    meeting_link: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    doctor_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    patient: Mapped["PatientProfile"] = relationship("PatientProfile", back_populates="appointments")
    doctor: Mapped["DoctorProfile"] = relationship("DoctorProfile", back_populates="appointments")


class DoctorClinicalNote(Base):
    __tablename__ = "doctor_clinical_notes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), index=True)
    doctor_id: Mapped[str] = mapped_column(String(36), ForeignKey("doctor_profiles.id", ondelete="CASCADE"), index=True)
    note_type: Mapped[str] = mapped_column(String(32), default="soap")  # 'soap', 'consultation'
    subjective: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    objective: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    assessment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    plan: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


# ---------------------------------------------------------------------------
# 8. Clinical Reports & Audit Logs
# ---------------------------------------------------------------------------

class ClinicalReport(Base):
    __tablename__ = "clinical_reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), index=True)
    doctor_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("doctor_profiles.id"), nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    analytical_payload: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    ai_summary: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    is_fallback_template: Mapped[bool] = mapped_column(Boolean, default=False)
    generated_by: Mapped[str] = mapped_column(String(36), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    actor_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    patient_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)
    action: Mapped[str] = mapped_column(String(64), nullable=False)
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    logged_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


# ---------------------------------------------------------------------------
# 9. Medications, HRT Adherence & Clinical Messaging
# ---------------------------------------------------------------------------

class PatientMedication(Base):
    __tablename__ = "patient_medications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    dosage: Mapped[str] = mapped_column(String(64), nullable=False)
    frequency: Mapped[str] = mapped_column(String(64), default="daily")  # daily, nightly, weekly, biweekly
    category: Mapped[str] = mapped_column(String(32), default="hrt")  # hrt, supplement, thyroid, bone_density, other
    instructions: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    patient: Mapped["PatientProfile"] = relationship("PatientProfile", back_populates="medications")
    logs: Mapped[List["MedicationLog"]] = relationship("MedicationLog", back_populates="medication", cascade="all, delete-orphan")


class MedicationLog(Base):
    __tablename__ = "medication_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    medication_id: Mapped[str] = mapped_column(String(36), ForeignKey("patient_medications.id", ondelete="CASCADE"), index=True)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), index=True)
    log_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    taken: Mapped[bool] = mapped_column(Boolean, default=True)
    logged_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    medication: Mapped["PatientMedication"] = relationship("PatientMedication", back_populates="logs")


class PatientDoctorMessage(Base):
    __tablename__ = "patient_doctor_messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), index=True)
    doctor_id: Mapped[str] = mapped_column(String(36), ForeignKey("doctor_profiles.id", ondelete="CASCADE"), index=True)
    sender_role: Mapped[str] = mapped_column(String(16), nullable=False)  # 'patient' or 'doctor'
    message_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    patient: Mapped["PatientProfile"] = relationship("PatientProfile", back_populates="messages")
    doctor: Mapped["DoctorProfile"] = relationship("DoctorProfile", back_populates="messages")

