package com.menocare.app.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// --- AUTH & USER ---
@Serializable
data class LoginRequest(
    val email: String,
    val password: String
)

@Serializable
data class LoginResponse(
    @SerialName("access_token") val accessToken: String,
    @SerialName("token_type") val tokenType: String = "bearer",
    val user: UserProfile
)

@Serializable
data class UserProfile(
    val id: String,
    val email: String,
    @SerialName("full_name") val fullName: String,
    val role: String, // "patient" or "doctor"
    @SerialName("is_active") val isActive: Boolean = true
)

// --- PATIENT PROFILE & STRAW+10 ---
@Serializable
data class PatientProfile(
    val id: String,
    @SerialName("user_id") val userId: String,
    val age: Int? = null,
    @SerialName("straw_stage") val strawStage: String? = "early_perimenopause",
    @SerialName("is_linked_to_doctor") val isLinkedToDoctor: Boolean = false,
    @SerialName("doctor_name") val doctorName: String? = null,
    @SerialName("practice_code") val practiceCode: String? = null
)

// --- ASSESSMENTS & QUESTIONS ---
@Serializable
data class QuestionDto(
    val id: String? = null,
    val code: String,
    val domain: String,
    @SerialName("prompt_text") val promptText: String,
    @SerialName("input_type") val inputType: String = "likert_0_4",
    @SerialName("display_order") val displayOrder: Int = 0
)

@Serializable
data class DailyAssessmentRequest(
    @SerialName("vasomotor_score") val vasomotorScore: Int = 0,
    @SerialName("sleep_score") val sleepScore: Int = 0,
    @SerialName("mood_score") val moodScore: Int = 0,
    @SerialName("cognitive_score") val cognitiveScore: Int = 0,
    @SerialName("musculoskeletal_score") val musculoskeletalScore: Int = 0,
    @SerialName("urogenital_score") val urogenitalScore: Int = 0,
    @SerialName("bleeding_status") val bleedingStatus: String = "none",
    @SerialName("bleeding_duration_days") val bleedingDurationDays: Int? = null,
    @SerialName("has_blood_clots") val hasBloodClots: Boolean = false,
    @SerialName("pelvic_pain_score") val pelvicPainScore: Int = 0,
    @SerialName("free_text_notes") val freeTextNotes: String? = null,
    @SerialName("quick_flash_logged") val quickFlashLogged: Boolean = false
)

@Serializable
data class AssessmentResponse(
    val id: String,
    @SerialName("total_mrs_score") val totalMrsScore: Int? = null,
    @SerialName("streak_days") val streakDays: Int = 1,
    val message: String = "Assessment logged successfully"
)

// --- INTELLIGENT SYMPTOM INTAKE ---
@Serializable
data class ClassifySymptomsRequest(
    val text: String,
    @SerialName("input_method") val inputMethod: String = "text"
)

@Serializable
data class SymptomCategory(
    @SerialName("category_code") val categoryCode: String,
    @SerialName("category_name") val categoryName: String,
    val confidence: Float = 0.9f
)

@Serializable
data class ClassificationResult(
    @SerialName("extraction_id") val extractionId: String,
    val text: String,
    @SerialName("suggested_categories") val suggestedCategories: List<SymptomCategory> = emptyList()
)

@Serializable
data class ConfirmSymptomsRequest(
    @SerialName("confirmed_codes") val confirmedCodes: List<String>,
    @SerialName("rejected_codes") val rejectedCodes: List<String> = emptyList(),
    @SerialName("added_codes") val addedCodes: List<String> = emptyList()
)

// --- TRENDS & ANALYTICS ---
@Serializable
data class ChartPoint(
    val date: String,
    val score: Float,
    @SerialName("rolling_avg_7d") val rollingAvg7d: Float? = null,
    @SerialName("baseline_30d") val baseline30d: Float? = null
)

@Serializable
data class AnalyticsChartsDto(
    @SerialName("timeframe_days") val timeframeDays: Int = 30,
    @SerialName("overall_trend") val overallTrend: List<ChartPoint> = emptyList(),
    @SerialName("vasomotor_trend") val vasomotorTrend: List<ChartPoint> = emptyList(),
    @SerialName("sleep_trend") val sleepTrend: List<ChartPoint> = emptyList(),
    @SerialName("mood_trend") val moodTrend: List<ChartPoint> = emptyList(),
    @SerialName("cognitive_trend") val cognitiveTrend: List<ChartPoint> = emptyList(),
    @SerialName("narrative_summary") val narrativeSummary: String? = null
)

// --- MEDICATIONS & ADHERENCE ---
@Serializable
data class MedicationDto(
    val id: String,
    val name: String,
    val dosage: String,
    val frequency: String,
    @SerialName("time_of_day") val timeOfDay: String? = "Morning",
    @SerialName("is_taken_today") val isTakenToday: Boolean = false,
    val instructions: String? = null
)

