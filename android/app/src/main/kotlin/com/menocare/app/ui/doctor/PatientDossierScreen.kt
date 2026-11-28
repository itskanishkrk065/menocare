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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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
import com.menocare.app.core.network.ApiClient
import com.menocare.app.core.theme.*
import com.menocare.app.data.model.ClinicalNoteDto
import com.menocare.app.data.model.CreateClinicalNoteRequest
import kotlinx.coroutines.launch

@Composable
fun PatientDossierScreen(
    patientId: String,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var selectedTab by remember { mutableStateOf("Overview") }
    var showSoapDialog by remember { mutableStateOf(false) }
    var showTitrationDialog by remember { mutableStateOf(false) }
    var showOrderLabsDialog by remember { mutableStateOf(false) }

    // Patient Clinical Record
    val patientName = when (patientId) {
        "118D96BF" -> "Claire Dupont"
        "8042MC" -> "Elena Rostova"
        "23EC0D81" -> "Priya Kapoor"
        else -> "Elena Rostova"
    }
    val patientAge = if (patientId == "118D96BF") 55 else 48
    val mrn = if (patientId == "118D96BF") "#MC-6621" else "#MC-8042"
    val strawStage = if (patientId == "118D96BF") "STRAW +1a · Postmenopausal" else "STRAW -1 · Late Perimenopause"

    var notes by remember {
        mutableStateOf(
            listOf(
                ClinicalNoteDto(
                    id = "n1",
                    createdAt = "Today, 09:15 AM",
                    subjective = "Patient reports acute nocturnal heat surges waking her at 03:15 AM with severe diaphoresis and tachycardia. Oura sleep index dropped to 58.",
                    objective = "Resting HR 68 bpm. Nocturnal skin temp spike +1.4°F. Pelvic ultrasound: endometrial stripe 3.2mm. Intact uterus confirmed.",
                    assessment = "Late perimenopausal vasomotor instability with secondary sleep fragmentation. Safe for transdermal estrogen titration.",
                    plan = "Titrate 17β-Estradiol patch to 0.05mg/day bi-weekly. Maintain micronized progesterone at 100mg PO continuous nightly for endometrial protection."
                ),
                ClinicalNoteDto(
                    id = "n2",
                    createdAt = "Nov 12, 2026",
                    subjective = "Baseline consultation for perimenopausal transition. Complained of irregular cycle cadence and moderate mood fluctuations.",
                    objective = "FSH: 48.2 mIU/mL, Estradiol: 38 pg/mL. Mammogram BIRADS-1 normal.",
                    assessment = "STRAW Stage -1 onset. Normal baseline risk profile.",
                    plan = "Started trial of 0.025mg patch + 100mg progesterone. Daily symptom app tracking initiated."
                )
            )
        )
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Ivory)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item { Spacer(modifier = Modifier.height(4.dp)) }

        // --- BACK BUTTON & DOSSIER BREADCRUMB ---
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Button(
                    onClick = onNavigateBack,
                    colors = ButtonDefaults.buttonColors(containerColor = SageSoft, contentColor = SageDark),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("← Cohort Directory", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                }

                Box(
                    modifier = Modifier
                        .background(SageSoft, RoundedCornerShape(10.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text("EHR: $mrn", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = SageDark)
                }
            }
        }

        // --- 1. PATIENT IDENTITY & REPRODUCTIVE CONTEXT CARD (STITCH SPEC) ---
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Cream, RoundedCornerShape(20.dp))
                    .border(1.dp, BorderWarm, RoundedCornerShape(20.dp))
                    .padding(18.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(patientName, style = Typography.headlineMedium.copy(fontSize = 20.sp), color = Charcoal)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("$patientAge yrs", fontSize = 13.sp, color = CharcoalMuted)
                        }
                        Text("$mrn · BMI 24.2 kg/m²", style = Typography.bodyMedium.copy(fontSize = 11.sp, color = CharcoalMuted))
                    }

                    Box(
                        modifier = Modifier
                            .background(SageSoft, RoundedCornerShape(10.dp))
                            .border(1.dp, SageAccent, RoundedCornerShape(10.dp))
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(strawStage, style = Typography.labelSmall.copy(color = SageDark, fontSize = 10.sp, fontWeight = FontWeight.Bold))
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // MANDATORY CLINICAL SAFETY INDICATOR: INTACT UTERUS STATUS
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(SurfaceCard, RoundedCornerShape(12.dp))
                        .border(1.dp, BorderWarm, RoundedCornerShape(12.dp))
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.HealthAndSafety, contentDescription = "Safety", tint = SageDark, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("Intact Uterus Confirmed", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Charcoal)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("ACOG & NAMS Rule", fontSize = 10.sp, color = SageDark, fontWeight = FontWeight.SemiBold)
                        }
                        Text(
                            "Systemic estrogen must remain paired with therapeutic micronized progesterone to prevent endometrial hyperplasia.",
                            style = Typography.bodyMedium.copy(fontSize = 10.sp, color = CharcoalMuted)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Care Lead Details
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Attending: Dr. Elena Vance, MD · NAMS Certified", fontSize = 11.sp, color = CharcoalMuted)
                    Text("Regimen: Active Titration", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = SageDark)
                }
            }
        }

        // --- 2. DOSSIER SUB-NAVIGATION TABS ---
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("Overview", "Telemetry & Trends", "Biomarkers & Labs", "HRT Protocol", "SOAP Notes").forEach { tab ->
                    val isSelected = selectedTab == tab
                    Box(
                        modifier = Modifier
                            .background(if (isSelected) SageDark else Cream, RoundedCornerShape(12.dp))
                            .border(1.dp, if (isSelected) SageDark else BorderWarm, RoundedCornerShape(12.dp))
                            .clickable { selectedTab = tab }
                            .padding(horizontal = 14.dp, vertical = 8.dp)
                    ) {
                        Text(
                            tab,
                            fontSize = 11.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) Cream else Charcoal
                        )
                    }
                }
            }
        }

        // --- 3. DYNAMIC TAB CONTENT ---
        when (selectedTab) {
            "Overview" -> {
                // Live Biometrics Grid (Stitch Spec)
                item {
                    Text("Continuous Physiological Telemetry", style = Typography.titleMedium.copy(fontSize = 14.sp), color = Charcoal)
                }

                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        DossierTelemetryCard(Modifier.weight(1f), "Resting HR", "68 bpm", "Nocturnal Baseline", Icons.Default.Favorite, SageDark)
                        DossierTelemetryCard(Modifier.weight(1f), "Skin Temp", "+0.2°C", "3:18 AM Surge (+1.4°F)", Icons.Default.Thermostat, Peach)
                    }
                }

                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        DossierTelemetryCard(Modifier.weight(1f), "Sleep Score", "58/100", "Restless (Wake 3:15 AM)", Icons.Default.Bedtime, Teal)
                        DossierTelemetryCard(Modifier.weight(1f), "Night Flushes", "4 / night", "Moderate-High Surge", Icons.Default.Whatshot, ErrorRed)
                    }
                }

                // MRS 8-Domain Severity Breakdown
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Cream, RoundedCornerShape(16.dp))
                            .border(1.dp, BorderWarm, RoundedCornerShape(16.dp))
                            .padding(16.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Menopause Rating Scale (MRS)", style = Typography.titleMedium.copy(fontSize = 14.sp), color = Charcoal)
                            Text("Total: 14/44 (Mild/Mod)", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = SageDark)
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        DomainScoreRow("Somatic-Vegetative", "Hot flushes, sleep, heart discomfort", "8/16", Peach)
                        HorizontalDivider(color = BorderWarm, modifier = Modifier.padding(vertical = 8.dp))
                        DomainScoreRow("Psychological", "Depressive mood, irritability, anxiety", "4/16", Teal)
                        HorizontalDivider(color = BorderWarm, modifier = Modifier.padding(vertical = 8.dp))
                        DomainScoreRow("Urogenital", "Sexual comfort, bladder, dryness", "2/12", SageDark)
                    }
                }
            }

            "Telemetry & Trends" -> {
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Cream, RoundedCornerShape(16.dp))
                            .border(1.dp, BorderWarm, RoundedCornerShape(16.dp))
                            .padding(16.dp)
                    ) {
                        Text("30-Day Longitudinal Vasomotor Trend", style = Typography.titleMedium.copy(fontSize = 14.sp), color = Charcoal)
                        Text("Telemetry aggregated from wearable sync & patient daily check-ins.", style = Typography.bodyMedium.copy(fontSize = 11.sp))
                        Spacer(modifier = Modifier.height(14.dp))

                        // Daily Trend Rows
                        listOf(
                            Triple("Today (Day 30)", "3 Flashes", "Sleep: 82% · Estrogen Patch Active"),
                            Triple("Nov 27 (Day 29)", "4 Flashes", "Sleep: 58% · Nocturnal surge 3:15 AM"),
                            Triple("Nov 26 (Day 28)", "2 Flashes", "Sleep: 76% · Stable cadence"),
                            Triple("Nov 25 (Day 27)", "3 Flashes", "Sleep: 80% · Normal daytime activity")
                        ).forEach { (day, fl, note) ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(SurfaceCard, RoundedCornerShape(10.dp))
                                    .padding(10.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(day, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Charcoal)
                                    Text(note, fontSize = 10.sp, color = CharcoalMuted)
                                }
                                Box(
                                    modifier = Modifier
                                        .background(PeachSoft, RoundedCornerShape(6.dp))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(fl, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Peach)
                                }
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                        }
                    }
                }
            }

            "Biomarkers & Labs" -> {
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Cream, RoundedCornerShape(16.dp))
                            .border(1.dp, BorderWarm, RoundedCornerShape(16.dp))
                            .padding(16.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Endocrine Analyte Panel", style = Typography.titleMedium.copy(fontSize = 14.sp), color = Charcoal)
                            Text("Tested: Nov 15, 2026", fontSize = 10.sp, color = CharcoalMuted)
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        AnalyteResultRow("17β-Estradiol (E2)", "38.2 pg/mL", "30.0 - 400.0 pg/mL", "Borderline Low", false)
                        HorizontalDivider(color = BorderWarm, modifier = Modifier.padding(vertical = 8.dp))
                        AnalyteResultRow("FSH (Follicle-Stimulating)", "48.2 mIU/mL", "25.8 - 134.8 (Post)", "Elevated (STRAW -1)", true)
                        HorizontalDivider(color = BorderWarm, modifier = Modifier.padding(vertical = 8.dp))
                        AnalyteResultRow("Progesterone", "0.4 ng/mL", "0.2 - 1.5 ng/mL (Follicular)", "Low Anovulatory", false)
                        HorizontalDivider(color = BorderWarm, modifier = Modifier.padding(vertical = 8.dp))
                        AnalyteResultRow("TSH (Thyroid)", "2.14 uIU/mL", "0.45 - 4.50 uIU/mL", "Normal Euthyroid", false)
                    }
                }
            }

            "HRT Protocol" -> {
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Cream, RoundedCornerShape(16.dp))
                            .border(1.dp, BorderWarm, RoundedCornerShape(16.dp))
                            .padding(16.dp)
                    ) {
                        Text("Active Hormone Therapy Protocol", style = Typography.titleMedium.copy(fontSize = 14.sp), color = Charcoal)
                        Text("NAMS 2023 / BMS 2023 Clinical Regimen Guidelines", style = Typography.bodyMedium.copy(fontSize = 11.sp))

                        Spacer(modifier = Modifier.height(14.dp))

                        // Medication 1: Estradiol Patch
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(SurfaceCard, RoundedCornerShape(12.dp))
                                .border(1.dp, BorderWarm, RoundedCornerShape(12.dp))
                                .padding(12.dp)
                        ) {
                            Column {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("17β-Estradiol Transdermal Patch", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Charcoal)
                                    Text("0.05 mg/day", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = SageDark)
                                }
                                Text("Bi-weekly transdermal matrix patch · Lower abdomen placement", fontSize = 11.sp, color = CharcoalMuted)
                                Text("Prescribed: Nov 15, 2026 · Refills: 3 remaining", fontSize = 10.sp, color = CharcoalMuted)
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Medication 2: Micronized Progesterone
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(SurfaceCard, RoundedCornerShape(12.dp))
                                .border(1.dp, BorderWarm, RoundedCornerShape(12.dp))
                                .padding(12.dp)
                        ) {
                            Column {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("Micronized Progesterone (Prometrium)", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Charcoal)
                                    Text("100 mg PO", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = SageDark)
                                }
                                Text("Continuous oral nightly at bedtime · Endometrial protection", fontSize = 11.sp, color = CharcoalMuted)
                                Text("Prescribed: Nov 15, 2026 · Refills: 3 remaining", fontSize = 10.sp, color = CharcoalMuted)
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        Button(
                            onClick = { showTitrationDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.Tune, contentDescription = "Titrate", modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Open Clinical Titration Calculator", fontSize = 12.sp)
                        }
                    }
                }
            }

            "SOAP Notes" -> {
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Clinical Documentation (SOAP)", style = Typography.titleMedium.copy(fontSize = 15.sp), color = Charcoal)
                        Button(
                            onClick = { showSoapDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream),
                            shape = RoundedCornerShape(10.dp),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = "Add", modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("New Note", fontSize = 11.sp)
                        }
                    }
                }

                items(notes) { note ->
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Cream, RoundedCornerShape(16.dp))
                            .border(1.dp, BorderWarm, RoundedCornerShape(16.dp))
                            .padding(16.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Encounter: ${note.createdAt}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Charcoal)
                            Box(
                                modifier = Modifier
                                    .background(SageSoft, RoundedCornerShape(6.dp))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text("SIGNED", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = SageDark)
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))
                        SoapSection("S (Subjective)", note.subjective)
                        SoapSection("O (Objective)", note.objective)
                        SoapSection("A (Assessment)", note.assessment)
                        SoapSection("P (Plan)", note.plan)
                    }
                }
            }
        }

        // --- 4. ACTION BAR (TITRATE HRT, ORDER LABS, NEW NOTE) ---
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = { showOrderLabsDialog = true },
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.weight(1f).height(46.dp)
                ) {
                    Icon(Icons.Default.Science, contentDescription = "Labs", modifier = Modifier.size(16.dp), tint = Charcoal)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Order Labs", fontSize = 11.sp, color = Charcoal)
                }

                Button(
                    onClick = { showSoapDialog = true },
                    colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.weight(1f).height(46.dp)
                ) {
                    Icon(Icons.Default.EditNote, contentDescription = "SOAP", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add SOAP", fontSize = 11.sp)
                }
            }
        }

        item { Spacer(modifier = Modifier.height(24.dp)) }
    }

    // --- DIALOG: NEW SOAP NOTE ---
    if (showSoapDialog) {
        var sText by remember { mutableStateOf("") }
        var oText by remember { mutableStateOf("") }
        var aText by remember { mutableStateOf("") }
        var pText by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showSoapDialog = false },
            title = { Text("New Clinical SOAP Note", style = Typography.headlineMedium.copy(fontSize = 18.sp), color = Charcoal) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = sText,
                        onValueChange = { sText = it },
                        label = { Text("Subjective (Patient Reported)") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )
                    OutlinedTextField(
                        value = oText,
                        onValueChange = { oText = it },
                        label = { Text("Objective (Biometrics, Vitals, Labs)") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )
                    OutlinedTextField(
                        value = aText,
                        onValueChange = { aText = it },
                        label = { Text("Assessment (Clinical Impression)") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )
                    OutlinedTextField(
                        value = pText,
                        onValueChange = { pText = it },
                        label = { Text("Plan (Medications, Follow-up)") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (sText.isNotBlank() || aText.isNotBlank()) {
                            val newNote = ClinicalNoteDto("n-${System.currentTimeMillis()}", "Just now", sText, oText, aText, pText)
                            notes = listOf(newNote) + notes
                            Toast.makeText(context, "SOAP Note saved and signed", Toast.LENGTH_SHORT).show()
                            showSoapDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream)
                ) {
                    Text("Sign & Save Note")
                }
            },
            dismissButton = {
                TextButton(onClick = { showSoapDialog = false }) {
                    Text("Cancel", color = CharcoalMuted)
                }
            },
            containerColor = Cream
        )
    }

    // --- DIALOG: CLINICAL TITRATION CALCULATOR ---
    if (showTitrationDialog) {
        var patchDose by remember { mutableStateOf("0.05 mg/day") }
        var progestDose by remember { mutableStateOf("100 mg continuous PO") }

        AlertDialog(
            onDismissRequest = { showTitrationDialog = false },
            title = { Text("HRT Titration Decision Support", style = Typography.headlineMedium.copy(fontSize = 18.sp), color = Charcoal) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Safety Guideline Check: Intact uterus detected. Continuous progestogen required.", fontSize = 11.sp, color = SageDark, fontWeight = FontWeight.Bold)

                    Text("Transdermal 17β-Estradiol Dose:", fontSize = 12.sp, color = Charcoal)
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf("0.025 mg", "0.05 mg", "0.075 mg", "0.1 mg").forEach { d ->
                            val isSel = patchDose.startsWith(d)
                            Box(
                                modifier = Modifier
                                    .background(if (isSel) SageDark else OatLight, RoundedCornerShape(8.dp))
                                    .clickable { patchDose = "$d/day" }
                                    .padding(horizontal = 8.dp, vertical = 6.dp)
                            ) {
                                Text(d, fontSize = 10.sp, color = if (isSel) Cream else Charcoal)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Micronized Progesterone Dose:", fontSize = 12.sp, color = Charcoal)
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf("100 mg (Continuous)", "200 mg (Sequential)").forEach { p ->
                            val isSel = progestDose.startsWith(p.substring(0, 6))
                            Box(
                                modifier = Modifier
                                    .background(if (isSel) SageDark else OatLight, RoundedCornerShape(8.dp))
                                    .clickable { progestDose = p }
                                    .padding(horizontal = 8.dp, vertical = 6.dp)
                            ) {
                                Text(p, fontSize = 10.sp, color = if (isSel) Cream else Charcoal)
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        Toast.makeText(context, "Titration protocol updated: $patchDose + $progestDose", Toast.LENGTH_SHORT).show()
                        showTitrationDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream)
                ) {
                    Text("Confirm Protocol")
                }
            },
            dismissButton = {
                TextButton(onClick = { showTitrationDialog = false }) {
                    Text("Cancel", color = CharcoalMuted)
                }
            },
            containerColor = Cream
        )
    }

    // --- DIALOG: ORDER LABS ---
    if (showOrderLabsDialog) {
        AlertDialog(
            onDismissRequest = { showOrderLabsDialog = false },
            title = { Text("Order Laboratory Diagnostics", style = Typography.headlineMedium.copy(fontSize = 18.sp), color = Charcoal) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Select panel to order for $patientName ($mrn):", fontSize = 12.sp)
                    listOf(
                        "Comprehensive Endocrine Panel (E2, P4, FSH, LH)",
                        "Thyroid Differential Panel (TSH, Free T4, Anti-TPO)",
                        "Transvaginal Ultrasound (TVUS) - Endometrial Stripe",
                        "Metabolic & Lipid Panel (HbA1c, Fasting Lipid)"
                    ).forEach { panel ->
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(SurfaceCard, RoundedCornerShape(10.dp))
                                .clickable {
                                    Toast.makeText(context, "Ordered $panel for $patientName", Toast.LENGTH_SHORT).show()
                                    showOrderLabsDialog = false
                                }
                                .padding(10.dp)
                        ) {
                            Text(panel, fontSize = 11.sp, color = Charcoal, fontWeight = FontWeight.Medium)
                        }
                    }
                }
            },
            confirmButton = {},
            dismissButton = {
                TextButton(onClick = { showOrderLabsDialog = false }) {
                    Text("Close", color = CharcoalMuted)
                }
            },
            containerColor = Cream
        )
    }
}

