package com.menocare.app

import com.menocare.app.data.model.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.Assert.*
import org.junit.Test

class ClinicalModelTest {

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        encodeDefaults = true
    }

    @Test
    fun testLoginResponseSerialization() {
        val user = UserProfile("u-01", "elena@menocare.demo", "Elena Rostova", "patient")
        val response = LoginResponse("test-jwt-token", "bearer", user)
        val encoded = json.encodeToString(response)
        val decoded = json.decodeFromString<LoginResponse>(encoded)

        assertEquals("test-jwt-token", decoded.accessToken)
        assertEquals("Elena Rostova", decoded.user.fullName)
        assertEquals("patient", decoded.user.role)
    }

    @Test
    fun testDailyAssessmentRequestSerialization() {
        val req = DailyAssessmentRequest(
            vasomotorScore = 2,
            sleepScore = 1,
            moodScore = 0,
            cognitiveScore = 1,
            bleedingStatus = "spotting",
            pelvicPainScore = 2,
            freeTextNotes = "Woke up with night sweats and morning brain fog."
        )
        val encoded = json.encodeToString(req)
        val decoded = json.decodeFromString<DailyAssessmentRequest>(encoded)

        assertEquals(2, decoded.vasomotorScore)
        assertEquals("spotting", decoded.bleedingStatus)
        assertEquals("Woke up with night sweats and morning brain fog.", decoded.freeTextNotes)
    }

    @Test
    fun testAnalyticsChartPointSerialization() {
        val point = ChartPoint("2026-11-28", 14.5f, 13.2f, 12.0f)
        val chart = AnalyticsChartsDto(
            timeframeDays = 30,
            overallTrend = listOf(point),
            narrativeSummary = "Vasomotor episodes have stabilized."
        )
        val encoded = json.encodeToString(chart)
        val decoded = json.decodeFromString<AnalyticsChartsDto>(encoded)

        assertEquals(1, decoded.overallTrend.size)
        assertEquals(14.5f, decoded.overallTrend[0].score, 0.01f)
        assertEquals(30, decoded.timeframeDays)
    }

    @Test
    fun testMedicationAdherenceSerialization() {
        val stats = AdherenceStats(sevenDayPercent = 94, dosesTaken = 13, dosesPrescribed = 14)
        val encoded = json.encodeToString(stats)
        val decoded = json.decodeFromString<AdherenceStats>(encoded)

        assertEquals(94, decoded.sevenDayPercent)
        assertEquals(13, decoded.dosesTaken)
        assertEquals(14, decoded.dosesPrescribed)
    }

    @Test
    fun testMrsScoreCalculation() {
        val scores = listOf(1, 2, 0, 1, 3, 2, 1, 0, 1, 2, 1)
        val total = scores.sum()
        assertTrue("MRS score must be in range 0..44", total in 0..44)
        assertEquals(14, total)
    }

    @Test
    fun testDoctorCohortModelSerialization() {
        val patient = DoctorPatientSummary(
            id = "118D96BF",
            fullName = "Joshika Kelavi",
            age = 47,
            strawStage = "late_perimenopause",
            latestMrs = 26,
            isHighRisk = true,
            phenotype = "Late Perimenopause"
        )
        val encoded = json.encodeToString(patient)
        val decoded = json.decodeFromString<DoctorPatientSummary>(encoded)

        assertEquals("118D96BF", decoded.id)
        assertEquals(26, decoded.latestMrs)
        assertTrue(decoded.isHighRisk)
    }
}
