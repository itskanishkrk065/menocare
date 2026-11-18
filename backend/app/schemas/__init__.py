"""Pydantic v2 schemas for API requests and responses."""

from datetime import datetime, date
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ---------------------------------------------------------------------------
# Auth & User Schemas
# ---------------------------------------------------------------------------

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str
    role: Literal["patient", "doctor"] = "patient"
    birth_year: Optional[int] = None
    straw_stage: Optional[str] = "early_transition"
    amenorrhea_days: Optional[int] = 0
    prior_conditions: Optional[List[str]] = None
    surgical_history: Optional[Dict[str, Any]] = None
    current_medications: Optional[List[str]] = None
    doctor_practice_code: Optional[str] = None
    license_number: Optional[str] = None
    clinic_name: Optional[str] = None
    clinic_phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str
    full_name: str
    profile_id: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Doctor & Practice Code Schemas
# ---------------------------------------------------------------------------

class DoctorProfileResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    license_number: Optional[str]
    specialty: str
    clinic_name: Optional[str]
    clinic_phone: Optional[str]
    clinic_address: Optional[str]
    active_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class PracticeCodeResponse(BaseModel):
    code: str
    doctor_name: str
    clinic_name: Optional[str]
    created_at: datetime


class LinkDoctorRequest(BaseModel):
    practice_code: str


# ---------------------------------------------------------------------------
# Patient Profile Schemas
# ---------------------------------------------------------------------------

class PatientProfileResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    birth_year: int
    straw_stage: str
    linked_doctor_name: Optional[str] = None
    linked_doctor_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Daily Assessment & Sentinel Check-in Schemas
# ---------------------------------------------------------------------------

class SentinelResponseItem(BaseModel):
    question_code: str
    intensity: int = Field(ge=0, le=4)
    frequency_count: int = Field(default=0, ge=0)
    functional_impact: int = Field(default=0, ge=0, le=3)
    notes: Optional[str] = None


class DailyCheckInRequest(BaseModel):
    assessment_date: date
    responses: List[SentinelResponseItem]
    bleeding_status: Literal["none", "spotting", "light", "normal", "heavy"] = "none"
    duration_days: int = 0
    has_clots: bool = False
    basal_body_temp: Optional[float] = None
    pelvic_pain_intensity: int = Field(default=0, ge=0, le=4)
    additional_symptom_notes: Optional[str] = None


class BaselineMRSRequest(BaseModel):
    responses: Dict[str, int]
    last_menstrual_period_date: Optional[date] = None
    cycle_length_variation_days: int = 0
    amenorrhea_days: int = 0
    is_bilateral_oophorectomy: bool = False


# ---------------------------------------------------------------------------
# Lab Report & Extraction Schemas
# ---------------------------------------------------------------------------

class ExtractedAnalyteSchema(BaseModel):
    id: Optional[str] = None
    analyte_name: str
    numeric_value: float
    unit: str
    reference_range_low: Optional[float] = None
    reference_range_high: Optional[float] = None
    flag: Literal["normal", "high", "low", "critical"] = "normal"
    is_verified_by_user: bool = False


class LabReportResponse(BaseModel):
    id: str
    patient_id: str
    file_name: str
    report_date: Optional[date]
    status: str
    created_at: datetime
    analytes: List[ExtractedAnalyteSchema]

    model_config = ConfigDict(from_attributes=True)


class VerifyAnalyteUpdate(BaseModel):
    analyte_name: str
    numeric_value: float
    unit: str
    reference_range_low: Optional[float] = None
    reference_range_high: Optional[float] = None
    flag: Literal["normal", "high", "low", "critical"] = "normal"


class VerifyLabReportRequest(BaseModel):
    analytes: List[VerifyAnalyteUpdate]


# ---------------------------------------------------------------------------
# Anomaly Alerts & Consultation Booking Schemas
# ---------------------------------------------------------------------------

class AnomalyAlertResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: Optional[str]
    trigger_type: str
    condition_code: Optional[str]
    condition_name: str
    confidence_score: float
    severity_level: str
    description: str
    recommended_action: str
    is_acknowledged_by_patient: bool
    is_acknowledged_by_doctor: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AppointmentRequestCreate(BaseModel):
    alert_id: Optional[str] = None
    requested_date: Optional[date] = None
    reason: str


class AppointmentRequestResponse(BaseModel):
    id: str
    patient_id: str
    patient_name: str
    doctor_id: str
    requested_date: Optional[date]
    reason: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Analytics & Clinical Reporting Schemas
# ---------------------------------------------------------------------------

class SymptomTimeSeriesPoint(BaseModel):
    date: str
    raw_intensity: Optional[int] = None
    sma_7: Optional[float] = None
    sma_30: Optional[float] = None
    frequency_count: Optional[int] = 0


class DifferentialMatchResult(BaseModel):
    condition_code: str
    condition_name: str
    category: str
    confidence_score: float
    risk_tier: Literal["low", "moderate", "high", "critical"]
    matching_criteria_met: List[str]
    recommended_workup: str


class DeterministicAnalyticsPayload(BaseModel):
    patient_id: str
    evaluation_window_days: int
    adherence_rate_pct: float
    total_recorded_days: int
    symptom_trends: Dict[str, Dict[str, Any]]
    differential_screenings: List[DifferentialMatchResult]
    active_red_flags: List[Dict[str, Any]]
    verified_lab_markers: List[Dict[str, Any]]


class ClinicalReportResponse(BaseModel):
    id: str
    patient_id: str
    start_date: date
    end_date: date
    analytical_payload: Dict[str, Any]
    ai_summary: Optional[Dict[str, Any]]
    is_fallback_template: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
