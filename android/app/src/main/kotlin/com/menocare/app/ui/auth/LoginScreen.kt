package com.menocare.app.ui.auth

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
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

    var selectedRole by remember { mutableStateOf("patient") } // "patient" or "doctor"
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }

    var showForgotDialog by remember { mutableStateOf(false) }
    var showRegisterDialog by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Ivory)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 22.dp, vertical = 24.dp)
            .navigationBarsPadding(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        // --- 1. BRAND BADGE & HL7 FHIR STATUS (STITCH SPEC) ---
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .background(SageSoft, RoundedCornerShape(10.dp))
                        .border(1.dp, SageAccent, RoundedCornerShape(10.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("🌸", fontSize = 18.sp)
                }
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text("MenoCare", style = Typography.headlineMedium.copy(fontSize = 18.sp, fontWeight = FontWeight.Bold), color = Charcoal)
                    Text("CLINICAL", style = Typography.labelSmall.copy(fontSize = 9.sp, letterSpacing = 1.sp, color = SageDark))
                }
            }

            Box(
                modifier = Modifier
                    .background(SurfaceCard, RoundedCornerShape(8.dp))
                    .border(1.dp, BorderWarm, RoundedCornerShape(8.dp))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text("HIPAA / HL7 FHIR v4.0.1", fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = CharcoalMuted)
            }
        }

        Spacer(modifier = Modifier.height(28.dp))

        // --- 2. EDITORIAL HERO HEADLINE (STITCH SPEC) ---
        Text(
            text = "A gentler, scientifically grounded pathway through perimenopause.",
            style = Typography.headlineLarge.copy(fontSize = 24.sp, lineHeight = 30.sp),
            color = Charcoal,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = "Precision endocrine telemetry, continuous clinician pairing, and compassionate, evidence-based guidance.",
            style = Typography.bodyMedium.copy(fontSize = 12.sp, lineHeight = 18.sp, color = CharcoalMuted),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(20.dp))

        // --- 3. ROLE SELECTOR TABS (PATIENT PORTAL vs ATTENDING CLINICIAN) ---
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Cream, RoundedCornerShape(14.dp))
                .border(1.dp, BorderWarm, RoundedCornerShape(14.dp))
                .padding(4.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(10.dp))
                    .background(if (selectedRole == "patient") SageDark else Color.Transparent)
                    .clickable { selectedRole = "patient" }
                    .padding(vertical = 10.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Favorite,
                        contentDescription = "Patient",
                        tint = if (selectedRole == "patient") Cream else CharcoalMuted,
                        modifier = Modifier.size(15.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        "Patient Portal",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = if (selectedRole == "patient") Cream else Charcoal
                    )
                }
            }

            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(10.dp))
                    .background(if (selectedRole == "doctor") SageDark else Color.Transparent)
                    .clickable { selectedRole = "doctor" }
                    .padding(vertical = 10.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.MedicalServices,
                        contentDescription = "Doctor",
                        tint = if (selectedRole == "doctor") Cream else CharcoalMuted,
                        modifier = Modifier.size(15.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        "Attending Clinician",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = if (selectedRole == "doctor") Cream else Charcoal
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // --- 4. AUTHENTICATION FORM CARD ---
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Cream, RoundedCornerShape(18.dp))
                .border(1.dp, BorderWarm, RoundedCornerShape(18.dp))
                .padding(18.dp)
        ) {
            Text(
                text = if (selectedRole == "patient") "Welcome Back" else "Clinical Authentication",
                style = Typography.titleMedium.copy(fontSize = 16.sp, fontWeight = FontWeight.Bold),
                color = Charcoal
            )
            Text(
                text = if (selectedRole == "patient") "Sign in to sync your biometrics & symptom journal" else "Access clinical command suite & patient cohort",
                style = Typography.bodyMedium.copy(fontSize = 11.sp, color = CharcoalMuted),
                modifier = Modifier.padding(top = 2.dp, bottom = 14.dp)
            )

            // Email / MRN
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text(if (selectedRole == "patient") "Patient Email or MRN" else "Clinician NPI or Email") },
                leadingIcon = { Icon(Icons.Default.Mail, contentDescription = null, tint = CharcoalMuted, modifier = Modifier.size(18.dp)) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = SageDark,
                    unfocusedBorderColor = BorderWarm,
                    focusedContainerColor = SurfaceCard,
                    unfocusedContainerColor = SurfaceCard
                )
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Password with visibility toggle
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Encrypted Passkey / Password") },
                leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = CharcoalMuted, modifier = Modifier.size(18.dp)) },
                trailingIcon = {
                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Icon(
                            if (passwordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            contentDescription = "Toggle Password",
                            tint = CharcoalMuted,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                },
                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = SageDark,
                    unfocusedBorderColor = BorderWarm,
                    focusedContainerColor = SurfaceCard,
                    unfocusedContainerColor = SurfaceCard
                )
            )

            // Forgot passkey link
            Row(
                modifier = Modifier.fillMaxWidth().padding(top = 6.dp),
                horizontalArrangement = Arrangement.End
            ) {
                Text(
                    "Forgot passkey?",
                    fontSize = 11.sp,
                    color = SageDark,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.clickable { showForgotDialog = true }
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Biometrics sync capability badge
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(SurfaceCard, RoundedCornerShape(10.dp))
                    .border(1.dp, BorderWarm, RoundedCornerShape(10.dp))
                    .padding(10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.Sync, contentDescription = "Sync", tint = SageDark, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text("Wearable & Sensor Integration", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Charcoal)
                    Text("Continuous biometrics from Oura Ring, Whoop, Apple Health", fontSize = 9.sp, color = CharcoalMuted)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Primary Submit Button
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
                        Toast.makeText(context, "Please enter your email and passkey", Toast.LENGTH_SHORT).show()
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().height(48.dp),
                enabled = !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(color = Cream, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                } else {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            if (selectedRole == "patient") "Enter MenoCare Patient Vault" else "Enter Clinical Command Suite",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = "Enter", modifier = Modifier.size(16.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // New Patient Registration Link
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center
            ) {
                Text("New to MenoCare? ", fontSize = 11.sp, color = CharcoalMuted)
                Text(
                    "Create Patient Account",
                    fontSize = 11.sp,
                    color = SageDark,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.clickable { showRegisterDialog = true }
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // --- 5. 1-CLICK INSTANT SANDBOX PROFILES (FOR DEMO & TESTING) ---
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Cream, RoundedCornerShape(18.dp))
                .border(1.dp, BorderWarm, RoundedCornerShape(18.dp))
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("1-Click Clinical Sandbox Profiles", style = Typography.labelSmall.copy(fontSize = 11.sp, fontWeight = FontWeight.Bold), color = Charcoal)
                Box(
                    modifier = Modifier
                        .background(SageSoft, RoundedCornerShape(6.dp))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text("AUDITED v4.2", fontSize = 8.sp, fontWeight = FontWeight.Bold, color = SageDark)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Profile 1: Elena (Patient Demo)
            Button(
                onClick = {
                    TokenManager.saveToken("mock-patient-jwt-token")
                    TokenManager.saveUserData("patient", "Elena Rostova", "elena@menocare.demo")
                    Toast.makeText(context, "Logged in as Elena Rostova (Patient Portal)", Toast.LENGTH_SHORT).show()
                    onLoginSuccess("patient")
                },
                colors = ButtonDefaults.buttonColors(containerColor = SageSoft, contentColor = SageDark),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().height(44.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Elena Rostova (Patient)", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text("Typical Peri · STRAW -1", fontSize = 10.sp, color = CharcoalMuted)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Profile 2: Dr. Elena Vance (Clinician Demo)
            Button(
                onClick = {
                    TokenManager.saveToken("mock-doctor-jwt-token")
                    TokenManager.saveUserData("doctor", "Dr. Elena Vance, MD", "vance@menocare.demo")
                    Toast.makeText(context, "Logged in as Dr. Elena Vance, MD (Clinician Suite)", Toast.LENGTH_SHORT).show()
                    onLoginSuccess("doctor")
                },
                colors = ButtonDefaults.buttonColors(containerColor = SurfaceCard, contentColor = Charcoal),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().height(44.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Dr. Elena Vance, MD (Clinician)", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text("Lead Endocrinologist", fontSize = 10.sp, color = SageDark)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
    }

    // --- DIALOG: FORGOT PASSKEY ---
    if (showForgotDialog) {
        var resetEmail by remember { mutableStateOf(email) }
        AlertDialog(
            onDismissRequest = { showForgotDialog = false },
            title = { Text("Recover Account Passkey", style = Typography.headlineMedium.copy(fontSize = 18.sp), color = Charcoal) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        "Enter your registered patient email or MRN. We will send an encrypted recovery link and temporary OTP.",
                        fontSize = 12.sp,
                        color = CharcoalMuted
                    )
                    OutlinedTextField(
                        value = resetEmail,
                        onValueChange = { resetEmail = it },
                        label = { Text("Email / MRN") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (resetEmail.isNotBlank()) {
                            Toast.makeText(context, "Encrypted recovery email sent to $resetEmail", Toast.LENGTH_LONG).show()
                            showForgotDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream)
                ) {
                    Text("Send Recovery Link")
                }
            },
            dismissButton = {
                TextButton(onClick = { showForgotDialog = false }) {
                    Text("Cancel", color = CharcoalMuted)
                }
            },
            containerColor = Cream
        )
    }

    // --- DIALOG: REGISTER NEW PATIENT ---
    if (showRegisterDialog) {
        var regName by remember { mutableStateOf("") }
        var regEmail by remember { mutableStateOf("") }
        var regPass by remember { mutableStateOf("") }
        var regStage by remember { mutableStateOf("Early Perimenopause") }

        AlertDialog(
            onDismissRequest = { showRegisterDialog = false },
            title = { Text("New Patient Registration", style = Typography.headlineMedium.copy(fontSize = 18.sp), color = Charcoal) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Create your encrypted longitudinal health journal account.", fontSize = 11.sp, color = CharcoalMuted)
                    OutlinedTextField(
                        value = regName,
                        onValueChange = { regName = it },
                        label = { Text("Full Name") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )
                    OutlinedTextField(
                        value = regEmail,
                        onValueChange = { regEmail = it },
                        label = { Text("Email Address") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )
                    OutlinedTextField(
                        value = regPass,
                        onValueChange = { regPass = it },
                        label = { Text("Create Passkey") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (regName.isNotBlank() && regEmail.isNotBlank()) {
                            TokenManager.saveToken("registered-patient-jwt-token")
                            TokenManager.saveUserData("patient", regName, regEmail)
                            Toast.makeText(context, "Account created! Welcome to MenoCare, $regName", Toast.LENGTH_LONG).show()
                            showRegisterDialog = false
                            onLoginSuccess("patient")
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = SageDark, contentColor = Cream)
                ) {
                    Text("Register & Enter")
                }
            },
            dismissButton = {
                TextButton(onClick = { showRegisterDialog = false }) {
                    Text("Cancel", color = CharcoalMuted)
                }
            },
            containerColor = Cream
        )
    }
}
