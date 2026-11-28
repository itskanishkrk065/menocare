package com.menocare.app.ui.doctor

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.menocare.app.core.network.ApiClient
import com.menocare.app.core.theme.*
import com.menocare.app.data.model.AlertDto
import com.menocare.app.data.model.TriageTaskDto
import kotlinx.coroutines.launch

@Composable
fun DoctorDashboardScreen(
    onNavigate: (String) -> Unit
) {
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current
    val coroutineScope = rememberCoroutineScope()

    val practiceCode = "DR-VANCE-77B"
    var alerts by remember {
        mutableStateOf(
            listOf(
                AlertDto("a1", "Emergency Flow Surge", "Joshika Kelavi (#118D96BF) reported heavy flooding with clots.", "emergency"),
                AlertDto("a2", "Sustained Tachycardia", "Elena Vance reported nocturnal palpitations >110 bpm.", "urgent")
            )
        )
    }

    val triageQueue = listOf(
        TriageTaskDto("t1", "118D96BF", "Joshika Kelavi", "Immediate", "Heavy flooding bleeding episode (Day 3)"),
        TriageTaskDto("t2", "23EC0D81", "Priya Onboarded", "Urgent", "Severe insomnia score surge post-taper"),
        TriageTaskDto("t3", "94CC944C", "True POI Patient", "Routine", "Follow-up baseline hormone panel review")
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Ivory)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item { Spacer(modifier = Modifier.height(4.dp)) }

        // 1. Clinic Pairing Code Card
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
                        Text("Clinic Pairing Code", style = Typography.labelSmall.copy(fontSize = 11.sp), color = CharcoalMuted)
                        Text(practiceCode, style = Typography.headlineMedium.copy(fontSize = 20.sp, letterSpacing = 1.sp), color = SageDark)
                    }
                    Button(
                        onClick = {
                            clipboardManager.setText(AnnotatedString(practiceCode))
                            Toast.makeText(context, "Copied $practiceCode to clipboard", Toast.LENGTH_SHORT).show()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = SageSoft, contentColor = SageDark),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.ContentCopy, contentDescription = "Copy", modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Copy Code", fontSize = 11.sp)
                    }
                }
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    "Patients input this code to link their longitudinal telemetry directly to your practice.",
                    style = Typography.bodyMedium.copy(fontSize = 11.sp)
                )
            }
        }

        // 2. Tactical Metric Bento (4 KPI Tiles)
        item {
            Text("Tactical Clinical Metric Bento", style = Typography.titleMedium, color = Charcoal)
        }

        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                BentoCard(Modifier.weight(1f), "Active Patients", "65", "Cohort synchronized", Icons.Default.People, SageDark)
                BentoCard(Modifier.weight(1f), "Triage Queue", "3", "High clinical urgency", Icons.Default.PriorityHigh, ErrorRed)
            }
        }

        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                BentoCard(Modifier.weight(1f), "Pending Labs", "4", "Abnormal biomarkers", Icons.Default.Biotech, Peach)
                BentoCard(Modifier.weight(1f), "Telehealth Today", "2", "In lobby queue", Icons.Default.VideoCall, Teal)
            }
        }

        // 3. Urgent Clinical Alerts Inbox
        if (alerts.isNotEmpty()) {
            item {
                Text("Urgent Clinical Alerts (${alerts.size})", style = Typography.titleMedium, color = Charcoal)
            }

            items(alerts.size) { idx ->
                val alert = alerts[idx]
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(if (alert.severityLevel == "emergency") ErrorContainer else PeachSoft, RoundedCornerShape(16.dp))
                        .border(1.dp, if (alert.severityLevel == "emergency") ErrorRed else Peach, RoundedCornerShape(16.dp))
                        .padding(14.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Warning, contentDescription = "Alert", tint = if (alert.severityLevel == "emergency") ErrorRed else Peach, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(alert.title, style = Typography.titleMedium.copy(fontSize = 13.sp), color = Charcoal)
                        }
                        Button(
                            onClick = {
                                alerts = alerts.filter { it.id != alert.id }
                                coroutineScope.launch {
                                    try { ApiClient.service.acknowledgeAlert(alert.id) } catch (e: Exception) {}
                                }
                                Toast.makeText(context, "Alert acknowledged", Toast.LENGTH_SHORT).show()
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Cream, contentColor = Charcoal),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text("Acknowledge", fontSize = 10.sp)
                        }
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(alert.message, style = Typography.bodyMedium.copy(fontSize = 11.sp, color = Charcoal))
                }
            }
        }

        // 4. Telehealth Live Queue
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
                    Text("Telehealth Lobby Queue", style = Typography.titleMedium.copy(fontSize = 14.sp), color = Charcoal)
                    Box(modifier = Modifier.background(SageSoft, RoundedCornerShape(6.dp)).padding(horizontal = 6.dp, vertical = 2.dp)) {
                        Text("1 READY IN LOBBY", fontSize = 9.sp, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold, color = SageDark)
                    }
                }
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Elena Rostova (#23EC0D81)", style = Typography.labelLarge.copy(fontSize = 13.sp), color = Charcoal)
                        Text("Video Visit · Scheduled for Today", style = Typography.bodyMedium.copy(fontSize = 11.sp))
                    }
                    Button(
                        onClick = { onNavigate("doctor_visits") },
                        colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("Enter Room", fontSize = 11.sp)
                    }
                }
            }
        }

        // 5. Prioritized Triage Queue
        item {
            Text("Prioritized Triage Queue", style = Typography.titleMedium, color = Charcoal)
        }

        items(triageQueue.size) { idx ->
            val task = triageQueue[idx]
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(SurfaceCard, RoundedCornerShape(14.dp))
                    .border(1.dp, BorderWarm, RoundedCornerShape(14.dp))
                    .clickable { onNavigate("doctor_dossier/${task.patientId}") }
                    .padding(14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(task.patientName, style = Typography.labelLarge.copy(fontSize = 13.sp), color = Charcoal)
                        Spacer(modifier = Modifier.width(8.dp))
                        Box(
                            modifier = Modifier
                                .background(if (task.tier == "Immediate") ErrorContainer else if (task.tier == "Urgent") PeachSoft else SageSoft, RoundedCornerShape(6.dp))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                task.tier,
                                fontSize = 9.sp,
                                fontWeight = androidx.compose.ui.text.font.FontWeight.Bold,
                                color = if (task.tier == "Immediate") ErrorRed else if (task.tier == "Urgent") Peach else SageDark
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(task.reason, style = Typography.bodyMedium.copy(fontSize = 11.sp))
                }

                Icon(Icons.Default.ChevronRight, contentDescription = "View", tint = CharcoalMuted)
            }
        }

        item { Spacer(modifier = Modifier.height(24.dp)) }
    }
}

@Composable
private fun BentoCard(
    modifier: Modifier,
    title: String,
    value: String,
    subtext: String,
    icon: ImageVector,
    accentColor: Color
) {
    Column(
        modifier = modifier
            .background(Cream, RoundedCornerShape(16.dp))
            .border(1.dp, BorderWarm, RoundedCornerShape(16.dp))
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(title, style = Typography.labelSmall.copy(fontSize = 11.sp), color = CharcoalMuted)
            Icon(icon, contentDescription = title, tint = accentColor, modifier = Modifier.size(16.dp))
        }
        Spacer(modifier = Modifier.height(6.dp))
        Text(value, style = Typography.headlineMedium.copy(fontSize = 24.sp), color = Charcoal)
        Text(subtext, style = Typography.bodyMedium.copy(fontSize = 10.sp), color = CharcoalMuted)
    }
}
