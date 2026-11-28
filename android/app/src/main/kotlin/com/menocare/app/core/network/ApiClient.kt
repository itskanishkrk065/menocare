package com.menocare.app.core.network

import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import com.menocare.app.data.api.MenoCareApiService
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import java.util.concurrent.TimeUnit

object ApiClient {
    // 10.0.2.2 maps directly to the host machine's localhost from Android Emulator
    private const val DEFAULT_BASE_URL = "http://10.0.2.2:8000/api/v1/"
    private var customBaseUrl: String = DEFAULT_BASE_URL

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        encodeDefaults = true
        coerceInputValues = true
    }

    private val okHttpClient: OkHttpClient by lazy {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor())
            .addInterceptor(logging)
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .writeTimeout(15, TimeUnit.SECONDS)
            .build()
    }

    val service: MenoCareApiService by lazy {
        Retrofit.Builder()
            .baseUrl(customBaseUrl)
            .client(okHttpClient)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()
            .create(MenoCareApiService::class.java)
    }

    fun setBaseUrl(url: String) {
        customBaseUrl = if (url.endsWith("/")) url else "$url/"
    }
}
