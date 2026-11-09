package com.trialum.ziivaiskra

import android.Manifest
import android.app.Activity
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.messaging.FirebaseMessaging
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

/**
 * FCM is optional. No registration/network until explicit user action.
 * The FCM token never touches the WebView, local world, JSON backups or logs.
 */
internal class TrialumPush(
    private val activity: Activity,
    private val dispatch: (JSONObject) -> Unit
) {
    private var generation=0
    private fun event(kind: String, message: String) = dispatch(
        JSONObject().put("kind", kind).put("message", message)
    )
    private fun prepare(): Boolean = prepareFirebase(activity)
    fun status(): String = when {
        !configured(activity) -> "unavailable"
        opted(activity) -> "enabled"
        else -> "off"
    }
    fun enable() {
        if (!configured(activity)) { event("unavailable", "FCM не е конфигуриран во ова APK."); return }
        if (SocialCredentialVault.read(activity).isEmpty()) {
            event("error", "Прво создај социјален профил."); return
        }
        if (Build.VERSION.SDK_INT >= 33 && activity.checkSelfPermission(
                Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            activity.requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), REQUEST_CODE)
            return
        }
        begin()
    }
    fun permissionResult(requestCode: Int, grants: IntArray) {
        if (requestCode != REQUEST_CODE) return
        if (grants.isNotEmpty() && grants.all { it == PackageManager.PERMISSION_GRANTED }) begin()
        else event("error", "Известувањата се исклучени. Пораките остануваат во играта.")
    }
    private fun begin() {
        val attempt=++generation
        try {
            if (!prepare()) { event("unavailable", "FCM не е достапен."); return }
            val messaging=FirebaseMessaging.getInstance()
            messaging.isAutoInitEnabled = true
            messaging.token.addOnSuccessListener { token ->
                worker.execute {
                    val ok=registration(activity.applicationContext, "POST", token)
                    activity.runOnUiThread {
                        if(attempt!=generation){
                            syncRevocation(activity.applicationContext)
                            return@runOnUiThread
                        }
                        if (ok) {
                            prefs(activity).edit().putBoolean(ENABLED,true).putBoolean(REVOKE,false).apply()
                            event("enabled","Известувањата се вклучени.")
                        } else {
                            messaging.isAutoInitEnabled = false
                            messaging.deleteToken()
                            event("error","Не успеа регистрацијата. Пробај подоцна.")
                        }
                    }
                }
            }.addOnFailureListener {
                messaging.isAutoInitEnabled = false
                event("error","FCM не успеа да добие токен.")
            }
        } catch (_: Exception) { event("error","FCM не е достапен на уредот.") }
    }
    fun disable() {
        generation++
        val context=activity.applicationContext
        // Stop displaying immediately, even with no network.
        prefs(context).edit().putBoolean(ENABLED,false).putBoolean(REVOKE,true).apply()
        try {
            if(prepare()){
                FirebaseMessaging.getInstance().isAutoInitEnabled=false
                FirebaseMessaging.getInstance().deleteToken()
            }
        } catch (_: Exception) {}
        syncRevocation(context)
        event("disabled","Известувањата се исклучени. Пораките остануваат достапни.")
    }
    companion object {
        const val REQUEST_CODE=1567
        fun prepareFirebase(c: Context): Boolean {
            if(!configured(c))return false
            return try {
                if(FirebaseApp.getApps(c).isEmpty()){
                    val options=FirebaseOptions.Builder()
                        .setApplicationId(c.getString(R.string.trialum_firebase_app_id))
                        .setGcmSenderId(c.getString(R.string.trialum_firebase_sender_id))
                        .setProjectId(c.getString(R.string.trialum_firebase_project_id))
                        .setApiKey(c.getString(R.string.trialum_firebase_api_key))
                        .build()
                    FirebaseApp.initializeApp(c,options)
                }
                FirebaseApp.getApps(c).isNotEmpty()
            }catch (_: Exception){false}
        }

        private const val PREFS="trialum_push_v1"
        private const val ENABLED="explicit_consent"
        private const val REVOKE="revoke_pending"
        private val worker=Executors.newSingleThreadExecutor()
        private fun prefs(c: Context)=c.getSharedPreferences(PREFS,Context.MODE_PRIVATE)
        fun opted(c: Context)=prefs(c).getBoolean(ENABLED,false)
        fun configured(c: Context): Boolean {
            val api=c.getString(R.string.trialum_social_api_url)
            return api.matches(Regex("^https://[A-Za-z0-9.-]+(?::443)?$")) &&
                c.getString(R.string.trialum_firebase_app_id).matches(Regex("^1:[0-9]+:android:[0-9a-fA-F]+$")) &&
                c.getString(R.string.trialum_firebase_sender_id).matches(Regex("^[0-9]+$")) &&
                c.getString(R.string.trialum_firebase_project_id).isNotBlank() &&
                c.getString(R.string.trialum_firebase_api_key).isNotBlank()
        }
        /** Network call happens only after opted-in or pending revocation. */
        private fun registration(c: Context,method: String,token: String=""): Boolean {
            val api=c.getString(R.string.trialum_social_api_url)
            val credential=SocialCredentialVault.read(c)
            if(!configured(c)||credential.isEmpty())return false
            var connection: HttpURLConnection?=null
            return try {
                connection=URL(api+"/v1/messages/push").openConnection() as HttpURLConnection
                connection.connectTimeout=7000;connection.readTimeout=7000
                connection.instanceFollowRedirects=false
                connection.requestMethod=method
                connection.setRequestProperty("Authorization","Bearer "+credential)
                connection.setRequestProperty("Cache-Control","no-store")
                if(method=="POST") {
                    connection.doOutput=true
                    connection.setRequestProperty("Content-Type","application/json")
                    val bytes=JSONObject().put("consent",true).put("token",token)
                        .toString().toByteArray(Charsets.UTF_8)
                    connection.outputStream.use { it.write(bytes) }
                }
                connection.responseCode in 200..299
            }catch (_: Exception) {false}
            finally {connection?.disconnect()}
        }
        fun onNewToken(c: Context,token: String) {
            if(opted(c)&&configured(c)&&token.length in 64..4096)
                worker.execute {registration(c,"POST",token)}
        }
        fun syncRevocation(c: Context) {
            if(!prefs(c).getBoolean(REVOKE,false))return
            // Deleting the social account cascades the push row; no session remains.
            if(SocialCredentialVault.read(c).isEmpty()){
                prefs(c).edit().putBoolean(REVOKE,false).apply()
                return
            }
            worker.execute {
                if(registration(c,"DELETE")){
                    prefs(c).edit().putBoolean(REVOKE,false).apply()
                }
            }
        }
        fun notifyGeneric(c: Context,reference: String) {
            if(!opted(c)||!Regex("^[a-fA-F0-9-]{36}$").matches(reference))return
            if(Build.VERSION.SDK_INT>=33 &&
               c.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)return
            val manager=c.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            val channelId="trialum_friends_optin"
            if(Build.VERSION.SDK_INT>=26)
                manager.createNotificationChannel(NotificationChannel(
                    channelId,"ТРИАЛУМ пријатели",NotificationManager.IMPORTANCE_DEFAULT))
            val intent=Intent(c,MainActivity::class.java).apply {
                flags=Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pending=PendingIntent.getActivity(c,0,intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            val n=NotificationCompat.Builder(c,channelId)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle("ТРИАЛУМ")
                .setContentText("Имаш ново известување во играта.")
                .setContentIntent(pending)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .build()
            manager.notify(reference.hashCode(),n)
        }
    }
}
