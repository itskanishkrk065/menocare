package com.menocare.app.ui.patient

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.menocare.app.core.theme.*

@Composable
fun PatientCalendarScreen(
    onNavigateBack: () -> Unit
) {
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
                            .background(PeachSoft, RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.CalendarMonth, contentDescription = "Calendar", tint = Peach)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text("Cycle & Period Cadence", style = Typography.headlineMedium.copy(fontSize = 17.sp), color = Charcoal)
                        Text("Days Since Last Period: 8 Days · Irregular Perimenopausal Cadence", style = Typography.bodyMedium.copy(fontSize = 11.sp))
                    }
                }
            }
        }

        // Calendar Grid Representation
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(SurfaceCard, RoundedCornerShape(16.dp))
                    .border(1.dp, BorderWarm, RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Text("November 2026", style = Typography.titleMedium, color = Charcoal)
                Spacer(modifier = Modifier.height(12.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    listOf("S", "M", "T", "W", "T", "F", "S").forEach {
                        Text(it, style = Typography.labelSmall.copy(color = CharcoalMuted), modifier = Modifier.width(36.dp), textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Days 1 to 28
                val days = (1..28).toList()
                val chunked = days.chunked(7)
                chunked.forEach { week ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        week.forEach { day ->
                            val isBleedingDay = day in 1..4
                            val isSpottingDay = day == 5 || day == 14
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .background(
                                        when {
                                            isBleedingDay -> PeachSoft
                                            isSpottingDay -> LavenderSoft
                                            else -> Ivory
                                        },
                                        RoundedCornerShape(8.dp)
                                    )
                                    .border(
                                        1.dp,
                                        when {
                                            isBleedingDay -> Peach
                                            isSpottingDay -> Lavender
                                            else -> BorderWarm.copy(alpha = 0.5f)
                                        },
                                        RoundedCornerShape(8.dp)
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "$day",
                                    fontSize = 12.sp,
                                    color = if (isBleedingDay) Peach else Charcoal,
                                    fontWeight = if (isBleedingDay || isSpottingDay) androidx.compose.ui.text.font.FontWeight.Bold else androidx.compose.ui.text.font.FontWeight.Normal
                                )
                            }
                        }
                    }
                }
            }
        }

        // Legend & Cadence Insights
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Cream, RoundedCornerShape(16.dp))
                    .border(1.dp, BorderWarm, RoundedCornerShape(16.dp))
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text("Flow & Bleeding Guide", style = Typography.titleMedium.copy(fontSize = 13.sp), color = Charcoal)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(12.dp).background(Peach, RoundedCornerShape(3.dp)))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Menstrual Flow (Days 1–4): Heavy to Moderate", fontSize = 11.sp, color = Charcoal)
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(12.dp).background(Lavender, RoundedCornerShape(3.dp)))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Mid-cycle Spotting (Days 5, 14): Low Progesterone", fontSize = 11.sp, color = Charcoal)
                }
            }
        }

        item { Spacer(modifier = Modifier.height(24.dp)) }
    }
}
