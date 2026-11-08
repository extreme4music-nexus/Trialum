package com.trialum.ziivaiskra

import android.app.Activity
import android.util.Log
import android.webkit.JavascriptInterface
import com.google.android.gms.games.PlayGames
import com.google.android.gms.common.GoogleApiAvailability
import com.google.android.gms.common.ConnectionResult
import org.json.JSONObject

/**
 * Play Games platform authentication bridge. This class never reads or writes
 * the world, never sends XP, and never performs silent Cloud Save restoration.
 * The source of truth remains the existing local IndexedDB/JSON format.
 */
class PlayGamesBridge(
    private val activity: Activity,
    private val send: (JSONObject) -> Unit
) {
    private val enabled get() = BuildConfig.PLAY_GAMES_CONFIGURED
    private var authenticated = false

    private fun report(kind: String, configured: Boolean = enabled,
                       ok: Boolean = false, code: String = "", message: String = "",
                       name: String = "", playerId: String = "") {
        val event = JSONObject()
            .put("kind", kind)
            .put("configured", configured)
            .put("authenticated", ok)
            .put("code", code)
            .put("message", message)
            .put("playerName", name)
            .put("playerId", playerId)
        send(event)
    }

    private fun available(): Boolean {
        if (!enabled) {
            report("status", configured = false, code = "not_configured")
            return false
        }
        val services = GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(activity)
        if (services != ConnectionResult.SUCCESS) {
            authenticated = false
            report("status", code = "no_play_services")
            return false
        }
        return true
    }

    @JavascriptInterface
    fun refresh() {
        activity.runOnUiThread { refreshOnUi() }
    }

    private fun refreshOnUi() {
        if (!available()) return
        try {
            PlayGames.getGamesSignInClient(activity).isAuthenticated()
                .addOnCompleteListener(activity) { task ->
                    authenticated = task.isSuccessful && task.result.isAuthenticated
                    if (!authenticated) {
                        report("status", code = if (task.isSuccessful) "not_signed_in" else "auth_error")
                        return@addOnCompleteListener
                    }
                    PlayGames.getPlayersClient(activity).currentPlayer
                        .addOnCompleteListener(activity) { playerTask ->
                            if (playerTask.isSuccessful) {
                                val p = playerTask.result
                                report("status", ok = true, code = "signed_in",
                                    name = p.displayName ?: "", playerId = p.playerId ?: "")
                            } else {
                                // Authentication can be valid even if profile metadata fails.
                                report("status", ok = true, code = "signed_in")
                            }
                        }
                }
        } catch (error: Exception) {
            authenticated = false
            Log.w("TrialumPGS", "Cannot check Google Play Games sign-in", error)
            report("status", code = "auth_error")
        }
    }

    @JavascriptInterface
    fun signIn() {
        activity.runOnUiThread {
            if (!available()) return@runOnUiThread
            try {
                PlayGames.getGamesSignInClient(activity).signIn()
                    .addOnCompleteListener(activity) { task ->
                        if (!task.isSuccessful || !task.result.isAuthenticated) {
                            authenticated = false
                            report("status", code = "not_signed_in")
                        } else refreshOnUi()
                    }
            } catch (error: Exception) {
                Log.w("TrialumPGS", "Manual sign-in unavailable", error)
                report("status", code = "auth_error")
            }
        }
    }

    @JavascriptInterface
    fun achievements() {
        activity.runOnUiThread {
            if (!available() || !authenticated) {
                report("error", code = "not_signed_in")
                return@runOnUiThread
            }
            try {
                PlayGames.getAchievementsClient(activity).achievementsIntent
                    .addOnSuccessListener(activity) { activity.startActivity(it) }
                    .addOnFailureListener(activity) { report("error", code = "feature_unavailable") }
            } catch (error: Exception) {
                Log.w("TrialumPGS", "Achievements UI not available", error)
                report("error", code = "feature_unavailable")
            }
        }
    }

    @JavascriptInterface
    fun leaderboards() {
        activity.runOnUiThread {
            if (!available() || !authenticated) {
                report("error", code = "not_signed_in")
                return@runOnUiThread
            }
            try {
                PlayGames.getLeaderboardsClient(activity).allLeaderboardsIntent
                    .addOnSuccessListener(activity) { activity.startActivity(it) }
                    .addOnFailureListener(activity) { report("error", code = "feature_unavailable") }
            } catch (error: Exception) {
                Log.w("TrialumPGS", "Leaderboards UI not available", error)
                report("error", code = "feature_unavailable")
            }
        }
    }
}
