package com.menocare.app.ui.navigation

sealed class Screen(val route: String) {
    // Auth
    data object Login : Screen("login")

    // Patient Tabs
    data object PatientOverview : Screen("patient_overview")
    data object PatientTrends : Screen("patient_trends")
    data object PatientCare : Screen("patient_care")
    data object PatientCalendar : Screen("patient_calendar")
    data object PatientLabs : Screen("patient_labs")
    data object PatientTelehealth : Screen("patient_telehealth")
    data object PatientChat : Screen("patient_chat")

    // Doctor Tabs
    data object DoctorCommand : Screen("doctor_command")
    data object DoctorCohort : Screen("doctor_cohort")
    data object DoctorDossier : Screen("doctor_dossier/{patientId}") {
        fun createRoute(patientId: String) = "doctor_dossier/$patientId"
    }
    data object DoctorVisits : Screen("doctor_visits")
    data object DoctorDiagnostics : Screen("doctor_diagnostics")
    data object DoctorChat : Screen("doctor_chat")
}
