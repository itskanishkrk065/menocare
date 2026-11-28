package com.menocare.app.ui.doctor

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.menocare.app.core.network.ApiClient
import com.menocare.app.core.theme.*
import com.menocare.app.data.model.AlertDto
import com.menocare.app.data.model.TriageTaskDto
import com.menocare.app.ui.navigation.Screen
import kotlinx.coroutines.launch

data class CohortStageChip(val label: String, val count: Int, val isUrgent: Boolean = false)

@Composable
fun DoctorDashboardScreen(
    onNavigate: (String) -> Unit
) {
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current
    val coroutineScope = rememberCoroutineScope()

    val practiceCode = "DR-VANCE-77B"
    var selectedCohortStage by remember { mutableStateOf("All Active") }

    val cohortChips = listOf(
        CohortStageChip("All Active", 142),
        CohortStageChip("Early Transition", 22),
        CohortStageChip("Late Transition", 38),
        CohortStageChip("Postmenopausal", 54),
        CohortStageChip("Urgent", 6, isUrgent = true)
    )

    var alerts by remember {
        mutableStateOf(
            listOf(
                AlertDto("a1", "Emergency PMB Bleed", "Claire Dupont (#MC-6621, 52y) reported postmenopausal bleeding surge. TVUS required.", "emergency"),
                AlertDto("a2", "Nocturnal Palpitations & Surge", "Joshika Kelavi (#MC-8042, 46y) reported night flush with HR >110 bpm.", "urgent"),
                AlertDto("a3", "Vasomotor Surge", "Elena Rostova (#MC-9481, 48y) reported 14 hot flashes/day, sleep <4h.", "warning")
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

        // --- 1. CLINICAL COMMAND HEADER & STRAW/FHIR BADGES ---
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
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(SageDark)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            "HL7 Connected · Live FHIR R4",
                            style = Typography.labelSmall.copy(color = SageDark, fontWeight = FontWeight.SemiBold, fontSize = 10.sp)
                        )
                    }

                    Box(
                        modifier = Modifier
                            .background(SageSoft, RoundedCornerShape(10.dp))
                            .border(1.dp, SageAccent, RoundedCornerShape(10.dp))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text("STRAW+10 Matrix", style = Typography.labelSmall.copy(color = SageDark, fontSize = 9.sp))
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = "Clinical Command Centre",
                    style = Typography.headlineMedium.copy(fontSize = 22.sp),
                    color = Charcoal
                )
                Text(
                    text = "Longitudinal endocrine triage, continuous telemetry, and algorithmic practice oversight.",
                    style = Typography.bodyMedium.copy(fontSize = 12.sp),
                    modifier = Modifier.padding(top = 2.dp)
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Clinic Pairing Code Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(SurfaceCard, RoundedCornerShape(14.dp))
                        .border(1.dp, BorderWarm, RoundedCornerShape(14.dp))
                        .padding(horizontal = 14.dp, vertical = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Clinic Pairing Code", style = Typography.labelSmall.copy(fontSize = 10.sp), color = CharcoalMuted)
                        Text(practiceCode, style = Typography.titleMedium.copy(fontSize = 16.sp, letterSpacing = 1.sp), color = SageDark)
                    }
                    Button(
                        onClick = {
                            clipboardManager.setText(AnnotatedString(practiceCode))
                            Toast.makeText(context, "Copied $practiceCode to clipboard", Toast.LENGTH_SHORT).show()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = SageSoft, contentColor = SageDark),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Icon(Icons.Default.ContentCopy, contentDescription = "Copy", modifier = Modifier.size(13.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Copy Code", fontSize = 11.sp)
                    }
                }
            }
        }

        // --- 2. INTERACTIVE COHORT STAGE FILTER STRIP (STITCH SPEC) ---
        item {
            Column {
                Text(
                    "Practice Cohort Segmentation",
                    style = Typography.labelSmall.copy(color = CharcoalMuted, fontWeight = FontWeight.SemiBold, fontSize = 11.sp),
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    cohortChips.forEach { chip ->
                        val isSelected = selectedCohortStage == chip.label
                        val containerBg = when {
                            chip.isUrgent -> if (isSelected) ErrorRed else ErrorContainer
                            isSelected -> SageDark
                            else -> Cream
                        }
                        val contentColor = when {
                            chip.isUrgent -> if (isSelected) Cream else ErrorRed
                            isSelected -> Cream
                            else -> Charcoal
                        }
                        val badgeBg = when {
                            chip.isUrgent -> if (isSelected) ErrorRed else Color(0x33BA1A1A)
                            isSelected -> SageForest
                            else -> OatLight
                        }

                        Row(
                            modifier = Modifier
                                .background(containerBg, RoundedCornerShape(12.dp))
                                .border(1.dp, if (chip.isUrgent) ErrorRed.copy(alpha = 0.5f) else BorderWarm, RoundedCornerShape(12.dp))
                                .clickable { selectedCohortStage = chip.label }
                                .padding(horizontal = 12.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            if (chip.isUrgent) {
                                Icon(Icons.Default.Warning, contentDescription = "Urgent", tint = contentColor, modifier = Modifier.size(14.dp))
                            }
                            Text(chip.label, fontSize = 11.sp, fontWeight = FontWeight.Medium, color = contentColor)
                            Box(
                                modifier = Modifier
                                    .background(badgeBg, RoundedCornerShape(8.dp))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text("${chip.count}", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = contentColor)
                            }
                        }
                    }
                }
            }
        }

        // --- 3. 4 TACTICAL OPERATIONAL METRIC CARDS (2x2 GRID) ---
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                TacticalMetricCard(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onNavigate(Screen.DoctorCohort.route) },
                    title = "Active Cohort",
                    value = "142",
                    subtext = "+98.4% Telemetry live",
                    icon = Icons.Default.Groups,
                    iconColor = SageDark
                )
                TacticalMetricCard(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onNavigate(Screen.DoctorCohort.route) },
                    title = "Tracking Gaps",
                    value = "8",
                    subtext = ">3d lapse · 5 nudged",
                    icon = Icons.Default.HistoryToggleOff,
                    iconColor = Peach
                )
            }
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                TacticalMetricCard(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onNavigate(Screen.DoctorDossier.createRoute("118D96BF")) },
                    title = "SOAP Notes",
                    value = "12",
                    subtext = "AI drafts ready",
                    icon = Icons.Default.EditNote,
                    iconColor = Teal
                )
                TacticalMetricCard(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onNavigate(Screen.DoctorDiagnostics.route) },
                    title = "Priority Action",
                    value = "3",
                    subtext = "2 red-flag triage",
                    icon = Icons.Default.NotificationImportant,
                    iconColor = ErrorRed
                )
            }
        }

        // --- 4. LIVE TELEHEALTH LOBBY BANNER (STITCH SPEC) ---
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
                                .size(40.dp)
                                .background(SageSoft, RoundedCornerShape(12.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Videocam, contentDescription = "Video", tint = SageDark, modifier = Modifier.size(22.dp))
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("Elena Rostova", style = Typography.titleMedium.copy(fontSize = 15.sp), color = Charcoal)
                                Spacer(modifier = Modifier.width(8.dp))
                                Box(
                                    modifier = Modifier
                                        .background(SageSoft, RoundedCornerShape(8.dp))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text("IN LOBBY", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = SageDark)
                                }
                            }
                            Text(
                                "10:30 AM · HRT Titration Consultation",
                                style = Typography.bodyMedium.copy(fontSize = 11.sp, color = CharcoalMuted)
                            )
                        }
                    }

                    Button(
                        onClick = { onNavigate(Screen.DoctorVisits.route) },
                        colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream),
                        shape = RoundedCornerShape(12.dp),
                        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 8.dp)
                    ) {
                        Text("Join Room", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = "Enter", modifier = Modifier.size(14.dp))
                    }
                }
            }
        }

        // --- 5. PRIORITY CLINICAL TRIAGE QUEUE (WITH AUDIT ACTIONS) ---
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Priority Triage Queue", style = Typography.titleMedium.copy(fontSize = 16.sp), color = Charcoal)
                    Spacer(modifier = Modifier.width(8.dp))
                    Box(
                        modifier = Modifier
                            .background(ErrorContainer, RoundedCornerShape(10.dp))
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Text("${alerts.size} Flagged", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = ErrorRed)
                    }
                }

                TextButton(onClick = { onNavigate(Screen.DoctorCohort.route) }) {
                    Text("View All Cohort", fontSize = 11.sp, color = SageDark)
                }
            }
        }

        items(alerts.size) { index ->
            val alert = alerts[index]
            val isEmergency = alert.severityLevel == "emergency"
            val badgeColor = if (isEmergency) ErrorRed else Peach
            val badgeBg = if (isEmergency) ErrorContainer else PeachSoft

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Cream, RoundedCornerShape(16.dp))
                    .border(1.dp, if (isEmergency) ErrorRed.copy(alpha = 0.4f) else BorderWarm, RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            if (isEmergency) Icons.Default.CrisisAlert else Icons.Default.Warning,
                            contentDescription = alert.title,
                            tint = badgeColor,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(alert.title, style = Typography.titleMedium.copy(fontSize = 14.sp), color = Charcoal)
                    }
                    Box(
                        modifier = Modifier
                            .background(badgeBg, RoundedCornerShape(8.dp))
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Text(alert.severityLevel.uppercase(), fontSize = 9.sp, fontWeight = FontWeight.Bold, color = badgeColor)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = alert.message,
                    style = Typography.bodyMedium.copy(fontSize = 12.sp, color = Charcoal)
                )

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = {
                            alerts = alerts.filter { it.id != alert.id }
                            Toast.makeText(context, "Acknowledged triage alert: ${alert.title}", Toast.LENGTH_SHORT).show()
                        },
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(vertical = 6.dp)
                    ) {
                        Icon(Icons.Default.Check, contentDescription = "Acknowledge", modifier = Modifier.size(14.dp), tint = Charcoal)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Acknowledge", fontSize = 11.sp, color = Charcoal)
                    }

                    Button(
                        onClick = { onNavigate(Screen.DoctorDossier.createRoute("118D96BF")) },
                        colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f),
                        contentPadding = PaddingValues(vertical = 6.dp)
                    ) {
                        Text("Inspect Dossier", fontSize = 11.sp)
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(Icons.Default.ChevronRight, contentDescription = "Inspect", modifier = Modifier.size(14.dp))
                    }
                }
            }
        }

        // --- 6. RECENT MESSAGES TICKER ---
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(SurfaceCard, RoundedCornerShape(16.dp))
                    .border(1.dp, BorderWarm, RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Direct Patient Communications", style = Typography.titleMedium.copy(fontSize = 14.sp), color = Charcoal)
                    TextButton(onClick = { onNavigate(Screen.DoctorChat.route) }) {
                        Text("Open Chat (24)", fontSize = 11.sp, color = SageDark)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Cream, RoundedCornerShape(12.dp))
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("Elena Rostova", style = Typography.labelLarge.copy(fontSize = 12.sp), color = Charcoal)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("MRN #MC-8042 · 14m ago", fontSize = 10.sp, color = CharcoalMuted)
                        }
                        Text(
                            "Woke up drenched around 3:15 AM with acute hot flushes and rapid heart rate...",
                            style = Typography.bodyMedium.copy(fontSize = 11.sp, color = CharcoalMuted),
                            maxLines = 1
                        )
                    }
                    Button(
                        onClick = { onNavigate(Screen.DoctorChat.route) },
                        colors = ButtonDefaults.buttonColors(containerColor = SageSoft, contentColor = SageDark),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text("Reply", fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }

        item { Spacer(modifier = Modifier.height(24.dp)) }
    }
}

@Composable
private fun TacticalMetricCard(
    modifier: Modifier,
    title: String,
    value: String,
    subtext: String,
    icon: ImageVector,
    iconColor: Color
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
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .background(iconColor.copy(alpha = 0.12f), RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = title, tint = iconColor, modifier = Modifier.size(16.dp))
            }
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(value, style = Typography.headlineMedium.copy(fontSize = 24.sp, fontWeight = FontWeight.Bold), color = Charcoal)
        Text(subtext, style = Typography.bodyMedium.copy(fontSize = 10.sp, color = CharcoalMuted))
    }
}
