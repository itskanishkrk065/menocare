package com.menocare.app.core.network

import android.content.Context
import android.content.SharedPreferences
import com.menocare.app.MenoCareApplication

object TokenManager {
    private const val PREFS_NAME = "menocare_auth_prefs"
    private const val KEY_TOKEN = "jwt_token"
    private const val KEY_USER_ROLE = "user_role"
    private const val KEY_USER_NAME = "user_name"
    private const val KEY_USER_EMAIL = "user_email"

    private val prefs: SharedPreferences by lazy {
        MenoCareApplication.instance.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    fun saveToken(token: String) {
        prefs.edit().putString(KEY_TOKEN, token).apply()
    }

    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    fun saveUserData(role: String, name: String, email: String) {
        prefs.edit()
            .putString(KEY_USER_ROLE, role)
            .putString(KEY_USER_NAME, name)
            .putString(KEY_USER_EMAIL, email)
            .apply()
    }

    fun getUserRole(): String? = prefs.getString(KEY_USER_ROLE, null)
    fun getUserName(): String? = prefs.getString(KEY_USER_NAME, null)
    fun getUserEmail(): String? = prefs.getString(KEY_USER_EMAIL, null)

    fun clear() {
        prefs.edit().clear().apply()
    }
}
