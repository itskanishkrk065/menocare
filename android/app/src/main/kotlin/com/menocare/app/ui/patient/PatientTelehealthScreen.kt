package com.menocare.app.ui.patient

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.menocare.app.core.theme.*

@Composable
fun PatientTelehealthScreen(
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    var isInCall by remember { mutableStateOf(false) }
    var isMicMuted by remember { mutableStateOf(false) }
    var isVideoOff by remember { mutableStateOf(false) }

    if (isInCall) {
        // Video Consultation Room (Simulated WebRTC)
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF0F172A))
                .padding(16.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(bottom = 80.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(100.dp)
                        .background(SageDark, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.MedicalServices, contentDescription = "Doctor", tint = Cream, modifier = Modifier.size(50.dp))
                }
                Spacer(modifier = Modifier.height(16.dp))
                Text("Dr. Elena Vance, MD", style = Typography.headlineMedium.copy(color = Cream, fontSize = 20.sp))
                Text("Secure HIPAA Encrypted Telehealth Session · 04:12", style = Typography.bodyMedium.copy(color = Oat, fontSize = 12.sp))
            }

            // Controls Bar
            Row(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .background(Color(0xFF1E293B), RoundedCornerShape(20.dp))
                    .padding(horizontal = 24.dp, vertical = 14.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = { isMicMuted = !isMicMuted },
                    modifier = Modifier.background(if (isMicMuted) ErrorRed else Color(0xFF334155), CircleShape)
                ) {
                    Icon(if (isMicMuted) Icons.Default.MicOff else Icons.Default.Mic, contentDescription = "Mic", tint = Cream)
                }

                IconButton(
                    onClick = { isVideoOff = !isVideoOff },
                    modifier = Modifier.background(if (isVideoOff) ErrorRed else Color(0xFF334155), CircleShape)
                ) {
                    Icon(if (isVideoOff) Icons.Default.VideocamOff else Icons.Default.Videocam, contentDescription = "Video", tint = Cream)
                }

                IconButton(
                    onClick = { isInCall = false },
                    modifier = Modifier.background(ErrorRed, CircleShape)
                ) {
                    Icon(Icons.Default.CallEnd, contentDescription = "End", tint = Cream)
                }
            }
        }
        return
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
                Text("← Back to Overview", fontSize = 12.sp, fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold)
            }
        }

        // Header
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Cream, RoundedCornerShape(18.dp))
                    .border(1.dp, BorderWarm, RoundedCornerShape(18.dp))
                    .padding(18.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .background(SageSoft, RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.VideoCall, contentDescription = "Telehealth", tint = SageDark)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text("Doctor Telehealth Hub", style = Typography.headlineMedium.copy(fontSize = 17.sp), color = Charcoal)
                        Text("Real-time virtual consultations & clinical reviews", style = Typography.bodyMedium.copy(fontSize = 11.sp))
                    }
                }
            }
        }

        // Active Upcoming Visit Card
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(SurfaceCard, RoundedCornerShape(16.dp))
                    .border(1.dp, BorderWarm, RoundedCornerShape(16.dp))
                    .padding(18.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Thursday, Dec 03 · 10:00 AM", style = Typography.titleMedium.copy(fontSize = 14.sp), color = Charcoal)
                        Text("Follow-up: 30-Day Hormone Therapy Evaluation", style = Typography.bodyMedium.copy(fontSize = 11.sp))
                    }
                    Box(
                        modifier = Modifier
                            .background(SageSoft, RoundedCornerShape(8.dp))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text("CONFIRMED", style = Typography.labelSmall.copy(color = SageDark, fontSize = 10.sp))
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Button(
                    onClick = { isInCall = true },
                    colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                ) {
                    Icon(Icons.Default.VideoCall, contentDescription = "Join")
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Join Video Consultation Room", fontSize = 13.sp)
                }
            }
        }

        // Request New Appointment
        item {
            OutlinedButton(
                onClick = { Toast.makeText(context, "Consultation request sent to Dr. Vance's triage coordinator.", Toast.LENGTH_LONG).show() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = "Request", tint = Charcoal)
                Spacer(modifier = Modifier.width(6.dp))
                Text("Request New Appointment Date", color = Charcoal, fontSize = 12.sp)
            }
        }

        item { Spacer(modifier = Modifier.height(24.dp)) }
    }
}
