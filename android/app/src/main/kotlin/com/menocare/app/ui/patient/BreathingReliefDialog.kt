package com.menocare.app.ui.patient

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.menocare.app.core.theme.*

@Composable
fun BreathingReliefDialog(
    onDismiss: () -> Unit
) {
    var phase by remember { mutableStateOf("Inhale (4s)") }
    val infiniteTransition = rememberInfiniteTransition(label = "breathing")

    val scale by infiniteTransition.animateFloat(
        initialValue = 0.8f,
        targetValue = 1.3f,
        animationSpec = infiniteRepeatable(
            animation = tween(4000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scale"
    )

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = Cream,
        title = {
            Text("Paced 4-7-8 Breathing Guide", style = Typography.headlineMedium.copy(fontSize = 18.sp), color = Charcoal)
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    "Autonomic Vagal Nerve Stimulation for Hot Flash & Panic Surges",
                    style = Typography.bodyMedium.copy(fontSize = 12.sp),
                    color = CharcoalMuted
                )

                Spacer(modifier = Modifier.height(32.dp))

                Box(
                    modifier = Modifier
                        .size(140.dp)
                        .scale(scale)
                        .background(TealSoft, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(100.dp)
                            .background(Teal, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = if (scale > 1.05f) "Hold / Exhale" else "Inhale Slowly",
                            style = Typography.labelLarge.copy(color = Cream, fontSize = 11.sp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(32.dp))

                Text(
                    "Inhale through nose for 4s · Hold gently for 7s · Exhale through mouth for 8s",
                    style = Typography.labelSmall.copy(fontSize = 11.sp, color = Charcoal),
                    modifier = Modifier.padding(horizontal = 12.dp)
                )
            }
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Complete Reset")
            }
        }
    )
}
