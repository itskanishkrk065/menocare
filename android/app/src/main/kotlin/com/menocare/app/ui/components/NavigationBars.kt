package com.menocare.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.menocare.app.core.theme.*

@Composable
fun PatientBottomNavBar(
    currentRoute: String,
    onNavigate: (String) -> Unit,
    onOpenCheckIn: () -> Unit,
    onOpenMore: () -> Unit
) {
    NavigationBar(
        containerColor = Cream,
        contentColor = Charcoal,
        tonalElevation = 8.dp,
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, BorderWarm, RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp))
            .clip(RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp))
    ) {
        // 1. Overview
        NavigationBarItem(
            selected = currentRoute == "patient_overview",
            onClick = { onNavigate("patient_overview") },
            icon = { Icon(Icons.Default.Home, contentDescription = "Overview", modifier = Modifier.size(22.dp)) },
            label = { Text("Overview", fontSize = 10.sp, fontWeight = androidx.compose.ui.text.font.FontWeight.Medium) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = SageDark,
                selectedTextColor = SageDark,
                indicatorColor = SageSoft,
                unselectedIconColor = CharcoalMuted,
                unselectedTextColor = CharcoalMuted
            )
        )

        // 2. Trends
        NavigationBarItem(
            selected = currentRoute == "patient_trends",
            onClick = { onNavigate("patient_trends") },
            icon = { Icon(Icons.Default.TrendingUp, contentDescription = "Trends", modifier = Modifier.size(22.dp)) },
            label = { Text("Trends", fontSize = 10.sp, fontWeight = androidx.compose.ui.text.font.FontWeight.Medium) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = SageDark,
                selectedTextColor = SageDark,
                indicatorColor = SageSoft,
                unselectedIconColor = CharcoalMuted,
                unselectedTextColor = CharcoalMuted
            )
        )

        // 3. Center FAB: Daily Check-In
        NavigationBarItem(
            selected = false,
            onClick = onOpenCheckIn,
            icon = {
                Surface(
                    shape = CircleShape,
                    color = SageDark,
                    shadowElevation = 4.dp,
                    modifier = Modifier.size(42.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            Icons.Default.Add,
                            contentDescription = "Start Check-in",
                            tint = Cream,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
            },
            label = {
                Text(
                    "Check-In",
                    fontSize = 10.sp,
                    fontWeight = androidx.compose.ui.text.font.FontWeight.Medium
                )
            },
            colors = NavigationBarItemDefaults.colors(
                indicatorColor = Color.Transparent,
                unselectedTextColor = CharcoalMuted
            )
        )

        // 4. Care (Medications)
        NavigationBarItem(
            selected = currentRoute == "patient_care" || currentRoute == "patient_calendar",
            onClick = { onNavigate("patient_care") },
            icon = { Icon(Icons.Default.Medication, contentDescription = "Care", modifier = Modifier.size(22.dp)) },
            label = { Text("Care", fontSize = 10.sp, fontWeight = androidx.compose.ui.text.font.FontWeight.Medium) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = SageDark,
                selectedTextColor = SageDark,
                indicatorColor = SageSoft,
                unselectedIconColor = CharcoalMuted,
                unselectedTextColor = CharcoalMuted
            )
        )

        // 5. More Menu
        NavigationBarItem(
            selected = false,
            onClick = onOpenMore,
            icon = { Icon(Icons.Default.Menu, contentDescription = "More", modifier = Modifier.size(22.dp)) },
            label = { Text("More", fontSize = 10.sp, fontWeight = androidx.compose.ui.text.font.FontWeight.Medium) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = SageDark,
                selectedTextColor = SageDark,
                indicatorColor = SageSoft,
                unselectedIconColor = CharcoalMuted,
                unselectedTextColor = CharcoalMuted
            )
        )
    }
}

@Composable
fun DoctorBottomNavBar(
    currentRoute: String,
    onNavigate: (String) -> Unit,
    criticalAlertsCount: Int = 3
) {
    NavigationBar(
        containerColor = Cream,
        contentColor = Charcoal,
        tonalElevation = 8.dp,
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, BorderWarm, RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp))
            .clip(RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp))
    ) {
        // 1. Command
        NavigationBarItem(
            selected = currentRoute == "doctor_command",
            onClick = { onNavigate("doctor_command") },
            icon = {
                BadgedBox(badge = {
                    if (criticalAlertsCount > 0) {
                        Badge(containerColor = ErrorRed, contentColor = Cream) { Text("$criticalAlertsCount") }
                    }
                }) {
                    Icon(Icons.Default.Dashboard, contentDescription = "Command", modifier = Modifier.size(22.dp))
                }
            },
            label = { Text("Command", fontSize = 10.sp) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = SageDark,
                selectedTextColor = SageDark,
                indicatorColor = SageSoft,
                unselectedIconColor = CharcoalMuted,
                unselectedTextColor = CharcoalMuted
            )
        )

        // 2. Cohort
        NavigationBarItem(
            selected = currentRoute == "doctor_cohort" || currentRoute.startsWith("doctor_dossier"),
            onClick = { onNavigate("doctor_cohort") },
            icon = { Icon(Icons.Default.People, contentDescription = "Cohort", modifier = Modifier.size(22.dp)) },
            label = { Text("Cohort", fontSize = 10.sp) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = SageDark,
                selectedTextColor = SageDark,
                indicatorColor = SageSoft,
                unselectedIconColor = CharcoalMuted,
                unselectedTextColor = CharcoalMuted
            )
        )

        // 3. Visits
        NavigationBarItem(
            selected = currentRoute == "doctor_visits",
            onClick = { onNavigate("doctor_visits") },
            icon = { Icon(Icons.Default.VideoCall, contentDescription = "Visits", modifier = Modifier.size(22.dp)) },
            label = { Text("Visits", fontSize = 10.sp) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = SageDark,
                selectedTextColor = SageDark,
                indicatorColor = SageSoft,
                unselectedIconColor = CharcoalMuted,
                unselectedTextColor = CharcoalMuted
            )
        )

        // 4. Labs
        NavigationBarItem(
            selected = currentRoute == "doctor_diagnostics",
            onClick = { onNavigate("doctor_diagnostics") },
            icon = { Icon(Icons.Default.Biotech, contentDescription = "Labs", modifier = Modifier.size(22.dp)) },
            label = { Text("Labs", fontSize = 10.sp) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = SageDark,
                selectedTextColor = SageDark,
                indicatorColor = SageSoft,
                unselectedIconColor = CharcoalMuted,
                unselectedTextColor = CharcoalMuted
            )
        )

        // 5. Messages
        NavigationBarItem(
            selected = currentRoute == "doctor_chat",
            onClick = { onNavigate("doctor_chat") },
            icon = { Icon(Icons.Default.ChatBubble, contentDescription = "Messages", modifier = Modifier.size(22.dp)) },
            label = { Text("Chat", fontSize = 10.sp) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = SageDark,
                selectedTextColor = SageDark,
                indicatorColor = SageSoft,
                unselectedIconColor = CharcoalMuted,
                unselectedTextColor = CharcoalMuted
            )
        )
    }
}
