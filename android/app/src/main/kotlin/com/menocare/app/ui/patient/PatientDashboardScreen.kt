package com.menocare.app.ui.patient

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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.menocare.app.core.network.ApiClient
import com.menocare.app.core.network.TokenManager
import com.menocare.app.core.theme.*
import com.menocare.app.data.model.DailyAssessmentRequest
import kotlinx.coroutines.launch

@Composable
fun PatientDashboardScreen(
    onNavigate: (String) -> Unit,
    onOpenCheckIn: () -> Unit,
    onOpenMrs: () -> Unit,
    onOpenBreathing: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var userName by remember { mutableStateOf(TokenManager.getUserName() ?: "Elena") }
    var streakDays by remember { mutableIntStateOf(7) }
    var mrsScore by remember { mutableIntStateOf(14) }
    var flashCount by remember { mutableIntStateOf(3) }
    var adherencePercent by remember { mutableIntStateOf(94) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Ivory)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item { Spacer(modifier = Modifier.height(4.dp)) }

        // 1. Hero Welcome & STRAW+10 Card
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
                    Box(
                        modifier = Modifier
                            .background(SageSoft, RoundedCornerShape(12.dp))
                            .border(1.dp, SageAccent, RoundedCornerShape(12.dp))
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text("Typical Perimenopause · STRAW+10", style = Typography.labelSmall.copy(color = SageDark))
                    }

                    Box(
                        modifier = Modifier
                            .background(PeachSoft, RoundedCornerShape(12.dp))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text("🔥 $streakDays-Day Streak", style = Typography.labelSmall.copy(color = Peach))
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = "Good day, $userName 🌸",
                    style = Typography.headlineMedium.copy(fontSize = 22.sp),
                    color = Charcoal
                )

                Text(
                    text = "Here is your symptom snapshot for this week. Your logged telemetry is automatically organized for your doctor visits.",
                    style = Typography.bodyMedium.copy(fontSize = 12.sp),
                    modifier = Modifier.padding(top = 4.dp)
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Action Buttons Suite
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Quick +1 Hot Flash
                    Button(
                        onClick = {
                            flashCount++
                            coroutineScope.launch {
                                try {
                                    ApiClient.service.submitDailyAssessment(
                                        DailyAssessmentRequest(quickFlashLogged = true)
                                    )
                                } catch (e: Exception) {}
                            }
                            Toast.makeText(context, "Logged +1 Hot Flash ($flashCount today)", Toast.LENGTH_SHORT).show()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = PeachSoft, contentColor = Peach),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(44.dp)
                    ) {
                        Icon(Icons.Default.Whatshot, contentDescription = "Flash", modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Flash (+1)", fontSize = 11.sp, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold)
                    }

                    // Paced Breathing
                    Button(
                        onClick = onOpenBreathing,
                        colors = ButtonDefaults.buttonColors(containerColor = TealSoft, contentColor = TealDark),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(44.dp)
                    ) {
                        Icon(Icons.Default.Air, contentDescription = "Breathe", modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Breathe", fontSize = 11.sp, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold)
                    }

                    // MRS Score
                    Button(
                        onClick = onOpenMrs,
                        colors = ButtonDefaults.buttonColors(containerColor = SageSoft, contentColor = SageDark),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(44.dp)
                    ) {
                        Icon(Icons.Default.Assessment, contentDescription = "MRS", modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Score (MRS)", fontSize = 11.sp, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold)
                    }
                }
            }
        }

        // 2. 4 Stat Cards
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                StatCard(
                    modifier = Modifier.weight(1f),
                    title = "Symptom Score",
                    value = "$mrsScore",
                    subtext = "Scale 0–44 · Mild",
                    icon = Icons.Default.Timeline,
                    iconColor = SageDark
                )
                StatCard(
                    modifier = Modifier.weight(1f),
                    title = "Hot Flashes",
                    value = "$flashCount",
                    subtext = "Today · Stable",
                    icon = Icons.Default.Whatshot,
                    iconColor = Peach
                )
            }
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                StatCard(
                    modifier = Modifier.weight(1f),
                    title = "Sleep Index",
                    value = "82%",
                    subtext = "Restful duration",
                    icon = Icons.Default.Bedtime,
                    iconColor = Teal
                )
                StatCard(
                    modifier = Modifier.weight(1f),
                    title = "7-Day Adherence",
                    value = "$adherencePercent%",
                    subtext = "13/14 doses taken",
                    icon = Icons.Default.Medication,
                    iconColor = SageForest
                )
            }
        }

        // 3. 8-Domain Health Matrix
        item {
            Text("8-Domain Health Matrix", style = Typography.titleMedium, color = Charcoal)
        }

        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    DomainMatrixCard(Modifier.weight(1f), "Mood & Emotion", "Even & Grounded", Icons.Default.SentimentSatisfied, SageDark)
                    DomainMatrixCard(Modifier.weight(1f), "Cognitive Focus", "Sharp Morning", Icons.Default.Lightbulb, Teal)
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    DomainMatrixCard(Modifier.weight(1f), "Joint & Muscular", "Mild Stiffness", Icons.Default.Accessibility, Peach)
                    DomainMatrixCard(Modifier.weight(1f), "Pelvic Comfort", "Optimal Comfort", Icons.Default.Favorite, SageDark)
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    DomainMatrixCard(Modifier.weight(1f), "Menstrual Cycle", "28-Day Cadence", Icons.Default.CalendarToday, Charcoal)
                    DomainMatrixCard(Modifier.weight(1f), "Daily Triggers", "Late Caffeine", Icons.Default.Coffee, Peach)
                }
            }
        }

        // 4. Doctor Telehealth & Care Lead Card
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Cream, RoundedCornerShape(20.dp))
                    .border(1.dp, BorderWarm, RoundedCornerShape(20.dp))
                    .padding(18.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .background(SageSoft, RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.MedicalServices, contentDescription = "Doctor", tint = SageDark)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text("Dr. Elena Vance, MD", style = Typography.titleMedium.copy(fontSize = 15.sp), color = Charcoal)
                        Text("NAMS Certified Menopause Specialist · Lead Clinical Endocrinologist", style = Typography.bodyMedium.copy(fontSize = 11.sp))
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(SurfaceCard, RoundedCornerShape(14.dp))
                        .border(1.dp, BorderWarm, RoundedCornerShape(14.dp))
                        .padding(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Upcoming Telehealth Consultation", style = Typography.labelLarge.copy(fontSize = 12.sp), color = Charcoal)
                            Text("Scheduled Video Visit · Thursday, 10:00 AM", style = Typography.bodyMedium.copy(fontSize = 11.sp))
                        }
                        Box(
                            modifier = Modifier
                                .background(SageSoft, RoundedCornerShape(8.dp))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text("CONFIRMED", style = Typography.labelSmall.copy(color = SageDark, fontSize = 9.sp))
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = { onNavigate("patient_chat") },
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(44.dp)
                    ) {
                        Icon(Icons.Default.ChatBubble, contentDescription = "Message", modifier = Modifier.size(16.dp), tint = Charcoal)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Send Message", fontSize = 12.sp, color = Charcoal)
                    }

                    Button(
                        onClick = { onNavigate("patient_telehealth") },
                        colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(44.dp)
                    ) {
                        Icon(Icons.Default.VideoCall, contentDescription = "Video", modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Video Visit", fontSize = 12.sp)
                    }
                }
            }
        }

        item { Spacer(modifier = Modifier.height(24.dp)) }
    }
}

@Composable
private fun StatCard(
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
            Icon(icon, contentDescription = title, tint = iconColor, modifier = Modifier.size(16.dp))
        }
        Spacer(modifier = Modifier.height(6.dp))
        Text(value, style = Typography.headlineMedium.copy(fontSize = 22.sp), color = Charcoal)
        Text(subtext, style = Typography.bodyMedium.copy(fontSize = 10.sp), color = CharcoalMuted)
    }
}

@Composable
private fun DomainMatrixCard(
    modifier: Modifier,
    title: String,
    status: String,
    icon: ImageVector,
    iconColor: Color
) {
    Row(
        modifier = modifier
            .background(SurfaceCard, RoundedCornerShape(14.dp))
            .border(1.dp, BorderWarm, RoundedCornerShape(14.dp))
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(32.dp)
                .background(SageSoft, RoundedCornerShape(8.dp)),
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, contentDescription = title, tint = iconColor, modifier = Modifier.size(16.dp))
        }
        Spacer(modifier = Modifier.width(10.dp))
        Column {
            Text(title, style = Typography.labelLarge.copy(fontSize = 11.sp), color = Charcoal)
            Text(status, style = Typography.bodyMedium.copy(fontSize = 10.sp), color = CharcoalMuted)
        }
    }
}
