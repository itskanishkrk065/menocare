package com.menocare.app.core.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColorScheme = lightColorScheme(
    primary = SageDark,
    onPrimary = Cream,
    primaryContainer = SageSoft,
    onPrimaryContainer = SageDark,
    secondary = Teal,
    onSecondary = Cream,
    secondaryContainer = TealSoft,
    onSecondaryContainer = TealDark,
    tertiary = Peach,
    onTertiary = Cream,
    tertiaryContainer = PeachSoft,
    onTertiaryContainer = Peach,
    background = Ivory,
    onBackground = Charcoal,
    surface = Cream,
    onSurface = Charcoal,
    surfaceVariant = OatLight,
    onSurfaceVariant = CharcoalMuted,
    outline = BorderWarm,
    error = ErrorRed,
    errorContainer = ErrorContainer,
    onError = Cream,
    onErrorContainer = ErrorRed
)

@Composable
fun MenoCareTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    // MenoCare intentionally maintains its signature warm clinical aesthetic
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = Typography,
        content = content
    )
}
