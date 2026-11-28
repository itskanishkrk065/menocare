package com.menocare.app.ui.doctor

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.menocare.app.core.theme.*

data class ClinicalLabAnalyte(
    val name: String,
    val value: String,
    val unit: String,
    val refRange: String,
    val flag: String, // "NORMAL", "HIGH", "LOW", "CRITICAL"
    val prevValue: String? = null
)

data class ClinicalLabReport(
    val id: String,
    val patientName: String,
    val mrn: String,
    val testDate: String,
    val panelTitle: String,
    val analytes: listOfAnalyte = emptyList(),
    var isVerified: Boolean = false,
    var verifiedBy: String? = null,
    var verifiedAt: String? = null,
    var clinicalNotes: String = ""
)

typealias listOfAnalyte = List<ClinicalLabAnalyte>

@Composable
fun DiagnosticsScreen() {
    val context = LocalContext.current
    var selectedFilter by remember { mutableStateOf("All Panels (4)") }
    var showSignOffDialog by remember { mutableStateOf<ClinicalLabReport?>(null) }

    var reports by remember {
        mutableStateOf(
            listOf(
                ClinicalLabReport(
                    id = "rep-1",
                    patientName = "Claire Dupont",
                    mrn = "#MC-6621",
                    testDate = "Nov 27, 2026",
                    panelTitle = "Transvaginal Ultrasound (TVUS) & Endometrial Biopsy",
                    analytes = listOf(
                        ClinicalLabAnalyte("Endometrial Stripe Thickness", "5.8", "mm", "< 4.0 mm (Post)", "CRITICAL", "3.2 mm (Nov 2025)"),
                        ClinicalLabAnalyte("Myometrial Echotexture", "Heterogeneous", "", "Homogeneous", "HIGH"),
                        ClinicalLabAnalyte("Right Ovary Volume", "2.1", "mL", "1.2 - 3.8 mL", "NORMAL")
                    ),
                    isVerified = false,
                    clinicalNotes = "Urgent: Endometrial stripe >4mm in postmenopausal bleeding requires prompt histological biopsy evaluation."
                ),
                ClinicalLabReport(
                    id = "rep-2",
                    patientName = "Elena Rostova",
                    mrn = "#MC-8042",
                    testDate = "Nov 25, 2026",
                    panelTitle = "Comprehensive Endocrine & Hormone Panel",
                    analytes = listOf(
                        ClinicalLabAnalyte("17β-Estradiol (E2)", "38.2", "pg/mL", "30.0 - 400.0 pg/mL", "LOW", "24.1 pg/mL (Baseline)"),
                        ClinicalLabAnalyte("FSH (Follicle-Stimulating)", "48.2", "mIU/mL", "25.8 - 134.8 (Post)", "HIGH", "38.5 mIU/mL"),
                        ClinicalLabAnalyte("Progesterone (P4)", "0.4", "ng/mL", "0.2 - 1.5 ng/mL (Follicular)", "LOW"),
                        ClinicalLabAnalyte("Total Testosterone", "18.4", "ng/dL", "15.0 - 70.0 ng/dL", "NORMAL")
                    ),
                    isVerified = false,
                    clinicalNotes = "STRAW -1 transition confirmed. Estradiol rising on transdermal patch, consider titrating to 0.05mg."
                ),
                ClinicalLabReport(
                    id = "rep-3",
                    patientName = "Sarah Jenkins",
                    mrn = "#MC-94CC",
                    testDate = "Nov 22, 2026",
                    panelTitle = "Thyroid Differential & Antibody Panel",
                    analytes = listOf(
                        ClinicalLabAnalyte("TSH (Thyroid-Stimulating)", "4.82", "uIU/mL", "0.45 - 4.50 uIU/mL", "HIGH", "3.10 uIU/mL"),
                        ClinicalLabAnalyte("Free T4", "0.82", "ng/dL", "0.82 - 1.77 ng/dL", "LOW"),
                        ClinicalLabAnalyte("Anti-TPO Antibodies", "182.0", "IU/mL", "< 35.0 IU/mL", "HIGH", "Negative")
                    ),
                    isVerified = true,
                    verifiedBy = "Dr. Elena Vance, MD",
                    verifiedAt = "Nov 23, 2026",
                    clinicalNotes = "Subclinical autoimmune thyroiditis mimicking perimenopausal fatigue. Levothyroxine 25mcg initiated."
                ),
                ClinicalLabReport(
                    id = "rep-4",
                    patientName = "Priya Kapoor",
                    mrn = "#MC-23EC",
                    testDate = "Nov 20, 2026",
                    panelTitle = "Metabolic & Hyperandrogenic Marker Panel",
                    analytes = listOf(
                        ClinicalLabAnalyte("LH:FSH Ratio", "2.6:1", "ratio", "< 1.5:1", "HIGH"),
                        ClinicalLabAnalyte("Free Testosterone", "4.2", "pg/mL", "0.2 - 3.8 pg/mL", "HIGH"),
                        ClinicalLabAnalyte("Fasting Insulin", "18.4", "uIU/mL", "< 10.0 uIU/mL", "HIGH"),
                        ClinicalLabAnalyte("HbA1c", "5.6", "%", "< 5.7%", "NORMAL")
                    ),
                    isVerified = true,
                    verifiedBy = "Dr. Elena Vance, MD",
                    verifiedAt = "Nov 21, 2026",
                    clinicalNotes = "PCOS phenotype with metabolic insulin lag curve. Myo-inositol & metformin discussion recommended."
                )
            )
        )
    }

    val filteredReports = reports.filter { rep ->
        when (selectedFilter) {
            "All Panels (4)" -> true
            "Pending Sign-Off (2)" -> !rep.isVerified
            "Verified (2)" -> rep.isVerified
            else -> true
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Ivory)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item { Spacer(modifier = Modifier.height(4.dp)) }

        // --- PRACTICE LAB VAULT HEADER ---
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Cream, RoundedCornerShape(18.dp))
                    .border(1.dp, BorderWarm, RoundedCornerShape(18.dp))
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Practice Diagnostic Lab Vault", style = Typography.headlineMedium.copy(fontSize = 18.sp), color = Charcoal)
                        Text("Endocrine, ultrasound & biomarker review workspace", style = Typography.bodyMedium.copy(fontSize = 11.sp))
                    }
                    Box(
                        modifier = Modifier
                            .background(SageSoft, RoundedCornerShape(10.dp))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text("HL7 FHIR Lab Feed", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = SageDark)
                    }
                }
            }
        }

        // --- FILTER CHIPS ---
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("All Panels (4)", "Pending Sign-Off (2)", "Verified (2)").forEach { filter ->
                    val isSelected = selectedFilter == filter
                    val isPending = filter.contains("Pending")
                    val containerColor = when {
                        isPending && isSelected -> Peach
                        isPending -> PeachSoft
                        isSelected -> SageDark
                        else -> Cream
                    }
                    val labelColor = when {
                        isPending && isSelected -> Cream
                        isPending -> Peach
                        isSelected -> Cream
                        else -> Charcoal
                    }

                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedFilter = filter },
                        label = { Text(filter, fontSize = 11.sp, fontWeight = FontWeight.Medium) },
                        colors = FilterChipDefaults.filterChipColors(
                            containerColor = containerColor,
                            labelColor = labelColor,
                            selectedContainerColor = containerColor,
                            selectedLabelColor = labelColor
                        ),
                        border = FilterChipDefaults.filterChipBorder(
                            enabled = true,
                            selected = isSelected,
                            borderColor = if (isPending) Peach.copy(alpha = 0.5f) else BorderWarm
                        ),
                        shape = RoundedCornerShape(10.dp)
                    )
                }
            }
        }

        // --- LAB REPORT CARDS ---
        items(filteredReports) { rep ->
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Cream, RoundedCornerShape(16.dp))
                    .border(1.dp, if (!rep.isVerified) Peach.copy(alpha = 0.5f) else BorderWarm, RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(rep.patientName, style = Typography.titleMedium.copy(fontSize = 15.sp), color = Charcoal)
                        Text("${rep.mrn} · Test Date: ${rep.testDate}", fontSize = 11.sp, color = CharcoalMuted)
                    }

                    Box(
                        modifier = Modifier
                            .background(if (rep.isVerified) SageSoft else PeachSoft, RoundedCornerShape(8.dp))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(
                            if (rep.isVerified) "VERIFIED & SIGNED" else "PENDING SIGN-OFF",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (rep.isVerified) SageDark else Peach
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
                Text(rep.panelTitle, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = SageDark)

                Spacer(modifier = Modifier.height(10.dp))

                // Analytes Table
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(SurfaceCard, RoundedCornerShape(12.dp))
                        .padding(10.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    rep.analytes.forEach { analyte ->
                        val isCritical = analyte.flag == "CRITICAL"
                        val isAbnormal = analyte.flag == "HIGH" || analyte.flag == "LOW" || isCritical
                        val flagColor = if (isCritical) ErrorRed else if (isAbnormal) Peach else SageDark

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(analyte.name, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Charcoal)
                                Text("Ref: ${analyte.refRange}", fontSize = 9.sp, color = CharcoalMuted)
                                if (analyte.prevValue != null) {
                                    Text("Prior: ${analyte.prevValue}", fontSize = 9.sp, color = Teal)
                                }
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text("${analyte.value} ${analyte.unit}".trim(), fontSize = 12.sp, fontWeight = FontWeight.Bold, color = if (isAbnormal) flagColor else Charcoal)
                                Box(
                                    modifier = Modifier
                                        .background(flagColor.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
                                        .padding(horizontal = 5.dp, vertical = 1.dp)
                                ) {
                                    Text(analyte.flag, fontSize = 8.sp, fontWeight = FontWeight.Bold, color = flagColor)
                                }
                            }
                        }
                    }
                }

                if (rep.clinicalNotes.isNotBlank()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Clinical Note: ${rep.clinicalNotes}", fontSize = 11.sp, color = CharcoalMuted)
                }

                if (rep.isVerified) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Verified by: ${rep.verifiedBy} on ${rep.verifiedAt}", fontSize = 10.sp, color = SageDark, fontWeight = FontWeight.SemiBold)
                } else {
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = { showSignOffDialog = rep },
                        colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.Verified, contentDescription = "Sign Off", modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Sign-Off & Confirm Clinical Review", fontSize = 12.sp)
                    }
                }
            }
        }

        item { Spacer(modifier = Modifier.height(24.dp)) }
    }

    // --- DIALOG: CONFIRM CLINICAL SIGN-OFF ---
    showSignOffDialog?.let { rep ->
        var noteInput by remember { mutableStateOf(rep.clinicalNotes) }

        AlertDialog(
            onDismissRequest = { showSignOffDialog = null },
            title = { Text("Sign-Off Diagnostic Report", style = Typography.headlineMedium.copy(fontSize = 18.sp), color = Charcoal) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Patient: ${rep.patientName} (${rep.mrn})", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Charcoal)
                    Text("Panel: ${rep.panelTitle}", fontSize = 11.sp, color = SageDark)

                    OutlinedTextField(
                        value = noteInput,
                        onValueChange = { noteInput = it },
                        label = { Text("Clinician Diagnostic Interpretation Note") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )

                    Text(
                        "By signing off, you confirm you have evaluated these findings under ACOG & NAMS guidelines and approved the clinical care plan.",
                        fontSize = 10.sp,
                        color = CharcoalMuted
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        rep.isVerified = true
                        rep.verifiedBy = "Dr. Elena Vance, MD"
                        rep.verifiedAt = "Today, 10:45 AM"
                        rep.clinicalNotes = noteInput
                        Toast.makeText(context, "Diagnostic report signed off by Dr. Elena Vance, MD", Toast.LENGTH_SHORT).show()
                        showSignOffDialog = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream)
                ) {
                    Text("Sign & Authorize")
                }
            },
            dismissButton = {
                TextButton(onClick = { showSignOffDialog = null }) {
                    Text("Cancel", color = CharcoalMuted)
                }
            },
            containerColor = Cream
        )
    }
}
