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
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.menocare.app.core.network.ApiClient
import com.menocare.app.core.theme.*
import com.menocare.app.data.model.DoctorPatientSummary
import kotlinx.coroutines.launch

data class ClinicalPatientDossierSummary(
    val id: String,
    val mrn: String,
    val name: String,
    val age: Int,
    val strawStage: String,
    val category: String, // "Red Flag", "Differential", "Stable"
    val clinicalFlag: String,
    val keyMetrics: String,
    val protocolCandidate: String,
    val isEmergency: Boolean = false
)

@Composable
fun CohortDirectoryScreen(
    onSelectPatient: (String) -> Unit
) {
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current
    val coroutineScope = rememberCoroutineScope()

    var searchQuery by remember { mutableStateOf("") }
    var selectedFilter by remember { mutableStateOf("All (9)") }
    var showEnrollDialog by remember { mutableStateOf(false) }

    val practiceCode = "DR-VANCE-77B"

    val patients = remember {
        listOf(
            ClinicalPatientDossierSummary(
                id = "118D96BF",
                mrn = "#MC-6621",
                name = "Claire Dupont",
                age = 55,
                strawStage = "STRAW +1a · Early Postmenopause",
                category = "Red Flag",
                clinicalFlag = "Postmenopausal Bleeding Surge",
                keyMetrics = "Stripe: 5.8mm · Pelvic US Pending · Bleed Peak D24",
                protocolCandidate = "AI Triage: 95% Endometrial Protocol (TVUS Required)",
                isEmergency = true
            ),
            ClinicalPatientDossierSummary(
                id = "8042MC",
                mrn = "#MC-8042",
                name = "Elena Rostova",
                age = 51,
                strawStage = "STRAW -1 · Late Transition",
                category = "Red Flag",
                clinicalFlag = "VMS Peak & Sleep Disruption",
                keyMetrics = "14 Flashes/Day · Sleep <4h (Insomnia) · HR Spike 110bpm",
                protocolCandidate = "Candidate: Transdermal MHT Titration Review",
                isEmergency = true
            ),
            ClinicalPatientDossierSummary(
                id = "23EC0D81",
                mrn = "#MC-23EC",
                name = "Priya Kapoor",
                age = 38,
                strawStage = "Reproductive · Phenotypic Mimic",
                category = "Differential",
                clinicalFlag = "PCOD / Hyperandrogenic Phenotype",
                keyMetrics = "LH:FSH 2.6:1 · Free T Pending · Insulin Lag Curve",
                protocolCandidate = "Metabolic Lab Sync & Endocrine Staging",
                isEmergency = false
            ),
            ClinicalPatientDossierSummary(
                id = "94CC944C",
                mrn = "#MC-94CC",
                name = "Sarah Jenkins",
                age = 44,
                strawStage = "STRAW -2 · Early Transition",
                category = "Differential",
                clinicalFlag = "Thyroid Drift vs Perimenopause Mimic",
                keyMetrics = "TSH: 4.8 mIU/L · Anti-TPO Elevated · Fatigue Trend",
                protocolCandidate = "Endocrine Differential Panel Ordered",
                isEmergency = false
            ),
            ClinicalPatientDossierSummary(
                id = "39BFF4FB",
                mrn = "#MC-39BF",
                name = "Martha Lind",
                age = 49,
                strawStage = "STRAW -1 · Late Transition",
                category = "Differential",
                clinicalFlag = "Bone Mineral Density Watch",
                keyMetrics = "Osteopenia Marker · DEXA T-Score: -1.6 · Vit D: 22 ng/mL",
                protocolCandidate = "Calcium + Vit D3 Protocol Titration",
                isEmergency = false
            ),
            ClinicalPatientDossierSummary(
                id = "5108MC",
                mrn = "#MC-5108",
                name = "Rachel B.",
                age = 47,
                strawStage = "STRAW -2 · Early Transition",
                category = "Stable",
                clinicalFlag = "Stabilized on Topical Progesterone",
                keyMetrics = "Symptom Score: 8/44 (Minimal) · 100% Adherence",
                protocolCandidate = "Routine 90-Day Telehealth Maintenance",
                isEmergency = false
            ),
            ClinicalPatientDossierSummary(
                id = "7291MC",
                mrn = "#MC-7291",
                name = "Chloe M.",
                age = 52,
                strawStage = "STRAW +1 · Early Postmenopause",
                category = "Stable",
                clinicalFlag = "Transdermal E2 0.05mg + Progesterone 100mg",
                keyMetrics = "VMS Reduced 85% · Sleep Score: 82/100",
                protocolCandidate = "Annual Mammogram & TVUS Schedule",
                isEmergency = false
            ),
            ClinicalPatientDossierSummary(
                id = "8832MC",
                mrn = "#MC-8832",
                name = "Diana K.",
                age = 46,
                strawStage = "STRAW -2 · Early Transition",
                category = "Stable",
                clinicalFlag = "Cycle Cadence Tracking",
                keyMetrics = "Regular 28-Day Cadence · Minimal Vasomotor Activity",
                protocolCandidate = "Longitudinal App Monitoring",
                isEmergency = false
            ),
            ClinicalPatientDossierSummary(
                id = "9901MC",
                mrn = "#MC-9901",
                name = "Ananya Deshmukh",
                age = 44,
                strawStage = "STRAW -1 · Late Transition",
                category = "Differential",
                clinicalFlag = "Cognitive Fog & Mood Swings",
                keyMetrics = "Focus Index -22% · Cortisol Curve Flattened",
                protocolCandidate = "Neuroendocrine Telehealth Evaluation",
                isEmergency = false
            )
        )
    }

    val filteredPatients = patients.filter { patient ->
        val matchesSearch = patient.name.contains(searchQuery, ignoreCase = true) ||
                patient.mrn.contains(searchQuery, ignoreCase = true) ||
                patient.clinicalFlag.contains(searchQuery, ignoreCase = true)
        val matchesFilter = when (selectedFilter) {
            "All (9)" -> true
            "Urgent (5)" -> patient.category == "Red Flag" || patient.isEmergency
            "Differentials (4)" -> patient.category == "Differential"
            "Stable (3)" -> patient.category == "Stable"
            else -> true
        }
        matchesSearch && matchesFilter
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Ivory)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item { Spacer(modifier = Modifier.height(4.dp)) }

        // --- PRACTICE NETWORK & PAIRING CODE HEADER ---
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
                        Text("Patient Cohort Directory", style = Typography.headlineMedium.copy(fontSize = 18.sp), color = Charcoal)
                        Text("Apollo Practice Network · Dept. of Endocrinology", style = Typography.bodyMedium.copy(fontSize = 11.sp))
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        IconButton(
                            onClick = { Toast.makeText(context, "Exporting cohort telemetry to HL7 CSV...", Toast.LENGTH_SHORT).show() },
                            modifier = Modifier.size(36.dp).background(SageSoft, RoundedCornerShape(10.dp))
                        ) {
                            Icon(Icons.Default.Download, contentDescription = "CSV", tint = SageDark, modifier = Modifier.size(18.dp))
                        }

                        Button(
                            onClick = { showEnrollDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream),
                            shape = RoundedCornerShape(10.dp),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Icon(Icons.Default.PersonAdd, contentDescription = "Enroll", modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Enroll", fontSize = 11.sp)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(SurfaceCard, RoundedCornerShape(12.dp))
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.VpnKey, contentDescription = "Key", tint = SageDark, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Pairing Code: $practiceCode", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Charcoal)
                    }
                    Text(
                        "Copy",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = SageDark,
                        modifier = Modifier.clickable {
                            clipboardManager.setText(AnnotatedString(practiceCode))
                            Toast.makeText(context, "Copied $practiceCode to clipboard", Toast.LENGTH_SHORT).show()
                        }
                    )
                }
            }
        }

        // --- SEARCH BAR ---
        item {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search patient name, MRN (#MC-8042), or clinical flag...", fontSize = 12.sp) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search", tint = CharcoalMuted) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = SageDark,
                    unfocusedBorderColor = BorderWarm,
                    focusedContainerColor = Cream,
                    unfocusedContainerColor = Cream
                )
            )
        }

        // --- FILTER CHIPS STRIP (STITCH SPEC) ---
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("All (9)", "Urgent (5)", "Differentials (4)", "Stable (3)").forEach { filter ->
                    val isSelected = selectedFilter == filter
                    val isUrgent = filter.contains("Urgent")
                    val containerColor = when {
                        isUrgent && isSelected -> ErrorRed
                        isUrgent -> ErrorContainer
                        isSelected -> SageDark
                        else -> Cream
                    }
                    val labelColor = when {
                        isUrgent && isSelected -> Cream
                        isUrgent -> ErrorRed
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
                            borderColor = if (isUrgent) ErrorRed.copy(alpha = 0.5f) else BorderWarm
                        ),
                        shape = RoundedCornerShape(10.dp)
                    )
                }
            }
        }

        // --- PATIENT DOSSIER CARDS (STITCH SPEC) ---
        items(filteredPatients) { pt ->
            val isUrgent = pt.isEmergency || pt.category == "Red Flag"
            val badgeBg = if (isUrgent) ErrorContainer else SageSoft
            val badgeColor = if (isUrgent) ErrorRed else SageDark

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Cream, RoundedCornerShape(16.dp))
                    .border(1.dp, if (isUrgent) ErrorRed.copy(alpha = 0.4f) else BorderWarm, RoundedCornerShape(16.dp))
                    .clickable { onSelectPatient(pt.id) }
                    .padding(16.dp)
            ) {
                // Header: Name, Age, MRN, Flag
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(pt.name, style = Typography.titleMedium.copy(fontSize = 15.sp), color = Charcoal)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("${pt.age}y", fontSize = 12.sp, color = CharcoalMuted)
                        }
                        Text("${pt.mrn} · ${pt.strawStage}", style = Typography.bodyMedium.copy(fontSize = 11.sp, color = CharcoalMuted))
                    }

                    Box(
                        modifier = Modifier
                            .background(badgeBg, RoundedCornerShape(8.dp))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(pt.clinicalFlag, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = badgeColor)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Clinical Telemetry Metrics Pill
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(SurfaceCard, RoundedCornerShape(10.dp))
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Text(
                        pt.keyMetrics,
                        style = Typography.bodyMedium.copy(fontSize = 11.sp, color = Charcoal, fontWeight = FontWeight.Medium)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Protocol Candidate / Action recommendation
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        pt.protocolCandidate,
                        style = Typography.bodyMedium.copy(fontSize = 11.sp, color = if (isUrgent) ErrorRed else SageDark, fontWeight = FontWeight.SemiBold),
                        modifier = Modifier.weight(1f)
                    )

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.clickable { onSelectPatient(pt.id) }
                    ) {
                        Text("Inspect Dossier", fontSize = 11.sp, color = SageDark, fontWeight = FontWeight.Bold)
                        Icon(Icons.Default.ChevronRight, contentDescription = "Inspect", tint = SageDark, modifier = Modifier.size(16.dp))
                    }
                }
            }
        }

        item { Spacer(modifier = Modifier.height(24.dp)) }
    }

    // Enroll Patient Dialog
    if (showEnrollDialog) {
        var newName by remember { mutableStateOf("") }
        var newAge by remember { mutableStateOf("") }
        var newStage by remember { mutableStateOf("Early Perimenopause") }

        AlertDialog(
            onDismissRequest = { showEnrollDialog = false },
            title = { Text("Enroll New Clinical Patient", style = Typography.headlineMedium.copy(fontSize = 18.sp), color = Charcoal) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = newName,
                        onValueChange = { newName = it },
                        label = { Text("Patient Full Name") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )
                    OutlinedTextField(
                        value = newAge,
                        onValueChange = { newAge = it },
                        label = { Text("Age") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )
                    Text("Auto-assigned Clinic Code: $practiceCode", fontSize = 11.sp, color = SageDark, fontWeight = FontWeight.SemiBold)
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newName.isNotBlank()) {
                            Toast.makeText(context, "Enrolled $newName. Pairing invitation sent.", Toast.LENGTH_SHORT).show()
                            showEnrollDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream)
                ) {
                    Text("Enroll Patient")
                }
            },
            dismissButton = {
                TextButton(onClick = { showEnrollDialog = false }) {
                    Text("Cancel", color = CharcoalMuted)
                }
            },
            containerColor = Cream
        )
    }
}
