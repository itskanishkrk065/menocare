package com.menocare.app.ui.doctor

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.menocare.app.core.network.ApiClient
import com.menocare.app.core.theme.*
import com.menocare.app.data.model.DoctorPatientSummary
import kotlinx.coroutines.launch

@Composable
fun CohortDirectoryScreen(
    onSelectPatient: (String) -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var searchQuery by remember { mutableStateOf("") }
    var selectedFilter by remember { mutableStateOf("All") }

    var cohort by remember {
        mutableStateOf(
            listOf(
                DoctorPatientSummary("118D96BF", "Joshika Kelavi", 47, "late_perimenopause", 26, "2 hours ago", isHighRisk = true, "Late Perimenopause"),
                DoctorPatientSummary("23EC0D81", "Priya Onboarded", 49, "early_perimenopause", 16, "Today, 08:30 AM", isHighRisk = false, "Typical Perimenopause"),
                DoctorPatientSummary("39BFF4FB", "Ananya Deshmukh", 44, "early_perimenopause", 22, "Yesterday", isHighRisk = false, "PCOD / PCOS Phenotype"),
                DoctorPatientSummary("94CC944C", "Sarah Jenkins", 38, "postmenopause", 31, "Nov 26", isHighRisk = true, "True Premature Ovarian Insufficiency"),
                DoctorPatientSummary("B1935D33", "Elena Vance", 51, "postmenopause", 12, "Nov 25", isHighRisk = false, "Postmenopausal Regimen")
            )
        )
    }

    LaunchedEffect(Unit) {
        coroutineScope.launch {
            try {
                val remote = ApiClient.service.getAuthorizedPatients()
                if (remote.isNotEmpty()) cohort = remote
            } catch (e: Exception) {}
        }
    }

    val filtered = cohort.filter {
        val matchesSearch = it.fullName.contains(searchQuery, ignoreCase = true) || it.id.contains(searchQuery, ignoreCase = true)
        val matchesFilter = when (selectedFilter) {
            "All" -> true
            "High Risk" -> it.isHighRisk
            "Perimenopause" -> it.strawStage.contains("perimenopause")
            "Postmenopause" -> it.strawStage.contains("postmenopause")
            else -> true
        }
        matchesSearch && matchesFilter
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Ivory)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item { Spacer(modifier = Modifier.height(4.dp)) }

        // Search Bar
        item {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search patient name, ID (#118D96BF)...", fontSize = 12.sp) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search", tint = CharcoalMuted) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp)
            )
        }

        // Filter Chips
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                listOf("All", "High Risk", "Perimenopause", "Postmenopause").forEach { filter ->
                    val isSelected = selectedFilter == filter
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedFilter = filter },
                        label = { Text(filter, fontSize = 11.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = SageDark,
                            selectedLabelColor = Cream
                        )
                    )
                }
            }
        }

        item {
            Text("Active Patient Cohort (${filtered.size})", style = Typography.titleMedium, color = Charcoal)
        }

        items(filtered) { patient ->
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(SurfaceCard, RoundedCornerShape(16.dp))
                    .border(1.dp, BorderWarm, RoundedCornerShape(16.dp))
                    .clickable { onSelectPatient(patient.id) }
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(patient.fullName, style = Typography.titleMedium.copy(fontSize = 15.sp), color = Charcoal)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("#${patient.id}", style = Typography.labelSmall.copy(color = CharcoalMuted, fontSize = 10.sp))
                        }
                        Text(
                            "Age ${patient.age} · ${patient.phenotype}",
                            style = Typography.bodyMedium.copy(fontSize = 11.sp)
                        )
                    }

                    Box(
                        modifier = Modifier
                            .background(if (patient.isHighRisk) ErrorContainer else SageSoft, RoundedCornerShape(10.dp))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            "MRS ${patient.latestMrs} / 44",
                            style = Typography.labelSmall.copy(
                                color = if (patient.isHighRisk) ErrorRed else SageDark,
                                fontWeight = androidx.compose.ui.text.font.FontWeight.Bold,
                                fontSize = 11.sp
                            )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Last Check-in: ${patient.lastCheckIn ?: "Recent"}", style = Typography.labelSmall.copy(fontSize = 10.sp, color = CharcoalMuted))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("View Dossier", fontSize = 11.sp, fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold, color = SageDark)
                        Icon(Icons.Default.ChevronRight, contentDescription = "Open", tint = SageDark, modifier = Modifier.size(16.dp))
                    }
                }
            }
        }

        item { Spacer(modifier = Modifier.height(24.dp)) }
    }
}
