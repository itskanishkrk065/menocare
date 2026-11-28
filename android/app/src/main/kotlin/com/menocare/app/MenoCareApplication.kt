package com.menocare.app

import android.app.Application

class MenoCareApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        instance = this
    }

    companion object {
        lateinit var instance: MenoCareApplication
            private set
    }
}
