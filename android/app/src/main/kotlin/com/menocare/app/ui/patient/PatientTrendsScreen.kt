package com.menocare.app.ui.patient

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.menocare.app.core.network.ApiClient
import com.menocare.app.core.theme.*
import com.menocare.app.data.model.ChartPoint
import com.menocare.app.ui.components.CanvasLineChart
import kotlinx.coroutines.launch

@Composable
fun PatientTrendsScreen(
    onNavigateBack: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var selectedDays by remember { mutableIntStateOf(30) }
    var selectedDomain by remember { mutableStateOf("All") }
    var points by remember {
        mutableStateOf(
            listOf(
                ChartPoint("Nov 01", 14f, 13.5f, 12f),
                ChartPoint("Nov 05", 16f, 14.2f, 12f),
                ChartPoint("Nov 10", 11f, 13.8f, 12f),
                ChartPoint("Nov 15", 18f, 15.0f, 12f),
                ChartPoint("Nov 20", 12f, 14.1f, 12f),
                ChartPoint("Nov 25", 9f, 13.0f, 12f),
                ChartPoint("Nov 28", 10f, 12.2f, 12f)
            )
        )
    }

    LaunchedEffect(selectedDays) {
        coroutineScope.launch {
            try {
                val data = ApiClient.service.getCharts(selectedDays)
                if (data.overallTrend.isNotEmpty()) {
                    points = data.overallTrend
                }
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

                // 30d vs 90d toggle
                Row(
                    modifier = Modifier
                        .background(Cream, RoundedCornerShape(10.dp))
                        .border(1.dp, BorderWarm, RoundedCornerShape(10.dp))
                ) {
                    listOf(30 to "30 Days", 90 to "90 Days").forEach { (d, label) ->
                        val isSelected = selectedDays == d
                        Box(
                            modifier = Modifier
                                .background(if (isSelected) SageDark else Cream, RoundedCornerShape(10.dp))
                                .clickable { selectedDays = d }
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = label,
                                fontSize = 11.sp,
                                color = if (isSelected) Cream else CharcoalMuted,
                                fontWeight = if (isSelected) androidx.compose.ui.text.font.FontWeight.Bold else androidx.compose.ui.text.font.FontWeight.Normal
                            )
                        }
                    }
                }
            }
        }

        // Domain Filter Chips
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                listOf("All", "Vasomotor", "Sleep", "Mood", "Cognitive").forEach { domain ->
                    val isSelected = selectedDomain == domain
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedDomain = domain },
                        label = { Text(domain, fontSize = 11.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = SageDark,
                            selectedLabelColor = Cream
                        )
                    )
                }
            }
        }

        // Canvas Line Chart
        item {
            Text("Symptom Patterns Over Time", style = Typography.titleMedium, color = Charcoal)
            Spacer(modifier = Modifier.height(4.dp))
            CanvasLineChart(
                points = points,
                lineColor = if (selectedDomain == "Vasomotor") Peach else SageDark
            )
        }

        // AI Clinical Narrative Summary
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Cream, RoundedCornerShape(16.dp))
                    .border(1.dp, BorderWarm, RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .background(SageDark, RoundedCornerShape(2.dp))
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Clinical Narrative Summary", style = Typography.titleMedium.copy(fontSize = 14.sp), color = Charcoal)
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "Vasomotor episodes have stabilized over the past 14 days following initiation of micronized progesterone. Sleep continuity index improved by 28%, with nocturnal waking episodes declining from 4/night to 1/night. Mild morning cognitive recall latency persists and correlates with late-afternoon caffeine intake.",
                    style = Typography.bodyMedium.copy(fontSize = 12.sp, lineHeight = 18.sp),
                    color = Charcoal
                )
            }
        }

        item { Spacer(modifier = Modifier.height(24.dp)) }
    }
}
