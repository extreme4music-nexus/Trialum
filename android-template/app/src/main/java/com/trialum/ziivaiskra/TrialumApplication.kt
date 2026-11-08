package com.trialum.ziivaiskra

import android.app.Application
import android.util.Log
import com.google.android.gms.games.PlayGamesSdk

/**
 * Play Games v2 is an *optional* platform service, never the primary identity
 * or persistence layer. In unconfigured CI/debug builds it is NOT initialized
 * and cannot prompt for a Games profile or alter the offline game.
 */
class TrialumApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        if (!BuildConfig.PLAY_GAMES_CONFIGURED) return
        try {
            PlayGamesSdk.initialize(this)
        } catch (error: Exception) {
            Log.w("TrialumPGS", "Play Games initialization unavailable; continue offline", error)
        }
    }
}
