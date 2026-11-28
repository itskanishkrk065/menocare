package com.menocare.app.ui.patient

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.menocare.app.core.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MoreDrawerSheet(
    onDismiss: () -> Unit,
    onNavigate: (String) -> Unit,
    onOpenMrs: () -> Unit,
    onOpenBreathing: () -> Unit,
    onSignOut: () -> Unit
) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = Cream,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 8.dp)
                .navigationBarsPadding()
        ) {
            Text(
                text = "Clinical Tools & Care Pathways",
                style = Typography.titleMedium,
                color = Charcoal,
                modifier = Modifier.padding(bottom = 12.dp)
            )

            MoreMenuItem(
                icon = Icons.Default.CalendarMonth,
                title = "Cycle & Period Calendar",
                subtitle = "Track cadence, flow, and luteal phase patterns",
                onClick = { onDismiss(); onNavigate("patient_calendar") }
            )

            MoreMenuItem(
                icon = Icons.Default.Biotech,
                title = "Diagnostic Lab Vault",
                subtitle = "Blood tests (FSH, Estradiol, TSH) & upload results",
                onClick = { onDismiss(); onNavigate("patient_labs") }
            )

            MoreMenuItem(
                icon = Icons.Default.VideoCall,
                title = "Doctor Telehealth & Consultations",
                subtitle = "Upcoming video consultations and meeting requests",
                onClick = { onDismiss(); onNavigate("patient_telehealth") }
            )

            MoreMenuItem(
                icon = Icons.Default.ChatBubble,
                title = "Care Team Messaging",
                subtitle = "Direct asynchronous clinical chat with your doctor",
                onClick = { onDismiss(); onNavigate("patient_chat") }
            )

            MoreMenuItem(
                icon = Icons.Default.Assessment,
                title = "Menopause Rating Scale (MRS)",
                subtitle = "Validated 11-item baseline assessment across 3 domains",
                onClick = { onDismiss(); onOpenMrs() }
            )

            MoreMenuItem(
                icon = Icons.Default.Air,
                title = "Paced 4-7-8 Breathing Guide",
                subtitle = "Guided autonomic reset for hot flash & anxiety surges",
                onClick = { onDismiss(); onOpenBreathing() }
            )

            HorizontalDivider(color = BorderWarm, modifier = Modifier.padding(vertical = 12.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onDismiss(); onSignOut() }
                    .padding(vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.AutoMirrored.Filled.ExitToApp, contentDescription = "Sign Out", tint = ErrorRed)
                Spacer(modifier = Modifier.width(16.dp))
                Text("Sign Out", style = Typography.titleMedium.copy(color = ErrorRed, fontSize = 14.sp))
            }
        }
    }
}

@Composable
private fun MoreMenuItem(
    icon: ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .background(SageSoft, RoundedCornerShape(12.dp)),
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, contentDescription = title, tint = SageDark, modifier = Modifier.size(20.dp))
        }
        Spacer(modifier = Modifier.width(14.dp))
        Column {
            Text(text = title, style = Typography.titleMedium.copy(fontSize = 14.sp), color = Charcoal)
            Text(text = subtitle, style = Typography.bodyMedium.copy(fontSize = 11.sp), color = CharcoalMuted)
        }
    }
}
