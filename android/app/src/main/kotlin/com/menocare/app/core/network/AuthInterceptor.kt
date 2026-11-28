package com.menocare.app.core.network

import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val token = TokenManager.getToken()

        val requestBuilder = original.newBuilder()
            .header("Accept", "application/json")

        if (token != null && !original.headers.names().contains("Authorization")) {
            requestBuilder.header("Authorization", "Bearer $token")
        }

        return chain.proceed(requestBuilder.build())
    }
}
