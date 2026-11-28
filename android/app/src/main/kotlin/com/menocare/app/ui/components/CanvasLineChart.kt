package com.menocare.app.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.menocare.app.core.theme.*
import com.menocare.app.data.model.ChartPoint

@Composable
fun CanvasLineChart(
    points: List<ChartPoint>,
    modifier: Modifier = Modifier,
    lineColor: Color = SageDark,
    baselineColor: Color = SageSoft
) {
    if (points.isEmpty()) {
        Box(
            modifier = modifier
                .background(Cream, RoundedCornerShape(16.dp))
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Text("No symptom logs recorded in this timeframe", style = Typography.bodyMedium)
        }
        return
    }

    val maxScore = (points.maxOfOrNull { it.score } ?: 20f).coerceAtLeast(10f)

    Column(
        modifier = modifier
            .background(Cream, RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .height(180.dp)
        ) {
            val width = size.width
            val height = size.height
            val spacing = if (points.size > 1) width / (points.size - 1) else width

            // Draw horizontal reference gridlines (0, 50%, 100%)
            val gridColor = BorderWarm.copy(alpha = 0.6f)
            drawLine(gridColor, Offset(0f, 0f), Offset(width, 0f), strokeWidth = 1.dp.toPx())
            drawLine(gridColor, Offset(0f, height / 2), Offset(width, height / 2), strokeWidth = 1.dp.toPx())
            drawLine(gridColor, Offset(0f, height), Offset(width, height), strokeWidth = 1.dp.toPx())

            // 1. Draw 30-day baseline band/line if available
            val baselinePath = Path()
            points.forEachIndexed { i, pt ->
                val bVal = pt.baseline30d ?: (maxScore * 0.4f)
                val x = i * spacing
                val y = height - (bVal / maxScore * height)
                if (i == 0) baselinePath.moveTo(x, y) else baselinePath.lineTo(x, y)
            }
            drawPath(
                path = baselinePath,
                color = Peach.copy(alpha = 0.5f),
                style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round)
            )

            // 2. Draw 7-day rolling average spline
            val avgPath = Path()
            points.forEachIndexed { i, pt ->
                val aVal = pt.rollingAvg7d ?: pt.score
                val x = i * spacing
                val y = height - (aVal / maxScore * height).coerceIn(0f, height)
                if (i == 0) avgPath.moveTo(x, y) else avgPath.lineTo(x, y)
            }
            drawPath(
                path = avgPath,
                color = Teal,
                style = Stroke(width = 2.5.dp.toPx(), cap = StrokeCap.Round)
            )

            // 3. Draw daily score points and connect line
            val dailyPath = Path()
            points.forEachIndexed { i, pt ->
                val x = i * spacing
                val y = height - (pt.score / maxScore * height).coerceIn(0f, height)
                if (i == 0) dailyPath.moveTo(x, y) else dailyPath.lineTo(x, y)
                // Draw circle dot
                drawCircle(
                    color = Cream,
                    radius = 4.dp.toPx(),
                    center = Offset(x, y)
                )
                drawCircle(
                    color = lineColor,
                    radius = 3.dp.toPx(),
                    center = Offset(x, y)
                )
            }
            drawPath(
                path = dailyPath,
                color = lineColor.copy(alpha = 0.7f),
                style = Stroke(width = 1.5.dp.toPx(), cap = StrokeCap.Round)
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Legend
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            LegendItem(color = SageDark, label = "Daily Score")
            LegendItem(color = Teal, label = "7-Day Trend")
            LegendItem(color = Peach, label = "30-Day Baseline")
        }
    }
}

@Composable
private fun LegendItem(color: Color, label: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .background(color, RoundedCornerShape(2.dp))
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(text = label, style = Typography.labelSmall.copy(fontSize = 11.sp))
    }
}