@Serializable
data class CreateMedicationRequest(
    val name: String,
    val dosage: String,
    val frequency: String,
    @SerialName("time_of_day") val timeOfDay: String? = null,
    val instructions: String? = null
)

@Serializable
data class AdherenceStats(
    @SerialName("seven_day_percent") val sevenDayPercent: Int = 94,
    @SerialName("doses_taken") val dosesTaken: Int = 13,
    @SerialName("doses_prescribed") val dosesPrescribed: Int = 14
)

// --- LABS & DIAGNOSTICS ---
@Serializable
data class LabAnalyte(
    val name: String,
    val value: String,
    val unit: String,
    @SerialName("reference_range") val referenceRange: String,
    @SerialName("is_abnormal") val isAbnormal: Boolean = false
)

@Serializable
data class LabReportDto(
    val id: String,
    @SerialName("test_date") val testDate: String,
    @SerialName("panel_name") val panelName: String,
    val analytes: List<LabAnalyte> = emptyList(),
    @SerialName("is_verified") val isVerified: Boolean = false
)

// --- ALERTS & APPOINTMENTS ---
@Serializable
data class AlertDto(
    val id: String,
    val title: String,
    val message: String,
    @SerialName("severity_level") val severityLevel: String = "info", // "emergency", "urgent", "info"
    @SerialName("is_acknowledged") val isAcknowledged: Boolean = false,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class AppointmentDto(
    val id: String,
    @SerialName("scheduled_at") val scheduledAt: String,
    val reason: String,
    val status: String = "confirmed",
    @SerialName("doctor_name") val doctorName: String? = null,
    @SerialName("patient_name") val patientName: String? = null
)

@Serializable
data class RequestAppointmentRequest(
    val reason: String,
    @SerialName("requested_date") val requestedDate: String? = null,
    @SerialName("alert_id") val alertId: String? = null
)

// --- MESSAGES ---
@Serializable
data class MessageDto(
    val id: String,
    @SerialName("sender_id") val senderId: String,
    @SerialName("sender_name") val senderName: String,
    @SerialName("sender_role") val senderRole: String,
    val text: String,
    @SerialName("sent_at") val sentAt: String
)

@Serializable
data class SendMessageRequest(
    @SerialName("message_text") val messageText: String,
    @SerialName("patient_id") val patientId: String? = null
)

// --- DOCTOR COHORT & TRIAGE ---
@Serializable
data class DoctorOverviewDto(
    @SerialName("active_patients_count") val activePatientsCount: Int = 65,
    @SerialName("urgent_alerts_count") val urgentAlertsCount: Int = 3,
    @SerialName("pending_labs_count") val pendingLabsCount: Int = 4,
    @SerialName("telehealth_today_count") val telehealthTodayCount: Int = 2
)

@Serializable
data class DoctorPatientSummary(
    val id: String,
    @SerialName("full_name") val fullName: String,
    val age: Int,
    @SerialName("straw_stage") val strawStage: String,
    @SerialName("latest_mrs") val latestMrs: Int = 18,
    @SerialName("last_check_in") val lastCheckIn: String? = null,
    @SerialName("is_high_risk") val isHighRisk: Boolean = false,
    val phenotype: String = "Typical Perimenopause"
)

@Serializable
data class TriageTaskDto(
    val id: String,
    @SerialName("patient_id") val patientId: String,
    @SerialName("patient_name") val patientName: String,
    @SerialName("tier") val tier: String, // "Immediate", "Urgent", "Routine"
    val reason: String,
    val status: String = "pending"
)

@Serializable
data class HrtAdvisorRequest(
    val age: Int,
    @SerialName("has_uterus") val hasUterus: Boolean = true,
    @SerialName("primary_symptom") val primarySymptom: String = "vasomotor",
    @SerialName("has_migraine_with_aura") val hasMigraineWithAura: Boolean = false,
    @SerialName("has_history_dvt") val hasHistoryDvt: Boolean = false
)

@Serializable
data class HrtAdvisorResponse(
    @SerialName("recommended_regimen") val recommendedRegimen: String,
    @SerialName("estrogen_form") val estrogenForm: String,
    @SerialName("progestogen_form") val progestogenForm: String?,
    val rationale: String,
    val warnings: List<String> = emptyList()
)

@Serializable
data class ClinicalNoteDto(
    val id: String,
    @SerialName("created_at") val createdAt: String,
    val subjective: String,
    val objective: String,
    val assessment: String,
    val plan: String
)

@Serializable
data class CreateClinicalNoteRequest(
    val subjective: String,
    val objective: String,
    val assessment: String,
    val plan: String
)
