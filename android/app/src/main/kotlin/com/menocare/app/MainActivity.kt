package com.menocare.app

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.*
import com.menocare.app.core.network.TokenManager
import com.menocare.app.core.theme.MenoCareTheme
import com.menocare.app.ui.auth.LoginScreen
import com.menocare.app.ui.components.*
import com.menocare.app.ui.doctor.*
import com.menocare.app.ui.navigation.Screen
import com.menocare.app.ui.patient.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            MenoCareTheme {
                val navController = rememberNavController()
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route ?: Screen.Login.route

                var userRole by remember { mutableStateOf(TokenManager.getUserRole() ?: "patient") }

                // Dialog and BottomSheet States
                var isCheckInOpen by remember { mutableStateOf(false) }
                var isMoreDrawerOpen by remember { mutableStateOf(false) }
                var isMrsOpen by remember { mutableStateOf(false) }
                var isBreathingOpen by remember { mutableStateOf(false) }

                val isAuthRoute = currentRoute == Screen.Login.route

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    topBar = {
                        if (!isAuthRoute) {
                            val title = if (userRole == "doctor") "MenoCare Clinical Suite" else "MenoCare Patient Portal"
                            val subtitle = if (userRole == "doctor") "Dr. Elena Vance, MD" else "Elena Rostova"
                            val strawStage = if (userRole == "patient") "Typical Perimenopause" else null

                            MenoCareTopBar(
                                title = title,
                                subtitle = subtitle,
                                strawStage = strawStage,
                                onSignOutClick = {
                                    TokenManager.clear()
                                    userRole = "patient"
                                    navController.navigate(Screen.Login.route) {
                                        popUpTo(0) { inclusive = true }
                                    }
                                }
                            )
                        }
                    },
                    bottomBar = {
                        if (!isAuthRoute) {
                            if (userRole == "doctor") {
                                DoctorBottomNavBar(
                                    currentRoute = currentRoute,
                                    onNavigate = { route -> navController.navigate(route) }
                                )
                            } else {
                                PatientBottomNavBar(
                                    currentRoute = currentRoute,
                                    onNavigate = { route -> navController.navigate(route) },
                                    onOpenCheckIn = { isCheckInOpen = true },
                                    onOpenMore = { isMoreDrawerOpen = true }
                                )
                            }
                        }
                    }
                ) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = if (TokenManager.getToken() != null) {
                            if (userRole == "doctor") Screen.DoctorCommand.route else Screen.PatientOverview.route
                        } else {
                            Screen.Login.route
                        },
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                    ) {
                        // --- AUTH ---
                        composable(Screen.Login.route) {
                            LoginScreen(
                                onLoginSuccess = { role ->
                                    userRole = role
                                    val target = if (role == "doctor") Screen.DoctorCommand.route else Screen.PatientOverview.route
                                    navController.navigate(target) {
                                        popUpTo(Screen.Login.route) { inclusive = true }
                                    }
                                }
                            )
                        }

                        // --- PATIENT ROUTES ---
                        composable(Screen.PatientOverview.route) {
                            PatientDashboardScreen(
                                onNavigate = { route -> navController.navigate(route) },
                                onOpenCheckIn = { isCheckInOpen = true },
                                onOpenMrs = { isMrsOpen = true },
                                onOpenBreathing = { isBreathingOpen = true }
                            )
                        }

                        composable(Screen.PatientTrends.route) {
                            PatientTrendsScreen(
                                onNavigateBack = { navController.navigate(Screen.PatientOverview.route) }
                            )
                        }

                        composable(Screen.PatientCare.route) {
                            PatientCareScreen(
                                onNavigateBack = { navController.navigate(Screen.PatientOverview.route) }
                            )
                        }

                        composable(Screen.PatientCalendar.route) {
                            PatientCalendarScreen(
                                onNavigateBack = { navController.navigate(Screen.PatientOverview.route) }
                            )
                        }

                        composable(Screen.PatientLabs.route) {
                            PatientLabsScreen(
                                onNavigateBack = { navController.navigate(Screen.PatientOverview.route) }
                            )
                        }

                        composable(Screen.PatientTelehealth.route) {
                            PatientTelehealthScreen(
                                onNavigateBack = { navController.navigate(Screen.PatientOverview.route) }
                            )
                        }

                        composable(Screen.PatientChat.route) {
                            PatientChatScreen(
                                onNavigateBack = { navController.navigate(Screen.PatientOverview.route) }
                            )
                        }

                        // --- DOCTOR ROUTES ---
                        composable(Screen.DoctorCommand.route) {
                            DoctorDashboardScreen(
                                onNavigate = { route -> navController.navigate(route) }
                            )
                        }

                        composable(Screen.DoctorCohort.route) {
                            CohortDirectoryScreen(
                                onSelectPatient = { patientId ->
                                    navController.navigate(Screen.DoctorDossier.createRoute(patientId))
                                }
                            )
                        }

                        composable(Screen.DoctorDossier.route) { backStackEntry ->
                            val patientId = backStackEntry.arguments?.getString("patientId") ?: "118D96BF"
                            PatientDossierScreen(
                                patientId = patientId,
                                onNavigateBack = { navController.navigate(Screen.DoctorCohort.route) }
                            )
                        }

                        composable(Screen.DoctorVisits.route) {
                            ConsultationsScreen()
                        }

                        composable(Screen.DoctorDiagnostics.route) {
                            DiagnosticsScreen()
                        }

                        composable(Screen.DoctorChat.route) {
                            DoctorChatScreen()
                        }
                    }

                    // --- MODAL SHEETS & DIALOGS ---
                    if (isCheckInOpen) {
                        DailyCheckInBottomSheet(
                            onDismiss = { isCheckInOpen = false },
                            onSubmitSuccess = {
                                isCheckInOpen = false
                                Toast.makeText(this@MainActivity, "Daily check-in saved successfully!", Toast.LENGTH_SHORT).show()
                            }
                        )
                    }

                    if (isMoreDrawerOpen) {
                        MoreDrawerSheet(
                            onDismiss = { isMoreDrawerOpen = false },
                            onNavigate = { route -> navController.navigate(route) },
                            onOpenMrs = { isMrsOpen = true },
                            onOpenBreathing = { isBreathingOpen = true },
                            onSignOut = {
                                TokenManager.clear()
                                navController.navigate(Screen.Login.route) {
                                    popUpTo(0) { inclusive = true }
                                }
                            }
                        )
                    }

                    if (isBreathingOpen) {
                        BreathingReliefDialog(onDismiss = { isBreathingOpen = false })
                    }

                    if (isMrsOpen) {
                        MrsAssessmentDialog(
                            onDismiss = { isMrsOpen = false },
                            onCompleted = { score ->
                                Toast.makeText(this@MainActivity, "MRS Score recorded: $score / 44", Toast.LENGTH_SHORT).show()
                            }
                        )
                    }
                }
            }
        }
    }
}
