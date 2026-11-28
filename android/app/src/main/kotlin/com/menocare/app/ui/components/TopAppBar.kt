package com.menocare.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.menocare.app.core.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MenoCareTopBar(
    title: String,
    subtitle: String? = null,
    strawStage: String? = null,
    showBackButton: Boolean = false,
    onBackClick: () -> Unit = {},
    onSignOutClick: () -> Unit
) {
    TopAppBar(
        title = {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = title,
                        style = Typography.titleMedium.copy(fontSize = 17.sp),
                        color = Charcoal
                    )
                    if (strawStage != null) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Box(
                            modifier = Modifier
                                .background(SageSoft, RoundedCornerShape(12.dp))
                                .border(1.dp, SageAccent, RoundedCornerShape(12.dp))
                                .padding(horizontal = 8.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = strawStage.replace("_", " ").capitalizeWords(),
                                style = Typography.labelSmall.copy(color = SageDark, fontSize = 9.sp)
                            )
                        }
                    }
                }
                if (subtitle != null) {
                    Text(
                        text = subtitle,
                        style = Typography.bodyMedium.copy(fontSize = 11.sp, color = CharcoalMuted)
                    )
                }
            }
        },
        navigationIcon = {
            if (showBackButton) {
                IconButton(onClick = onBackClick) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Charcoal)
                }
            }
        },
        actions = {
            IconButton(onClick = onSignOutClick) {
                Icon(Icons.AutoMirrored.Filled.ExitToApp, contentDescription = "Sign Out", tint = CharcoalMuted)
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = Cream
        )
    )
}

private fun String.capitalizeWords(): String =
    split(" ").joinToString(" ") { it.replaceFirstChar { char -> char.uppercase() } }
