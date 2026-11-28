package com.menocare.app.ui.doctor

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.menocare.app.core.theme.*
import com.menocare.app.data.model.LabAnalyte
import com.menocare.app.data.model.LabReportDto

@Composable
fun DiagnosticsScreen() {
    val context = LocalContext.current
    var reports by remember {
        mutableStateOf(
            listOf(
                LabReportDto(
                    id = "rep-1",
                    testDate = "Nov 15, 2026",
                    panelName = "Joshika Kelavi (#118D96BF) · Hormone Panel",
                    analytes = listOf(
                        LabAnalyte("FSH", "48.2", "mIU/mL", "25.8 - 134.8 (Post)", isAbnormal = true),
                        LabAnalyte("Estradiol", "32.0", "pg/mL", "< 30.0 (Post)", isAbnormal = false)
                    ),
                    isVerified = false
                ),
                LabReportDto(
                    id = "rep-2",
                    testDate = "Nov 18, 2026",
                    panelName = "Sarah Jenkins (#94CC944C) · Thyroid & Lipid",
                    analytes = listOf(
                        LabAnalyte("TSH", "6.42", "uIU/mL", "0.45 - 4.50", isAbnormal = true),
                        LabAnalyte("Free T4", "0.74", "ng/dL", "0.82 - 1.77", isAbnormal = true)
                    ),
                    isVerified = true
                )
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
            Column {
                Text("Practice Diagnostic Lab Vault", style = Typography.headlineMedium.copy(fontSize = 18.sp), color = Charcoal)
                Text("Practice-wide abnormal lab results and clinician verification workflows", style = Typography.bodyMedium.copy(fontSize = 11.sp))
            }
        }

        items(reports) { report ->
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
                    Text(report.panelName, style = Typography.titleMedium.copy(fontSize = 13.sp), color = Charcoal)
                    Box(
                        modifier = Modifier
                            .background(if (report.isVerified) SageSoft else PeachSoft, RoundedCornerShape(8.dp))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            if (report.isVerified) "VERIFIED" else "PENDING SIGN-OFF",
                            fontSize = 9.sp,
                            fontWeight = androidx.compose.ui.text.font.FontWeight.Bold,
                            color = if (report.isVerified) SageDark else Peach
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                report.analytes.forEach { a ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                            .background(if (a.isAbnormal) PeachSoft else Ivory, RoundedCornerShape(8.dp))
                            .padding(horizontal = 8.dp, vertical = 6.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(a.name, fontSize = 11.sp, color = Charcoal)
                        Text(
                            "${a.value} ${a.unit} (Ref: ${a.referenceRange})",
                            fontSize = 11.sp,
                            fontWeight = androidx.compose.ui.text.font.FontWeight.Bold,
                            color = if (a.isAbnormal) Peach else SageDark
                        )
                    }
                }

                if (!report.isVerified) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Button(
                        onClick = {
                            reports = reports.map { if (it.id == report.id) it.copy(isVerified = true) else it }
                            Toast.makeText(context, "Lab panel verified and signed off.", Toast.LENGTH_SHORT).show()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Verify & Sign-off Panel", fontSize = 11.sp)
                    }
                }
            }
        }

        item { Spacer(modifier = Modifier.height(24.dp)) }
    }
}
