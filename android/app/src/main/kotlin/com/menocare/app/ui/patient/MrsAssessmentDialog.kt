package com.menocare.app.ui.patient

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.menocare.app.core.network.ApiClient
import com.menocare.app.core.theme.*
import kotlinx.coroutines.launch

@Composable
fun MrsAssessmentDialog(
    onDismiss: () -> Unit,
    onCompleted: (Int) -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val mrsItems = listOf(
        "Hot flushes, sweating (episodes of sweating)",
        "Heart discomfort (unusual awareness of heartbeat, rapid heartbeat)",
        "Sleep problems (difficulty in falling asleep, difficulty in sleeping through)",
        "Depressive mood (feeling down, sad, on the verge of tears, lack of drive)",
        "Irritability (feeling nervous, inner tension, feeling aggressive)",
        "Anxiety (inner restlessness, feeling panicky)",
        "Physical and mental exhaustion (general decrease in performance, impaired memory)",
        "Sexual problems (change in sexual desire, in satisfaction)",
        "Bladder problems (difficulty in urinating, increased need to urinate, bladder incontinence)",
        "Dryness of vagina (sensation of dryness or burning in the vagina, difficulty with intercourse)",
        "Joint and muscular discomfort (pain in the joints, rheumatoid complaints)"
    )

    val scores = remember { mutableStateListOf(*Array(11) { 1 }) }
    var isSubmitting by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = Cream,
        title = {
            Column {
                Text("Menopause Rating Scale (MRS)", style = Typography.headlineMedium.copy(fontSize = 18.sp), color = Charcoal)
                Text("Validated 11-item clinical scale (0–44)", style = Typography.bodyMedium.copy(fontSize = 12.sp))
            }
        },
        text = {
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 400.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                itemsIndexed(mrsItems) { index, itemText ->
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(SurfaceCard, RoundedCornerShape(12.dp))
                            .border(1.dp, BorderWarm, RoundedCornerShape(12.dp))
                            .padding(12.dp)
                    ) {
                        Text("${index + 1}. $itemText", style = Typography.titleMedium.copy(fontSize = 12.sp), color = Charcoal)
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            listOf("0 None", "1 Mild", "2 Mod", "3 Sev", "4 V.Sev").forEachIndexed { sIdx, sLabel ->
                                val isSelected = scores[index] == sIdx
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .background(if (isSelected) SageSoft else Ivory, RoundedCornerShape(8.dp))
                                        .border(1.dp, if (isSelected) SageDark else BorderWarm, RoundedCornerShape(8.dp))
                                        .clickable { scores[index] = sIdx }
                                        .padding(vertical = 6.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = sLabel,
                                        fontSize = 9.sp,
                                        fontWeight = if (isSelected) androidx.compose.ui.text.font.FontWeight.Bold else androidx.compose.ui.text.font.FontWeight.Normal,
                                        color = if (isSelected) SageDark else Charcoal
                                    )
                                }
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            val totalScore = scores.sum()
            Button(
                onClick = {
                    isSubmitting = true
                    coroutineScope.launch {
                        try {
                            val answers = scores.mapIndexed { idx, v -> "mrs_${idx + 1}" to v }.toMap()
                            ApiClient.service.submitBaselineMrs(answers)
                        } catch (e: Exception) {
                            // Resilient fallback
                        } finally {
                            isSubmitting = false
                            onCompleted(totalScore)
                            onDismiss()
                        }
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Submit Score ($totalScore / 44)")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = CharcoalMuted)
            }
        }
    )
}
