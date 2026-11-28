package com.menocare.app.ui.auth

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Mail
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.menocare.app.core.network.ApiClient
import com.menocare.app.core.network.TokenManager
import com.menocare.app.core.theme.*
import com.menocare.app.data.model.LoginRequest
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(
    onLoginSuccess: (String) -> Unit // returns role: "patient" or "doctor"
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Ivory)
            .padding(24.dp)
            .navigationBarsPadding(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // App Branding
        Box(
            modifier = Modifier
                .size(64.dp)
                .background(SageSoft, RoundedCornerShape(20.dp))
                .border(1.dp, SageAccent, RoundedCornerShape(20.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text("🌸", fontSize = 28.sp)
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "MenoCare",
            style = Typography.headlineLarge.copy(fontSize = 32.sp),
            color = Charcoal
        )

        Text(
            text = "Clinical Menopause Care Platform",
            style = Typography.bodyMedium.copy(fontSize = 13.sp, color = CharcoalMuted)
        )

        Spacer(modifier = Modifier.height(32.dp))

        // Input Fields
        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email Address") },
            leadingIcon = { Icon(Icons.Default.Mail, contentDescription = null, tint = CharcoalMuted) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = CharcoalMuted) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp)
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Submit Button
        Button(
            onClick = {
                if (email.isNotBlank() && password.isNotBlank()) {
                    isLoading = true
                    coroutineScope.launch {
                        try {
                            val res = ApiClient.service.login(LoginRequest(email, password))
                            TokenManager.saveToken(res.accessToken)
                            TokenManager.saveUserData(res.user.role, res.user.fullName, res.user.email)
                            onLoginSuccess(res.user.role)
                        } catch (e: Exception) {
                            Toast.makeText(context, "Login failed: ${e.message}", Toast.LENGTH_SHORT).show()
                        } finally {
                            isLoading = false
                        }
                    }
                } else {
                    Toast.makeText(context, "Please enter your email and password", Toast.LENGTH_SHORT).show()
                }
            },
            colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp),
            enabled = !isLoading
        ) {
            if (isLoading) {
                CircularProgressIndicator(color = Cream, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
            } else {
                Text("Sign In to MenoCare", fontSize = 14.sp)
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        HorizontalDivider(color = BorderWarm)

        Spacer(modifier = Modifier.height(16.dp))

        Text("Quick 1-Click Clinical Demo Logins", style = Typography.labelSmall.copy(fontSize = 11.sp, color = CharcoalMuted))

        Spacer(modifier = Modifier.height(12.dp))

        // 1-Click Patient Demo
        Button(
            onClick = {
                TokenManager.saveToken("mock-patient-jwt-token")
                TokenManager.saveUserData("patient", "Elena Rostova", "elena@menocare.demo")
                Toast.makeText(context, "Logged in as Elena (Patient Demo)", Toast.LENGTH_SHORT).show()
                onLoginSuccess("patient")
            },
            colors = ButtonDefaults.buttonColors(containerColor = SageSoft, contentColor = SageDark),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(44.dp)
        ) {
            Text("1-Click Demo: Elena (Patient)", fontSize = 12.sp, fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold)
        }

        Spacer(modifier = Modifier.height(8.dp))

        // 1-Click Doctor Demo
        Button(
            onClick = {
                TokenManager.saveToken("mock-doctor-jwt-token")
                TokenManager.saveUserData("doctor", "Dr. Elena Vance, MD", "vance@menocare.demo")
                Toast.makeText(context, "Logged in as Dr. Elena Vance, MD (Clinician Demo)", Toast.LENGTH_SHORT).show()
                onLoginSuccess("doctor")
            },
            colors = ButtonDefaults.buttonColors(containerColor = OatLight, contentColor = Charcoal),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(44.dp)
        ) {
            Text("1-Click Demo: Dr. Elena Vance (Clinician)", fontSize = 12.sp, fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold)
        }
    }
}
