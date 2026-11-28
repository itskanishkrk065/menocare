package com.menocare.app.ui.doctor

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.menocare.app.core.theme.*
import com.menocare.app.data.model.AppointmentDto

@Composable
fun ConsultationsScreen() {
    val context = LocalContext.current
    var showScheduleDialog by remember { mutableStateOf(false) }
    var inCallEncounterOpen by remember { mutableStateOf(false) }

    var appointments by remember {
        mutableStateOf(
            listOf(
                AppointmentDto("apt-1", "Today, 10:30 AM", "HRT Titration & Vasomotor Evaluation", "In Lobby", null, "Elena Rostova (#MC-8042)"),
                AppointmentDto("apt-2", "Today, 02:00 PM", "Postmenopausal Bleeding & Ultrasound Review", "Confirmed", null, "Claire Dupont (#MC-6621)"),
                AppointmentDto("apt-3", "Tomorrow, 10:00 AM", "Initial Metabolic & PCOS Differential Review", "Confirmed", null, "Priya Kapoor (#MC-23EC)"),
                AppointmentDto("apt-4", "Dec 02, 11:30 AM", "Thyroid Autoantibody Titration Review", "Scheduled", null, "Sarah Jenkins (#MC-94CC)")
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

        // --- HUB HEADER ---
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Clinical Consultations Hub", style = Typography.headlineMedium.copy(fontSize = 18.sp), color = Charcoal)
                    Text("Manage telehealth encounters and scheduled visits", style = Typography.bodyMedium.copy(fontSize = 11.sp))
                }
                Button(
                    onClick = { showScheduleDialog = true },
                    colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Schedule", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Schedule", fontSize = 11.sp)
                }
            }
        }

        // --- 1. LIVE TELEHEALTH IN LOBBY BANNER (STITCH SPEC) ---
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(SurfaceCard, RoundedCornerShape(18.dp))
                    .border(1.5.dp, SageAccent, RoundedCornerShape(18.dp))
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .background(SageSoft, RoundedCornerShape(12.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Videocam, contentDescription = "Video", tint = SageDark, modifier = Modifier.size(24.dp))
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("Elena Rostova", style = Typography.titleMedium.copy(fontSize = 15.sp), color = Charcoal)
                                Spacer(modifier = Modifier.width(6.dp))
                                Box(
                                    modifier = Modifier
                                        .background(SageSoft, RoundedCornerShape(6.dp))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text("IN LOBBY", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = SageDark)
                                }
                            }
                            Text("HRT Titration Consultation · 10:30 AM", fontSize = 11.sp, color = CharcoalMuted)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Cream, RoundedCornerShape(10.dp))
                        .padding(10.dp)
                ) {
                    Text(
                        "Patient note: \"Severe hot flashes at 3:15 AM waking me drenched. Oura sleep score dropped to 58. Ready for visit.\"",
                        fontSize = 11.sp,
                        color = CharcoalMuted
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Button(
                    onClick = { inCallEncounterOpen = true },
                    colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.VideoCall, contentDescription = "Start", modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Launch Live Video Encounter Room", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        // --- 2. SCHEDULED CONSULTATIONS LIST ---
        item {
            Text("Scheduled Consultations & Follow-Ups", style = Typography.titleMedium.copy(fontSize = 15.sp), color = Charcoal)
        }

        items(appointments) { apt ->
            val isInLobby = apt.status == "In Lobby"
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
                    Column {
                        Text(apt.patientName ?: "Patient", style = Typography.titleMedium.copy(fontSize = 14.sp), color = Charcoal)
                        Text(apt.scheduledAt, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = SageDark)
                    }
                    Box(
                        modifier = Modifier
                            .background(if (isInLobby) SageSoft else OatLight, RoundedCornerShape(8.dp))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(
                            apt.status.uppercase(),
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isInLobby) SageDark else CharcoalMuted
                        )
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))
                Text(apt.reason, fontSize = 11.sp, color = CharcoalMuted)

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = { Toast.makeText(context, "Reschedule flow for ${apt.patientName}", Toast.LENGTH_SHORT).show() },
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Reschedule", fontSize = 11.sp, color = Charcoal)
                    }

                    Button(
                        onClick = { inCallEncounterOpen = true },
                        colors = ButtonDefaults.buttonColors(containerColor = if (isInLobby) SageDark else SageForest, contentColor = Cream),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(if (isInLobby) "Join Room" else "Open EHR", fontSize = 11.sp)
                    }
                }
            }
        }

        item { Spacer(modifier = Modifier.height(24.dp)) }
    }

    // --- FULL IN-CALL EHR ENCOUNTER DIALOG (STITCH SPEC: c17e27fcc40d4e8c94df9b9e06adc319) ---
    if (inCallEncounterOpen) {
        var liveSoapSubjective by remember { mutableStateOf("Patient reports daytime hot flashes are stabilized on transdermal estradiol 0.05mg patch. However, persistent nocturnal heat surges occur between 02:40 and 04:00 AM, accompanied by sudden diaphoresis, palpitations, and sleep fragmentation.") }
        var liveSoapObjective by remember { mutableStateOf("Resting HR 68 bpm. Nocturnal surge spike +1.4°F. Intact uterus confirmed.") }
        var liveSoapAssessment by remember { mutableStateOf("Vasomotor nocturnal breakthrough. Recommend titrating progesterone to 200mg nightly.") }

        AlertDialog(
            onDismissRequest = { inCallEncounterOpen = false },
            title = {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(modifier = Modifier.size(10.dp).clip(CircleShape).background(ErrorRed))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("LIVE ENCOUNTER: Elena Rostova", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Charcoal)
                    }
                    Text("14:28 / 30:00", fontSize = 11.sp, color = CharcoalMuted)
                }
            },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // WebRTC Stream Status Banner
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(SurfaceCard, RoundedCornerShape(8.dp))
                            .padding(8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("WebRTC Encrypted (AES-256)", fontSize = 10.sp, color = SageDark, fontWeight = FontWeight.Bold)
                        Text("18ms · 1080p · 0% Loss", fontSize = 10.sp, color = CharcoalMuted)
                    }

                    // Live Biometrics Bar
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Box(modifier = Modifier.weight(1f).background(Cream, RoundedCornerShape(8.dp)).border(1.dp, BorderWarm, RoundedCornerShape(8.dp)).padding(6.dp)) {
                            Column {
                                Text("Resting HR", fontSize = 9.sp, color = CharcoalMuted)
                                Text("68 bpm", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Charcoal)
                            }
                        }
                        Box(modifier = Modifier.weight(1f).background(Cream, RoundedCornerShape(8.dp)).border(1.dp, BorderWarm, RoundedCornerShape(8.dp)).padding(6.dp)) {
                            Column {
                                Text("Temp Spike", fontSize = 9.sp, color = CharcoalMuted)
                                Text("+1.4°F (03:18 AM)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Peach)
                            }
                        }
                        Box(modifier = Modifier.weight(1f).background(Cream, RoundedCornerShape(8.dp)).border(1.dp, BorderWarm, RoundedCornerShape(8.dp)).padding(6.dp)) {
                            Column {
                                Text("Sleep Index", fontSize = 9.sp, color = CharcoalMuted)
                                Text("58/100", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Teal)
                            }
                        }
                    }

                    // Whisper AI Real-Time Transcription
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(SageSoft, RoundedCornerShape(10.dp))
                            .border(1.dp, SageAccent, RoundedCornerShape(10.dp))
                            .padding(10.dp)
                    ) {
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.AutoAwesome, contentDescription = "AI", tint = SageDark, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Whisper AI Live Transcription Sync", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = SageDark)
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                "Elena: \"...mostly between 2:40 and 4:00 AM, waking with sudden heart palpitations...\"",
                                fontSize = 11.sp,
                                color = Charcoal,
                                fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                            )
                        }
                    }

                    // In-Call Live SOAP Drafter
                    Text("Live Clinical SOAP Drafter", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Charcoal)
                    OutlinedTextField(
                        value = liveSoapSubjective,
                        onValueChange = { liveSoapSubjective = it },
                        label = { Text("Subjective (Live Auto-Draft)") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )
                    OutlinedTextField(
                        value = liveSoapAssessment,
                        onValueChange = { liveSoapAssessment = it },
                        label = { Text("Assessment & Titration Plan") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        Toast.makeText(context, "Encounter concluded. SOAP note and telemetry signed to EHR.", Toast.LENGTH_LONG).show()
                        inCallEncounterOpen = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream)
                ) {
                    Text("End Call & Sign Encounter")
                }
            },
            dismissButton = {
                TextButton(onClick = { inCallEncounterOpen = false }) {
                    Text("Minimize Room", color = CharcoalMuted)
                }
            },
            containerColor = Cream
        )
    }

    // Schedule Dialog
    if (showScheduleDialog) {
        var ptName by remember { mutableStateOf("") }
        var aptDate by remember { mutableStateOf("Tomorrow, 10:00 AM") }

        AlertDialog(
            onDismissRequest = { showScheduleDialog = false },
            title = { Text("Schedule Clinical Telehealth Visit", style = Typography.headlineMedium.copy(fontSize = 18.sp), color = Charcoal) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = ptName,
                        onValueChange = { ptName = it },
                        label = { Text("Patient Name / MRN") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )
                    OutlinedTextField(
                        value = aptDate,
                        onValueChange = { aptDate = it },
                        label = { Text("Date & Time") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (ptName.isNotBlank()) {
                            appointments = appointments + AppointmentDto("apt-${System.currentTimeMillis()}", aptDate, "Scheduled telehealth consultation", "Confirmed", null, ptName)
                            Toast.makeText(context, "Consultation scheduled for $ptName", Toast.LENGTH_SHORT).show()
                            showScheduleDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream)
                ) {
                    Text("Confirm Schedule")
                }
            },
            dismissButton = {
                TextButton(onClick = { showScheduleDialog = false }) {
                    Text("Cancel", color = CharcoalMuted)
                }
            },
            containerColor = Cream
        )
    }
}
