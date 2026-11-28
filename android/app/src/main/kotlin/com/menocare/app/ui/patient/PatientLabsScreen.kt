package com.menocare.app.ui.patient

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Biotech
import androidx.compose.material.icons.filled.UploadFile
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.menocare.app.core.theme.*
import com.menocare.app.data.model.LabAnalyte
import com.menocare.app.data.model.LabReportDto

@Composable
fun PatientLabsScreen(
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val labReports = listOf(
        LabReportDto(
            id = "lab-01",
            testDate = "Nov 15, 2026",
            panelName = "Endocrine Menopause Hormone Panel",
            analytes = listOf(
                LabAnalyte("FSH (Follicle-Stimulating Hormone)", "48.2", "mIU/mL", "25.8 - 134.8 (Post)", isAbnormal = true),
                LabAnalyte("Estradiol (E2)", "32.0", "pg/mL", "< 30.0 (Post)", isAbnormal = false),
                LabAnalyte("TSH (Thyroid Stimulating Hormone)", "2.14", "uIU/mL", "0.45 - 4.50", isAbnormal = false),
                LabAnalyte("Free T4", "1.12", "ng/dL", "0.82 - 1.77", isAbnormal = false),
                LabAnalyte("Ferritin", "42", "ng/mL", "15 - 150", isAbnormal = false)
            ),
            isVerified = true
        )
    )

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
                    onClick = { Toast.makeText(context, "Opening Document Picker...", Toast.LENGTH_SHORT).show() },
                    colors = ButtonDefaults.buttonColors(containerColor = Teal, contentColor = Cream),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.UploadFile, contentDescription = "Upload", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Upload Lab PDF", fontSize = 11.sp)
                }
            }
        }

        // Header Card
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
                            .background(TealSoft, RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Biotech, contentDescription = "Labs", tint = TealDark)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text("Diagnostic Lab Vault", style = Typography.headlineMedium.copy(fontSize = 17.sp), color = Charcoal)
                        Text("Longitudinal blood tests, reference ranges & clinician verification", style = Typography.bodyMedium.copy(fontSize = 11.sp))
                    }
                }
            }
        }

        // Reports
        items(labReports) { report ->
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
                    Text(report.panelName, style = Typography.titleMedium.copy(fontSize = 14.sp), color = Charcoal)
                    Box(
                        modifier = Modifier
                            .background(SageSoft, RoundedCornerShape(8.dp))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text("VERIFIED BY DOCTOR", style = Typography.labelSmall.copy(color = SageDark, fontSize = 9.sp))
                    }
                }

                Text("Date: ${report.testDate}", style = Typography.bodyMedium.copy(fontSize = 11.sp), modifier = Modifier.padding(top = 2.dp))

                Spacer(modifier = Modifier.height(12.dp))

                report.analytes.forEach { analyte ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp)
                            .background(if (analyte.isAbnormal) PeachSoft else Ivory, RoundedCornerShape(8.dp))
                            .padding(horizontal = 10.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(analyte.name, fontSize = 11.sp, fontWeight = androidx.compose.ui.text.font.FontWeight.Medium, color = Charcoal)
                            Text("Ref: ${analyte.referenceRange}", fontSize = 10.sp, color = CharcoalMuted)
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = "${analyte.value} ${analyte.unit}",
                                fontSize = 12.sp,
                                fontWeight = androidx.compose.ui.text.font.FontWeight.Bold,
                                color = if (analyte.isAbnormal) Peach else SageDark
                            )
                            if (analyte.isAbnormal) {
                                Text("Elevated / Menopause Range", fontSize = 9.sp, color = Peach)
                            }
                        }
                    }
                }
            }
        }

        item { Spacer(modifier = Modifier.height(24.dp)) }
    }
}
