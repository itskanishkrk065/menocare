package com.menocare.app.ui.doctor

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.menocare.app.core.theme.*
import com.menocare.app.data.model.MessageDto

@Composable
fun DoctorChatScreen() {
    var selectedPatient by remember { mutableStateOf<String?>("Elena") }
    var replyText by remember { mutableStateOf("") }

    val conversations = listOf(
        "Elena" to "Elena Rostova: The night sweats have improved, thank you!",
        "Joshika" to "Joshika Kelavi: Bleeding has been moderate today.",
        "Sarah" to "Sarah Jenkins: Prescribed calcium dose verified."
    )

    var elenaMessages by remember {
        mutableStateOf(
            listOf(
                MessageDto("1", "patient-01", "Elena", "patient", "Hello Dr. Vance! How long does the micronized progesterone sedation take to settle?", "09:30 AM"),
                MessageDto("2", "doctor-01", "Dr. Elena Vance, MD", "doctor", "Good morning Elena. The initial drowsiness usually tapers within 5 to 7 days as your GABA receptor response normalizes.", "09:45 AM")
            )
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Ivory)
    ) {
        // Patient Selector Tabs
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Cream)
                .padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            conversations.forEach { (name, _) ->
                val isSelected = selectedPatient == name
                Box(
                    modifier = Modifier
                        .background(if (isSelected) SageDark else Ivory, RoundedCornerShape(10.dp))
                        .border(1.dp, if (isSelected) SageDark else BorderWarm, RoundedCornerShape(10.dp))
                        .clickable { selectedPatient = name }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(name, fontSize = 11.sp, color = if (isSelected) Cream else Charcoal)
                }
            }
        }

        // Messages Feed
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(elenaMessages) { msg ->
                val isMe = msg.senderRole == "doctor"
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = if (isMe) Alignment.End else Alignment.Start
                ) {
                    Box(
                        modifier = Modifier
                            .widthIn(max = 280.dp)
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
                            Text(
                                msg.text,
                                style = Typography.bodyMedium.copy(
                                    color = if (isMe) Cream else Charcoal,
                                    fontSize = 13.sp
                                )
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                msg.sentAt,
                                style = Typography.labelSmall.copy(
                                    color = if (isMe) Cream.copy(alpha = 0.7f) else CharcoalMuted,
                                    fontSize = 9.sp
                                ),
                                modifier = Modifier.align(Alignment.End)
                            )
                        }
                    }
                }
            }
        }

        // Input
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Cream)
                .border(1.dp, BorderWarm)
                .padding(horizontal = 12.dp, vertical = 8.dp)
                .navigationBarsPadding(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = replyText,
                onValueChange = { replyText = it },
                placeholder = { Text("Reply to $selectedPatient...", fontSize = 12.sp) },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(16.dp)
            )

            Spacer(modifier = Modifier.width(8.dp))

            IconButton(
                onClick = {
                    if (replyText.isNotBlank()) {
                        elenaMessages = elenaMessages + MessageDto(
                            id = "${elenaMessages.size + 1}",
                            senderId = "doctor-01",
                            senderName = "Dr. Elena Vance, MD",
                            senderRole = "doctor",
                            text = replyText,
                            sentAt = "Just now"
                        )
                        replyText = ""
                    }
                },
                modifier = Modifier
                    .size(44.dp)
                    .background(SageDark, RoundedCornerShape(12.dp))
            ) {
                Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Send", tint = Cream)
            }
        }
    }
}
