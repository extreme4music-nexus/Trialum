package com.trialum.ziivaiskra

import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

/**
 * Only private, explicitly opted-in transactional push. Message/pet content is
 * never included in FCM payloads. The app fetches events securely on opening.
 */
class TrialumFirebaseService : FirebaseMessagingService() {
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        TrialumPush.onNewToken(applicationContext,token)
    }
    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)
        if(message.data["kind"]!="trialum_event")return
        val reference=message.data["reference"]?:return
        TrialumPush.notifyGeneric(applicationContext,reference)
    }
}
