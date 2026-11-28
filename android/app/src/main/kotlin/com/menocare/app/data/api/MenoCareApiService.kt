package com.menocare.app.data.api

import com.menocare.app.data.model.*
import retrofit2.http.*

interface MenoCareApiService {

    // --- AUTH ---
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse

    @GET("auth/me")
    suspend fun getMe(): UserProfile

    // --- PATIENTS ---
    @GET("patients/profile")
    suspend fun getPatientProfile(): PatientProfile

    @POST("patients/link-doctor")
    suspend fun linkDoctor(@Body body: Map<String, String>): Map<String, String>

    // --- ASSESSMENTS ---
    @GET("assessments/questions/sentinel")
    suspend fun getSentinelQuestions(): List<QuestionDto>

    @GET("assessments/questions/mrs")
    suspend fun getMrsQuestions(): List<QuestionDto>

    @POST("assessments/daily")
    suspend fun submitDailyAssessment(@Body request: DailyAssessmentRequest): AssessmentResponse

    @POST("assessments/baseline-mrs")
    suspend fun submitBaselineMrs(@Body answers: Map<String, Int>): AssessmentResponse

    @GET("assessments/history")
    suspend fun getAssessmentHistory(): List<Map<String, String>>

    // --- SYMPTOM INTAKE ---
    @POST("symptoms/classify")
    suspend fun classifySymptoms(@Body request: ClassifySymptomsRequest): ClassificationResult

    @POST("symptoms/{id}/confirm")
    suspend fun confirmSymptoms(
        @Path("id") extractionId: String,
        @Body request: ConfirmSymptomsRequest
    ): Map<String, String>

    // --- ANALYTICS ---
    @GET("analytics/charts")
    suspend fun getCharts(
        @Query("days") days: Int = 30,
        @Query("patient_id") patientId: String? = null
    ): AnalyticsChartsDto

    // --- MEDICATIONS ---
    @GET("medications/")
    suspend fun getMedications(@Query("patient_id") patientId: String? = null): List<MedicationDto>

    @POST("medications/")
    suspend fun createMedication(@Body request: CreateMedicationRequest): MedicationDto

    @POST("medications/{id}/toggle")
    suspend fun toggleMedication(@Path("id") medicationId: String): Map<String, String>

    @GET("medications/adherence")
    suspend fun getAdherenceStats(@Query("patient_id") patientId: String? = null): AdherenceStats

    // --- LABS ---
    @GET("labs/reports")
    suspend fun getLabReports(@Query("patient_id") patientId: String? = null): List<LabReportDto>

    // --- ALERTS & APPOINTMENTS ---
    @GET("alerts/")
    suspend fun getAlerts(): List<AlertDto>

    @POST("alerts/{id}/acknowledge")
    suspend fun acknowledgeAlert(@Path("id") alertId: String): Map<String, String>

    @GET("alerts/appointments")
    suspend fun getAppointments(): List<AppointmentDto>

    @POST("alerts/appointments")
    suspend fun requestAppointment(@Body request: RequestAppointmentRequest): AppointmentDto

    // --- MESSAGES ---
    @GET("messages/")
    suspend fun getMessages(@Query("patient_id") patientId: String? = null): List<MessageDto>

    @POST("messages/")
    suspend fun sendMessage(@Body request: SendMessageRequest): MessageDto

    // --- DOCTORS ---
    @GET("doctors/overview")
    suspend fun getDoctorOverview(): DoctorOverviewDto

    @GET("doctors/practice-code")
    suspend fun getPracticeCode(): Map<String, String>

    @GET("doctors/patients")
    suspend fun getAuthorizedPatients(): List<DoctorPatientSummary>

    @GET("doctors/patients/{id}/notes")
    suspend fun getPatientNotes(@Path("id") patientId: String): List<ClinicalNoteDto>

    @POST("doctors/patients/{id}/notes")
    suspend fun createPatientNote(
        @Path("id") patientId: String,
        @Body request: CreateClinicalNoteRequest
    ): ClinicalNoteDto

    @GET("triage/queue")
    suspend fun getTriageQueue(): List<TriageTaskDto>

    @POST("doctors/hrt-advisor")
    suspend fun evaluateHrtAdvisor(@Body request: HrtAdvisorRequest): HrtAdvisorResponse
}