@Composable
private fun DossierTelemetryCard(
    modifier: Modifier,
    title: String,
    value: String,
    subtext: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconColor: Color
) {
    Column(
        modifier = modifier
            .background(Cream, RoundedCornerShape(14.dp))
            .border(1.dp, BorderWarm, RoundedCornerShape(14.dp))
            .padding(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(title, fontSize = 11.sp, color = CharcoalMuted)
            Icon(icon, contentDescription = title, tint = iconColor, modifier = Modifier.size(16.dp))
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(value, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Charcoal)
        Text(subtext, fontSize = 9.sp, color = CharcoalMuted)
    }
}

@Composable
private fun DomainScoreRow(title: String, desc: String, score: String, color: Color) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(title, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Charcoal)
            Text(desc, fontSize = 10.sp, color = CharcoalMuted)
        }
        Box(
            modifier = Modifier
                .background(color.copy(alpha = 0.15f), RoundedCornerShape(6.dp))
                .padding(horizontal = 8.dp, vertical = 2.dp)
        ) {
            Text(score, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = color)
        }
    }
}

@Composable
private fun AnalyteResultRow(name: String, value: String, refRange: String, flag: String, isAbnormal: Boolean) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(name, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Charcoal)
            Text("Ref: $refRange", fontSize = 10.sp, color = CharcoalMuted)
        }
        Column(horizontalAlignment = Alignment.End) {
            Text(value, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = if (isAbnormal) ErrorRed else Charcoal)
            Text(flag, fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = if (isAbnormal) ErrorRed else SageDark)
        }
    }
}

@Composable
private fun SoapSection(label: String, content: String) {
    Column(modifier = Modifier.padding(vertical = 3.dp)) {
        Text(label, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = SageDark)
        Text(content, fontSize = 11.sp, color = Charcoal)
    }
}
