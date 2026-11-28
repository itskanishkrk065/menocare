package com.menocare.app.ui.doctor

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.VideoCall
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.menocare.app.core.theme.*
import com.menocare.app.data.model.AppointmentDto

@Composable
fun ConsultationsScreen() {
    val context = LocalContext.current
    var showScheduleDialog by remember { mutableStateOf(false) }

    var appointments by remember {
        mutableStateOf(
            listOf(
                AppointmentDto("apt-1", "Today, 10:00 AM", "Vasomotor evaluation & progesterone titration", "In Lobby", null, "Elena Rostova (#23EC0D81)"),
                AppointmentDto("apt-2", "Today, 02:30 PM", "Endocrine biomarker follow-up", "Confirmed", null, "Sarah Jenkins (#94CC944C)"),
                AppointmentDto("apt-3", "Tomorrow, 11:15 AM", "Initial STRAW+10 onboarding consultation", "Scheduled", null, "Priya Onboarded (#39BFF4FB)")
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

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Clinical Consultations Hub", style = Typography.headlineMedium.copy(fontSize = 18.sp), color = Charcoal)
                    Text("Manage telehealth lobby and scheduled clinical visits", style = Typography.bodyMedium.copy(fontSize = 11.sp))
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

        items(appointments) { apt ->
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
                    Column {
                        Text(apt.patientName ?: "Patient", style = Typography.titleMedium.copy(fontSize = 14.sp), color = Charcoal)
                        Text(apt.scheduledAt, style = Typography.labelSmall.copy(color = SageDark, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold, fontSize = 11.sp))
                    }
                    Box(
                        modifier = Modifier
                            .background(if (apt.status == "In Lobby") SageSoft else OatLight, RoundedCornerShape(8.dp))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            apt.status.uppercase(),
                            style = Typography.labelSmall.copy(
                                color = if (apt.status == "In Lobby") SageDark else CharcoalMuted,
                                fontSize = 9.sp,
                                fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
                            )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
                Text("Reason: ${apt.reason}", style = Typography.bodyMedium.copy(fontSize = 11.sp, color = Charcoal))

                Spacer(modifier = Modifier.height(12.dp))

                Button(
                    onClick = { Toast.makeText(context, "Entering Video Consultation Room...", Toast.LENGTH_SHORT).show() },
                    colors = ButtonDefaults.buttonColors(containerColor = if (apt.status == "In Lobby") SageDark else Teal, contentColor = Cream),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.VideoCall, contentDescription = "Join")
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(if (apt.status == "In Lobby") "Admit Patient from Lobby" else "Launch Consultation Room", fontSize = 12.sp)
                }
            }
        }

        item { Spacer(modifier = Modifier.height(24.dp)) }
    }

    if (showScheduleDialog) {
        var pName by remember { mutableStateOf("") }
        var reason by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showScheduleDialog = false },
            containerColor = Cream,
            title = { Text("Schedule Patient Visit", style = Typography.headlineMedium.copy(fontSize = 16.sp), color = Charcoal) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(value = pName, onValueChange = { pName = it }, label = { Text("Patient Name") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = reason, onValueChange = { reason = it }, label = { Text("Clinical Reason") }, modifier = Modifier.fillMaxWidth())
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (pName.isNotBlank()) {
                            appointments = appointments + AppointmentDto("apt-new", "Tomorrow, 03:00 PM", reason.ifBlank { "Routine Follow-up" }, "Scheduled", null, pName)
                            showScheduleDialog = false
                            Toast.makeText(context, "Appointment scheduled", Toast.LENGTH_SHORT).show()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream)
                ) {
                    Text("Confirm")
                }
            },
            dismissButton = {
                TextButton(onClick = { showScheduleDialog = false }) { Text("Cancel", color = CharcoalMuted) }
            }
        )
    }
}
