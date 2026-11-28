package com.menocare.app.ui.doctor

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.MedicalServices
import androidx.compose.material.icons.filled.NoteAdd
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.menocare.app.core.network.ApiClient
import com.menocare.app.core.theme.*
import com.menocare.app.data.model.ClinicalNoteDto
import com.menocare.app.data.model.CreateClinicalNoteRequest
import com.menocare.app.data.model.HrtAdvisorRequest
import kotlinx.coroutines.launch

@Composable
fun PatientDossierScreen(
    patientId: String,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var showSoapDialog by remember { mutableStateOf(false) }
    var showHrtDialog by remember { mutableStateOf(false) }

    var notes by remember {
        mutableStateOf(
            listOf(
                ClinicalNoteDto("n1", "Nov 15, 2026", "Patient reports sudden onset nocturnal vasomotor surges 3-4x/night with severe sleep disruption.", "Pelvic ultrasound reveals normal endometrial thickness (3.2mm). FSH: 48.2 mIU/mL.", "Symptomatic Perimenopause with predominant vasomotor instability.", "Initiate transdermal Estradiol 0.05 mg/day patch + Micronized Progesterone 100 mg continuous nightly.")
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
        item {
            Button(
                onClick = onNavigateBack,
                colors = ButtonDefaults.buttonColors(containerColor = SageSoft, contentColor = SageDark),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.padding(vertical = 4.dp)
            ) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("← Back to Cohort Directory", fontSize = 12.sp, fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold)
            }
        }

        // Longitudinal EHR Header
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Cream, RoundedCornerShape(18.dp))
                    .border(1.dp, BorderWarm, RoundedCornerShape(18.dp))
                    .padding(18.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Joshika Kelavi (#$patientId)", style = Typography.headlineMedium.copy(fontSize = 18.sp), color = Charcoal)
                        Text("Age 47 · Late Perimenopause (STRAW+10 Criteria)", style = Typography.bodyMedium.copy(fontSize = 11.sp))
                    }
                    Box(modifier = Modifier.background(ErrorContainer, RoundedCornerShape(8.dp)).padding(horizontal = 8.dp, vertical = 4.dp)) {
                        Text("HIGH URGENCY", fontSize = 9.sp, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold, color = ErrorRed)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = { showHrtDialog = true },
                        colors = ButtonDefaults.buttonColors(containerColor = Teal, contentColor = Cream),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.MedicalServices, contentDescription = "HRT", modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("HRT Advisor", fontSize = 11.sp)
                    }

                    Button(
                        onClick = { showSoapDialog = true },
                        colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.NoteAdd, contentDescription = "SOAP", modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Add SOAP Note", fontSize = 11.sp)
                    }
                }
            }
        }

        // Clinical Interventions
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(SurfaceCard, RoundedCornerShape(16.dp))
                    .border(1.dp, BorderWarm, RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Text("Order Clinical Interventions", style = Typography.titleMedium.copy(fontSize = 13.sp), color = Charcoal)
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = { Toast.makeText(context, "Pelvic Ultrasound ordered.", Toast.LENGTH_SHORT).show() },
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Pelvic Ultrasound", fontSize = 10.sp, color = Charcoal)
                    }

                    OutlinedButton(
                        onClick = { Toast.makeText(context, "Endocrine Panel ordered.", Toast.LENGTH_SHORT).show() },
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Endocrine Panel", fontSize = 10.sp, color = Charcoal)
                    }
                }
            }
        }

        // SOAP Notes Feed
        item {
            Text("Clinical Notes & Care Plans", style = Typography.titleMedium, color = Charcoal)
        }

        items(notes.size) { idx ->
            val note = notes[idx]
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(SurfaceCard, RoundedCornerShape(16.dp))
                    .border(1.dp, BorderWarm, RoundedCornerShape(16.dp))
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Documented on ${note.createdAt}", style = Typography.labelSmall.copy(color = CharcoalMuted))
                    Text("Dr. Elena Vance, MD", style = Typography.labelSmall.copy(color = SageDark, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold))
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text("S (Subjective): ${note.subjective}", style = Typography.bodyMedium.copy(fontSize = 11.sp, color = Charcoal))
                Text("O (Objective): ${note.objective}", style = Typography.bodyMedium.copy(fontSize = 11.sp, color = Charcoal))
                Text("A (Assessment): ${note.assessment}", style = Typography.bodyMedium.copy(fontSize = 11.sp, color = Charcoal))
                Text("P (Plan): ${note.plan}", style = Typography.bodyMedium.copy(fontSize = 11.sp, color = SageDark, fontWeight = androidx.compose.ui.text.font.FontWeight.Medium))
            }
        }

        item { Spacer(modifier = Modifier.height(24.dp)) }
    }

    if (showHrtDialog) {
        AlertDialog(
            onDismissRequest = { showHrtDialog = false },
            containerColor = Cream,
            title = { Text("Clinical Decision Support: HRT Advisor", style = Typography.headlineMedium.copy(fontSize = 16.sp), color = Charcoal) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Evidence-Based Protocol: NAMS 2024 Guidelines", style = Typography.labelSmall.copy(color = SageDark))
                    Text("Recommended Regimen: Transdermal Estradiol 0.05 mg/day patch + Oral Micronized Progesterone 100 mg continuous nightly.", style = Typography.bodyMedium.copy(fontSize = 12.sp, color = Charcoal))
                    Text("Rationale: Uterus is intact; micronized progesterone is required for endometrial protection against hyperplasia.", style = Typography.bodyMedium.copy(fontSize = 11.sp, color = CharcoalMuted))
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        Toast.makeText(context, "Regimen applied to patient care plan", Toast.LENGTH_SHORT).show()
                        showHrtDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream)
                ) {
                    Text("Adopt Recommendation")
                }
            },
            dismissButton = {
                TextButton(onClick = { showHrtDialog = false }) { Text("Close", color = CharcoalMuted) }
            }
        )
    }

    if (showSoapDialog) {
        var s by remember { mutableStateOf("") }
        var o by remember { mutableStateOf("") }
        var a by remember { mutableStateOf("") }
        var p by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showSoapDialog = false },
            containerColor = Cream,
            title = { Text("New Clinical SOAP Note", style = Typography.headlineMedium.copy(fontSize = 16.sp), color = Charcoal) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(value = s, onValueChange = { s = it }, label = { Text("Subjective (S)") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = o, onValueChange = { o = it }, label = { Text("Objective (O)") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = a, onValueChange = { a = it }, label = { Text("Assessment (A)") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = p, onValueChange = { p = it }, label = { Text("Plan (P)") }, modifier = Modifier.fillMaxWidth())
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (s.isNotBlank() && p.isNotBlank()) {
                            val newNote = ClinicalNoteDto("${notes.size + 1}", "Today", s, o, a, p)
                            notes = notes + newNote
                            coroutineScope.launch {
                                try { ApiClient.service.createPatientNote(patientId, CreateClinicalNoteRequest(s, o, a, p)) } catch (e: Exception) {}
                            }
                            showSoapDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream)
                ) {
                    Text("Sign & Save Note")
                }
            },
            dismissButton = {
                TextButton(onClick = { showSoapDialog = false }) { Text("Cancel", color = CharcoalMuted) }
            }
        )
    }
}
