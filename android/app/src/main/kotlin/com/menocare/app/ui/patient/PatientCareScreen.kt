package com.menocare.app.ui.patient

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Medication
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.menocare.app.core.network.ApiClient
import com.menocare.app.core.theme.*
import com.menocare.app.data.model.CreateMedicationRequest
import com.menocare.app.data.model.MedicationDto
import kotlinx.coroutines.launch

@Composable
fun PatientCareScreen(
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var showAddDialog by remember { mutableStateOf(false) }
    var medications by remember {
        mutableStateOf(
            listOf(
                MedicationDto("1", "Estradiol Transdermal Patch", "0.05 mg/day", "Twice weekly", "Morning", isTakenToday = true, "Apply to lower abdomen"),
                MedicationDto("2", "Micronized Progesterone", "100 mg", "Daily at bedtime", "Night", isTakenToday = true, "Continuous combined protocol"),
                MedicationDto("3", "Magnesium Glycinate", "300 mg", "Daily at dinner", "Evening", isTakenToday = false, "Supports neuromuscular recovery & sleep")
            )
        )
    }

    LaunchedEffect(Unit) {
        coroutineScope.launch {
            try {
                val list = ApiClient.service.getMedications()
                if (list.isNotEmpty()) medications = list
            } catch (e: Exception) {}
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Ivory)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
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

                Button(
                    onClick = { showAddDialog = true },
                    colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("+ Add Medication", fontSize = 11.sp)
                }
            }
        }

        // 7-Day Adherence Banner
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
                        Text("Your Medications & Care Adherence", style = Typography.headlineMedium.copy(fontSize = 17.sp), color = Charcoal)
                        Text("Track daily hormone therapy and prescription supplements", style = Typography.bodyMedium.copy(fontSize = 11.sp))
                    }
                    Box(
                        modifier = Modifier
                            .background(SageSoft, RoundedCornerShape(12.dp))
                            .border(1.dp, SageAccent, RoundedCornerShape(12.dp))
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text("94% 7-Day", style = Typography.labelLarge.copy(color = SageDark, fontSize = 12.sp))
                    }
                }
            }
        }

        // Prescriptions List
        item {
            Text("Active Medication Schedule", style = Typography.titleMedium, color = Charcoal)
        }

        items(medications) { med ->
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
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .background(SageSoft, RoundedCornerShape(10.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Medication, contentDescription = "Med", tint = SageDark, modifier = Modifier.size(20.dp))
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(med.name, style = Typography.titleMedium.copy(fontSize = 14.sp), color = Charcoal)
                            Text("${med.dosage} · ${med.frequency}", style = Typography.bodyMedium.copy(fontSize = 11.sp))
                        }
                    }

                    // Dose Toggle Button
                    Button(
                        onClick = {
                            val updated = medications.map {
                                if (it.id == med.id) it.copy(isTakenToday = !it.isTakenToday) else it
                            }
                            medications = updated
                            coroutineScope.launch {
                                try { ApiClient.service.toggleMedication(med.id) } catch (e: Exception) {}
                            }
                            Toast.makeText(context, if (!med.isTakenToday) "Dose recorded as taken" else "Dose unlogged", Toast.LENGTH_SHORT).show()
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (med.isTakenToday) SageSoft else PeachSoft,
                            contentColor = if (med.isTakenToday) SageDark else Peach
                        ),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        if (med.isTakenToday) {
                            Icon(Icons.Default.CheckCircle, contentDescription = "Taken", modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Taken", fontSize = 11.sp)
                        } else {
                            Text("Take Dose", fontSize = 11.sp)
                        }
                    }
                }

                if (med.instructions != null) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Clinical Instructions: ${med.instructions}",
                        style = Typography.bodyMedium.copy(fontSize = 11.sp, color = CharcoalMuted)
                    )
                }
            }
        }

        item { Spacer(modifier = Modifier.height(24.dp)) }
    }

    if (showAddDialog) {
        var name by remember { mutableStateOf("") }
        var dosage by remember { mutableStateOf("") }
        var freq by remember { mutableStateOf("Daily") }

        AlertDialog(
            onDismissRequest = { showAddDialog = false },
            containerColor = Cream,
            title = { Text("Add Medication", style = Typography.headlineMedium.copy(fontSize = 18.sp), color = Charcoal) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Medication Name") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = dosage,
                        onValueChange = { dosage = it },
                        label = { Text("Dosage (e.g. 100 mg)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (name.isNotBlank()) {
                            val newMed = MedicationDto(
                                id = "${medications.size + 1}",
                                name = name,
                                dosage = dosage,
                                frequency = freq,
                                isTakenToday = false
                            )
                            medications = medications + newMed
                            coroutineScope.launch {
                                try {
                                    ApiClient.service.createMedication(CreateMedicationRequest(name, dosage, freq))
                                } catch (e: Exception) {}
                            }
                            showAddDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream)
                ) {
                    Text("Save Medication")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddDialog = false }) { Text("Cancel", color = CharcoalMuted) }
            }
        )
    }
}
