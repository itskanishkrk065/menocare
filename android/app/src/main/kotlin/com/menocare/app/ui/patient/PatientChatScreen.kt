package com.menocare.app.ui.patient

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.menocare.app.core.network.ApiClient
import com.menocare.app.core.theme.*
import com.menocare.app.data.model.MessageDto
import com.menocare.app.data.model.SendMessageRequest
import kotlinx.coroutines.launch

@Composable
fun PatientChatScreen(
    onNavigateBack: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var messageText by remember { mutableStateOf("") }
    var messages by remember {
        mutableStateOf(
            listOf(
                MessageDto("1", "doctor-01", "Dr. Elena Vance, MD", "doctor", "Hello Elena, I reviewed your recent 7-day symptom trend. How are you tolerating the micronized progesterone at bedtime?", "10:15 AM"),
                MessageDto("2", "patient-01", "Elena", "patient", "Hi Dr. Vance! The hot flashes during the night have noticeably calmed down, but I felt a bit groggy the first two mornings.", "10:20 AM"),
                MessageDto("3", "doctor-01", "Dr. Elena Vance, MD", "doctor", "That morning drowsiness usually resolves within 5 to 7 days as your body adapts. Take it right as your head hits the pillow with a small snack.", "10:25 AM")
            )
        )
    }

    LaunchedEffect(Unit) {
        coroutineScope.launch {
            try {
                val remote = ApiClient.service.getMessages()
                if (remote.isNotEmpty()) messages = remote
            } catch (e: Exception) {}
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Ivory)
    ) {
        // Top Back Row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Button(
                onClick = onNavigateBack,
                colors = ButtonDefaults.buttonColors(containerColor = SageSoft, contentColor = SageDark),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("← Back to Overview", fontSize = 12.sp, fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold)
            }
        }

        // Messages List
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(messages) { msg ->
                val isMe = msg.senderRole == "patient"
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
                            if (!isMe) {
                                Text(msg.senderName, style = Typography.labelSmall.copy(color = SageDark, fontSize = 10.sp))
                                Spacer(modifier = Modifier.height(2.dp))
                            }
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

        // Input Bar
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
                value = messageText,
                onValueChange = { messageText = it },
                placeholder = { Text("Message Dr. Vance...", fontSize = 12.sp) },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(16.dp)
            )

            Spacer(modifier = Modifier.width(8.dp))

            IconButton(
                onClick = {
                    if (messageText.isNotBlank()) {
                        val newMsg = MessageDto(
                            id = "${messages.size + 1}",
                            senderId = "patient-01",
                            senderName = "Elena",
                            senderRole = "patient",
                            text = messageText,
                            sentAt = "Just now"
                        )
                        messages = messages + newMsg
                        val txt = messageText
                        messageText = ""
                        coroutineScope.launch {
                            try { ApiClient.service.sendMessage(SendMessageRequest(txt)) } catch (e: Exception) {}
                        }
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
