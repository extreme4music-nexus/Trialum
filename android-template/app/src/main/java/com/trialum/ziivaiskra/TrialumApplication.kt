package com.trialum.ziivaiskra

import android.app.Application
import com.google.firebase.messaging.FirebaseMessaging

/**
 * Cold-start FCM support for users who explicitly opted in earlier.
 * No Firebase setup or token request for players who have not opted in.
 */
class TrialumApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        if(TrialumPush.opted(this) && TrialumPush.prepareFirebase(this)) {
            try {FirebaseMessaging.getInstance().isAutoInitEnabled=true}
            catch (_: Exception) {}
        }
        TrialumPush.syncRevocation(this)
    }
}
