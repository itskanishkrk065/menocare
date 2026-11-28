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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
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
import com.menocare.app.data.model.MessageDto

data class DoctorChatThread(
    val patientId: String,
    val name: String,
    val mrn: String,
    val age: Int,
    val strawStage: String,
    val lastMessage: String,
    val time: String,
    val isUnread: Boolean = false,
    val isRedFlag: Boolean = false
)

@Composable
fun DoctorChatScreen() {
    val context = LocalContext.current
    var selectedFilter by remember { mutableStateOf("All (24)") }
    var selectedPatientId by remember { mutableStateOf("8042MC") }
    var composerText by remember { mutableStateOf("") }

    val threads = listOf(
        DoctorChatThread("8042MC", "Elena Rostova", "#MC-8042", 48, "STRAW -1 (Late Peri)", "Waking drenched around 3:15 AM with acute flushes...", "10:14 AM", isUnread = true, isRedFlag = true),
        DoctorChatThread("6621MC", "Claire Dupont", "#MC-6621", 55, "STRAW +1a (Post)", "TVUS completed today, biopsy scheduling inquiry...", "08:30 AM", isUnread = true, isRedFlag = true),
        DoctorChatThread("23ECMC", "Priya Kapoor", "#MC-23EC", 38, "Phenotypic Mimic", "Lab panel taken at Quest Diagnostics.", "Yesterday", isUnread = false),
        DoctorChatThread("94CCMC", "Sarah Jenkins", "#MC-94CC", 44, "STRAW -2 (Early Peri)", "Levothyroxine 25mcg tolerating well.", "Nov 26", isUnread = false)
    )

    var messages by remember {
        mutableStateOf(
            listOf(
                MessageDto(
                    id = "m1",
                    senderId = "pt-elena",
                    senderName = "Elena Rostova",
                    senderRole = "patient",
                    text = "Hello Dr. Vance, over the past 4 nights I've been waking up drenched around 3:15 AM with acute hot flushes and rapid heartbeat. My Oura sleep score dropped to 58. Should I increase my evening micronized progesterone or change the patch placement?",
                    sentAt = "10:14 AM"
                ),
                MessageDto(
                    id = "m2",
                    senderId = "dr-vance",
                    senderName = "Dr. Elena Vance, MD",
                    senderRole = "doctor",
                    text = "Good morning Elena. I have reviewed your continuous telemetry spike (+1.4°F at 03:18 AM). Let us titrate your micronized progesterone to 200mg nightly at bedtime. Continue the 0.05mg estradiol patch unchanged. I have also queued this for our 10:30 AM video consult.",
                    sentAt = "10:22 AM"
                )
            )
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Ivory)
    ) {
        // --- 1. CHAT HEADER WITH HL7 & E2EE METADATA ---
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Cream)
                .padding(horizontal = 16.dp, vertical = 10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Secure Clinical Messaging", style = Typography.headlineMedium.copy(fontSize = 17.sp), color = Charcoal)
                    Text("Endocrine Care Team · HL7 v4.0 · E2EE Encrypted", style = Typography.bodyMedium.copy(fontSize = 10.sp, color = SageDark))
                }
                Box(
                    modifier = Modifier
                        .background(SageSoft, RoundedCornerShape(8.dp))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text("14m avg reply", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = SageDark)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Thread Selector Chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                threads.forEach { th ->
                    val isSelected = selectedPatientId == th.patientId
                    val containerBg = when {
                        th.isRedFlag && isSelected -> ErrorRed
                        th.isRedFlag -> ErrorContainer
                        isSelected -> SageDark
                        else -> SurfaceCard
                    }
                    val textColor = when {
                        th.isRedFlag && isSelected -> Cream
                        th.isRedFlag -> ErrorRed
                        isSelected -> Cream
                        else -> Charcoal
                    }

                    Row(
                        modifier = Modifier
                            .background(containerBg, RoundedCornerShape(12.dp))
                            .border(1.dp, if (th.isRedFlag) ErrorRed.copy(alpha = 0.5f) else BorderWarm, RoundedCornerShape(12.dp))
                            .clickable { selectedPatientId = th.patientId }
                            .padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(th.name, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = textColor)
                        if (th.isUnread) {
                            Box(modifier = Modifier.size(6.dp).background(if (isSelected) Cream else ErrorRed, CircleShape))
                        }
                    }
                }
            }
        }

        // --- 2. PATIENT CLINICAL CONTEXT CARD (STITCH SPEC) ---
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(SurfaceCard)
                .border(1.dp, BorderWarm)
                .padding(horizontal = 16.dp, vertical = 8.dp)
        ) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Elena Rostova (48y · #MC-8042)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Charcoal)
                    Text("94.2% Adherence (30d)", fontSize = 10.sp, color = SageDark, fontWeight = FontWeight.Bold)
                }
                Text("17β-Estradiol 0.05mg Patch + Micronized Progesterone 100mg PO continuous", fontSize = 10.sp, color = CharcoalMuted)
                Text("Sync: Checked in 2h ago via Oura & MenoCare Band", fontSize = 9.sp, color = SageDark)
            }
        }

        // --- 3. MESSAGES SCROLL AREA ---
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Embedded Telemetry Card Attached to Thread (Stitch Spec)
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Cream, RoundedCornerShape(14.dp))
                        .border(1.dp, SageAccent, RoundedCornerShape(14.dp))
                        .padding(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.SensorOccupied, contentDescription = "Sensor", tint = SageDark, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Nocturnal Surge Telemetry", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Charcoal)
                        }
                        Text("Logged 07:15 AM", fontSize = 9.sp, color = CharcoalMuted)
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Box(modifier = Modifier.weight(1f).background(SurfaceCard, RoundedCornerShape(8.dp)).padding(6.dp)) {
                            Column {
                                Text("Sleep Score", fontSize = 8.sp, color = CharcoalMuted)
                                Text("58 / 82 avg", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = ErrorRed)
                            }
                        }
                        Box(modifier = Modifier.weight(1f).background(SurfaceCard, RoundedCornerShape(8.dp)).padding(6.dp)) {
                            Column {
                                Text("Flush Surge", fontSize = 8.sp, color = CharcoalMuted)
                                Text("4 / 10 Mod/Hi", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Peach)
                            }
                        }
                        Box(modifier = Modifier.weight(1f).background(SurfaceCard, RoundedCornerShape(8.dp)).padding(6.dp)) {
                            Column {
                                Text("Temp Spike", fontSize = 8.sp, color = CharcoalMuted)
                                Text("+1.4°F (03:18 AM)", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Teal)
                            }
                        }
                    }
                }
            }

            // Message Items
            items(messages) { msg ->
                val isMe = msg.senderRole == "doctor"
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = if (isMe) Alignment.End else Alignment.Start
                ) {
                    Box(
                        modifier = Modifier
                            .widthIn(max = 290.dp)
                            .background(
                                if (isMe) SageDark else Cream,
                                RoundedCornerShape(
                                    topStart = 16.dp,
                                    topEnd = 16.dp,
                                    bottomStart = if (isMe) 16.dp else 4.dp,
                                    bottomEnd = if (isMe) 4.dp else 16.dp
                                )
                            )
                            .border(1.dp, if (isMe) SageDark else BorderWarm, RoundedCornerShape(16.dp))
                            .padding(12.dp)
                    ) {
                        Column {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    msg.senderName,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isMe) SageAccent else SageDark
                                )
                                Text(
                                    msg.sentAt,
                                    fontSize = 9.sp,
                                    color = if (isMe) Cream.copy(alpha = 0.7f) else CharcoalMuted
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                msg.text,
                                fontSize = 12.sp,
                                color = if (isMe) Cream else Charcoal
                            )
                        }
                    }
                }
            }
        }

        // --- 4. CLINICAL QUICK ACTION SUGGESTIONS ---
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Cream)
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 12.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            listOf(
                "Titrate Progesterone to 200mg qHS",
                "Order Pelvic Ultrasound (TVUS)",
                "Review in Telehealth Room"
            ).forEach { suggestion ->
                Box(
                    modifier = Modifier
                        .background(SageSoft, RoundedCornerShape(8.dp))
                        .clickable {
                            composerText = suggestion
                        }
                        .padding(horizontal = 10.dp, vertical = 5.dp)
                ) {
                    Text(suggestion, fontSize = 10.sp, color = SageDark, fontWeight = FontWeight.SemiBold)
                }
            }
        }

        // --- 5. COMPOSER BAR ---
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Cream)
                .padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = composerText,
                onValueChange = { composerText = it },
                placeholder = { Text("Write clinical message to patient...", fontSize = 12.sp) },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(20.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = SageDark,
                    unfocusedBorderColor = BorderWarm,
                    focusedContainerColor = SurfaceCard,
                    unfocusedContainerColor = SurfaceCard
                )
            )

            IconButton(
                onClick = {
                    if (composerText.isNotBlank()) {
                        val newMsg = MessageDto(
                            id = "m-${System.currentTimeMillis()}",
                            senderId = "dr-vance",
                            senderName = "Dr. Elena Vance, MD",
                            senderRole = "doctor",
                            text = composerText,
                            sentAt = "Just now"
                        )
                        messages = messages + newMsg
                        composerText = ""
                        Toast.makeText(context, "Clinical message delivered to Elena Rostova", Toast.LENGTH_SHORT).show()
                    }
                },
                modifier = Modifier
                    .size(44.dp)
                    .background(SageDark, CircleShape)
            ) {
                Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Send", tint = Cream, modifier = Modifier.size(18.dp))
            }
        }
    }
}
