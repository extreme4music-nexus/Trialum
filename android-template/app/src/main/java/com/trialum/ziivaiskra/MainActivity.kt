package com.trialum.ziivaiskra

import android.Manifest
import android.content.Intent
import android.util.Base64
import org.json.JSONObject
import androidx.core.content.FileProvider
import java.io.File
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.ContentValues
import android.os.Environment
import android.provider.MediaStore
import android.media.MediaScannerConnection
import android.widget.Toast
import android.app.Activity
import android.app.AlertDialog
import android.widget.EditText
import android.webkit.WebChromeClient
import android.webkit.JsResult
import android.webkit.JsPromptResult
import android.view.WindowInsets
import java.io.ByteArrayOutputStream
import android.os.Build
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebViewAssetLoader
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

/** Android WebView wrapper for compiled Trialum 1.5.5 APK. */
class MainActivity : Activity() {
    private lateinit var web: WebView
    private lateinit var modelRuntime: ModelRuntime
    private lateinit var playGames: TrialumPlayGames
    private lateinit var nearby: TrialumNearby
    private lateinit var push: TrialumPush
    private val host = "appassets.androidplatform.net"
    private var pendingSocialInvite: String? = null

    private fun captureSocialInvite(intent: Intent?) {
        if (intent?.action != Intent.ACTION_VIEW) return
        val uri = intent.data ?: return
        if (uri.scheme != getString(R.string.trialum_invite_scheme) || uri.host != "invite") return
        val parts = uri.pathSegments
        if (parts.size != 1 || !parts[0].matches(Regex("[A-Za-z0-9_-]{43}"))) return
        pendingSocialInvite = parts[0]
        if (::web.isInitialized) {
            val literal = JSONObject.quote(parts[0])
            web.post {
                if (!isFinishing && !isDestroyed) {
                    web.evaluateJavascript(
                        "window.TrialumSocialInvite && window.TrialumSocialInvite(" + literal + ");",
                        null
                    )
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        captureSocialInvite(intent)
    }
    private var pendingImage: ByteArray? = null
    private val imageRequestCode = 1303
    private val backupSaveRequest = 1304
    private val backupOpenRequest = 1305
    private var pendingBackup: ByteArray? = null
    private val maxBackupBytes = 20 * 1024 * 1024

    private fun backupNotice(ok: Boolean, message: String, code: String = if (ok) "saved" else "error") {
        if (isFinishing || isDestroyed) return
        val payload = JSONObject().put("ok", ok).put("message", message).put("code", code)
        web.evaluateJavascript(
            "window.TrialumNativeBackupEvent && window.TrialumNativeBackupEvent(" + payload.toString() + ");",
            null
        )
    }

    private fun readBackupBounded(uri: android.net.Uri): String {
        val input = contentResolver.openInputStream(uri) ?: error("Не можам да ја отворам датотеката.")
        input.use { source ->
            val output = ByteArrayOutputStream()
            val buffer = ByteArray(32 * 1024)
            var length = 0
            while (true) {
                val count = source.read(buffer)
                if (count < 0) break
                length += count
                if (length > maxBackupBytes) error("Бекапот е поголем од 20 MB.")
                output.write(buffer, 0, count)
            }
            return String(output.toByteArray(), Charsets.UTF_8).removePrefix("\uFEFF")
        }
    }

    private fun readPng(dataUrl: String): ByteArray? {
        if (!dataUrl.startsWith("data:image/png;base64,") || dataUrl.length > 12_000_000) return null
        return try {
            val data = Base64.decode(dataUrl.substringAfter(","), Base64.DEFAULT)
            val sig = byteArrayOf(0x89.toByte(), 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)
            if (data.size < 100 || data.size > 8_000_000 || !data.take(8).toByteArray().contentEquals(sig)) null else data
        } catch (_: Exception) { null }
    }
    @Deprecated("Storage Access Framework result")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (resultCode != RESULT_OK) {
            if(requestCode == imageRequestCode) pendingImage=null
            if(requestCode == backupSaveRequest) pendingBackup=null
            return
        }
        val uri = data?.data ?: return
        when (requestCode) {
            imageRequestCode -> {
                val bytes = pendingImage;pendingImage=null
                if (bytes != null) try { contentResolver.openOutputStream(uri)?.use { it.write(bytes) } }
                    catch (_: Exception) { }
            }
            backupSaveRequest -> {
                val bytes = pendingBackup;pendingBackup=null
                try {
                    if (bytes == null) error("Нема подготвена резервна копија.")
                    contentResolver.openOutputStream(uri)?.use { it.write(bytes) }
                        ?: error("Не можам да ја запишам датотеката.")
                    backupNotice(true,"Бекапот е успешно зачуван.","saved")
                } catch (e: Exception) {
                    backupNotice(false,"Бекапот не се зачува: " + (e.message ?: "непозната грешка"),"write")
                }
            }
            backupOpenRequest -> {
                try {
                    val json = readBackupBounded(uri)
                    JSONObject(json)
                    web.evaluateJavascript(
                        "window.TrialumNativeBackupReceived && window.TrialumNativeBackupReceived(" +
                            JSONObject.quote(json) + ");",
                        null
                    )
                } catch (e: Exception) {
                    backupNotice(false,"Неуспешно читање на бекапот: " + (e.message ?: "непозната грешка"),"read")
                }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        captureSocialInvite(intent)
        web = WebView(this)
        push = TrialumPush(this) { event ->
            runOnUiThread {
                if (!isFinishing && !isDestroyed)
                    web.evaluateJavascript(
                        "window.TrialumPushEvent && window.TrialumPushEvent(" + event.toString() + ");", null
                    )
            }
        }
        nearby = TrialumNearby(this) { event ->
            runOnUiThread {
                if (!isFinishing && !isDestroyed) {
                    web.evaluateJavascript(
                        "window.TrialumNearbyEvent && window.TrialumNearbyEvent(" + event.toString() + ");",
                        null
                    )
                }
            }
        }
        playGames = TrialumPlayGames(this) { event ->
            runOnUiThread {
                if (!isFinishing && !isDestroyed) {
                    web.evaluateJavascript(
                        "window.TrialumPlayGamesEvent && window.TrialumPlayGamesEvent(" +
                            event.toString() + ");",
                        null
                    )
                }
            }
        }
        modelRuntime = ModelRuntime(this) { kind, petId, text ->
            val event = JSONObject().put("kind", kind).put("petId", petId).put("text", text)
            runOnUiThread {
                if (!isFinishing && !isDestroyed) {
                    web.evaluateJavascript(
                        "window.TrialumLLMEvent && window.TrialumLLMEvent(" + event.toString() + ");",
                        null
                    )
                }
            }
        }
        setContentView(web)
        // Target 35+ draws into the status-bar region on some Android builds.
        // Respect the actual system-bar inset so the TRIALUM title and HUD
        // never sit under the clock, camera cutout or screen-recorder indicator.
        web.setOnApplyWindowInsetsListener { view, insets ->
            val statusTop = if (Build.VERSION.SDK_INT >= 30) {
                insets.getInsets(WindowInsets.Type.statusBars()).top
            } else {
                @Suppress("DEPRECATION")
                insets.systemWindowInsetTop
            }
            if (view.paddingTop != statusTop) {
                view.setPadding(view.paddingLeft, statusTop, view.paddingRight, view.paddingBottom)
            }
            insets
        }
        val loader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this)).build()
        web.settings.javaScriptEnabled = true // only trusted packaged HTML
        web.settings.domStorageEnabled = true
        web.settings.allowFileAccess = false
        web.settings.allowContentAccess = false
        web.settings.mediaPlaybackRequiresUserGesture = true
        // A WebView without WebChromeClient cancels JavaScript confirm() dialogs;
        // restore can be validated without ever being applied.
        web.webChromeClient = object : WebChromeClient() {
            override fun onJsConfirm(view: WebView?, url: String?, message: String?, result: JsResult?): Boolean {
                if (result == null) return false
                AlertDialog.Builder(this@MainActivity)
                    .setTitle("ТРИАЛУМ")
                    .setMessage(message ?: "")
                    .setPositiveButton(android.R.string.ok) { _, _ -> result.confirm() }
                    .setNegativeButton(android.R.string.cancel) { _, _ -> result.cancel() }
                    .setOnCancelListener { result.cancel() }
                    .show()
                return true
            }
            override fun onJsPrompt(
                view: WebView?, url: String?, message: String?,
                defaultValue: String?, result: JsPromptResult?
            ): Boolean {
                if (result == null) return false
                val input = EditText(this@MainActivity).apply {
                    setSingleLine()
                    setText(defaultValue.orEmpty())
                    setSelection(text.length)
                }
                AlertDialog.Builder(this@MainActivity)
                    .setTitle("ТРИАЛУМ")
                    .setMessage(message ?: "")
                    .setView(input)
                    .setPositiveButton(android.R.string.ok) { _, _ -> result.confirm(input.text.toString()) }
                    .setNegativeButton(android.R.string.cancel) { _, _ -> result.cancel() }
                    .setOnCancelListener { result.cancel() }
                    .show()
                return true
            }
        }
        web.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest?): WebResourceResponse? =
                request?.url?.let { loader.shouldInterceptRequest(it) }
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean =
                request?.url?.host != host  // don't navigate to remote/untrusted scripts
        }
        web.addJavascriptInterface(Bridge(), "TrialumAndroid")
        playGames.initialize()
        web.loadUrl("https://$host/assets/web/index.html")
        val job = PeriodicWorkRequestBuilder<CareWorker>(6, TimeUnit.HOURS).build()
        WorkManager.getInstance(this).enqueueUniquePeriodicWork("trialum-care", ExistingPeriodicWorkPolicy.KEEP, job)
    }
    @Deprecated("Android permissions callback")
    override fun onRequestPermissionsResult(
        requestCode: Int, permissions: Array<out String>, grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (::nearby.isInitialized) nearby.onPermissionsResult(requestCode, grantResults)
        if (::push.isInitialized) push.permissionResult(requestCode, grantResults)
    }
    inner class Bridge {
        @JavascriptInterface fun pushStatus(): String = push.status()
        @JavascriptInterface fun pushEnable() { runOnUiThread { push.enable() } }
        @JavascriptInterface fun pushDisable() { runOnUiThread { push.disable() } }
        @JavascriptInterface fun nearbyHost(invite: String) {
            if (invite.matches(Regex("[A-Za-z0-9_-]{43}")))
                runOnUiThread { nearby.startHosting(invite) }
        }
        @JavascriptInterface fun nearbyScan() { runOnUiThread { nearby.startScanning() } }
        @JavascriptInterface fun nearbyStop() { runOnUiThread { nearby.stop() } }
        @JavascriptInterface fun socialApiUrl(): String = getString(R.string.trialum_social_api_url)
        @JavascriptInterface fun socialCredential(): String = SocialCredentialVault.read(this@MainActivity)
        @JavascriptInterface fun socialStoreCredential(credential: String): Boolean =
            SocialCredentialVault.save(this@MainActivity, credential)
        @JavascriptInterface fun socialClearCredential() =
            SocialCredentialVault.clear(this@MainActivity)
        @JavascriptInterface fun socialPendingInvite(): String {
            val value = pendingSocialInvite.orEmpty()
            pendingSocialInvite = null
            return value
        }
        // Play Games bridge methods only dispatch on Android's main thread.
        // Google authentication, cloud storage and ranking remain optional.
        @JavascriptInterface fun pgsStatus(): String = playGames.status()
        @JavascriptInterface fun pgsRefresh() { runOnUiThread { playGames.refresh() } }
        @JavascriptInterface fun pgsSignIn() { runOnUiThread { playGames.signIn() } }
        @JavascriptInterface fun pgsSetCloudConsent(enabled: Boolean) {
            runOnUiThread { playGames.cloudConsent(enabled) }
        }
        @JavascriptInterface fun pgsCloudCheck() { runOnUiThread { playGames.cloudCheck() } }
        @JavascriptInterface fun pgsCloudSave(json: String, overwrite: Boolean) {
            if (json.length > 12_000_000) return
            runOnUiThread { playGames.cloudSave(json, overwrite) }
        }
        @JavascriptInterface fun pgsCloudRestore() { runOnUiThread { playGames.cloudRestore() } }
        @JavascriptInterface fun pgsConfirmRestored(sha: String) {
            if (sha.matches(Regex("[a-f0-9]{64}"))) runOnUiThread { playGames.confirmRestored(sha) }
        }
        @JavascriptInterface fun pgsShowAchievements() { runOnUiThread { playGames.showAchievements() } }
        @JavascriptInterface fun pgsShowLeaderboards() { runOnUiThread { playGames.showLeaderboards() } }
        @JavascriptInterface fun pgsAchievement(id: String) {
            if (id.length <= 48) runOnUiThread { playGames.unlockAchievement(id) }
        }
        @JavascriptInterface fun pgsScore(metric: String, value: Long) {
            if (metric.length <= 24) runOnUiThread { playGames.submitScore(metric, value) }
        }
        @JavascriptInterface fun modelStatus(): String = modelRuntime.status()
        @JavascriptInterface fun downloadModel() { modelRuntime.download() }
        @JavascriptInterface fun askPet(petId: String, petName: String, text: String) {
            modelRuntime.ask(petId, petName, text)
        }
        // TRIALUM 1.5.5: explicit optional advanced GGUF model actions.
        @JavascriptInterface fun modelStatusTier(tier: String): String =
            if (tier == "compact" || tier == "deep") modelRuntime.status(tier) else "not-available"
        @JavascriptInterface fun downloadModelTier(tier: String) {
            if (tier == "compact" || tier == "deep") modelRuntime.download(tier)
        }
        @JavascriptInterface fun askPetAdvanced(
            petId: String, petName: String, text: String, tier: String, context: String
        ) {
            if ((tier == "compact" || tier == "deep") && context.length <= 2500) {
                modelRuntime.ask(petId, petName, text, tier, context)
            }
        }
        @JavascriptInterface fun copyText(text: String) {
            if (text.length > 64000) return
            runOnUiThread {
                val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                clipboard.setPrimaryClip(ClipData.newPlainText("TRIALUM P2P", text))
            }
        }
        @JavascriptInterface fun shareText(text: String) {
            if (text.length > 64000) return
            runOnUiThread {
                val send = Intent(Intent.ACTION_SEND).apply {
                    type = "text/plain"
                    putExtra(Intent.EXTRA_TEXT, text)
                }
                try { startActivity(Intent.createChooser(send, "Испрати ТРИАЛУМ покана")) }
                catch (_: Exception) {}
            }
        }

        @JavascriptInterface fun saveBackup(json: String, fileName: String) {
            if (json.toByteArray(Charsets.UTF_8).size > maxBackupBytes) {
                runOnUiThread { backupNotice(false,"Бекапот е поголем од 20 MB.","tooLarge") }
                return
            }
            try { JSONObject(json) } catch (_: Exception) {
                runOnUiThread { backupNotice(false,"Невалиден JSON за бекап.","invalidJson") }
                return
            }
            val bytes = json.toByteArray(Charsets.UTF_8)
            val name = fileName.replace(Regex("[^A-Za-z0-9._-]"), "_").take(90)
            runOnUiThread {
                pendingBackup = bytes
                val intent = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "application/json"
                    putExtra(Intent.EXTRA_TITLE, name.ifEmpty { "trialum-backup.json" })
                }
                try { startActivityForResult(intent, backupSaveRequest) }
                catch (e: Exception) {
                    pendingBackup = null
                    backupNotice(false,"Не можам да го отворам изборот за бекап: " + (e.message ?: "грешка"),"pickerSave")
                }
            }
        }
        @JavascriptInterface fun chooseBackup() {
            runOnUiThread {
                val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "*/*" // Some file providers label JSON as plain text.
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                }
                try { startActivityForResult(intent, backupOpenRequest) }
                catch (e: Exception) {
                    backupNotice(false,"Не можам да го отворам изборот за враќање: " + (e.message ?: "грешка"),"pickerRestore")
                }
            }
        }
        @JavascriptInterface fun requestNotifications() {
            runOnUiThread {
                if (Build.VERSION.SDK_INT >= 33 &&
                    checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)
                        != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                    requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 11)
                } else {
                    val intent = Intent("android.settings.APP_NOTIFICATION_SETTINGS").apply {
                        putExtra("android.provider.extra.APP_PACKAGE", packageName)
                    }
                    try { startActivity(intent) } catch (_: Exception) { }
                }
            }
        }
        @JavascriptInterface fun updateState(json: String) {
            // Do not let web content write arbitrary files or invoke system actions.
            if (json.length > 1_000_000) return
            getSharedPreferences("trialum", MODE_PRIVATE).edit().putString("snapshot", json).apply()
        }
        @JavascriptInterface fun shareImage(dataUrl: String, title: String) {
            val bytes = readPng(dataUrl) ?: return
            try {
                val directory = File(cacheDir, "shared").apply { mkdirs() }
                val file = File(directory, "trialum-" + System.currentTimeMillis() + ".png")
                file.writeBytes(bytes)
                val uri = FileProvider.getUriForFile(this@MainActivity, packageName + ".fileprovider", file)
                val share = Intent(Intent.ACTION_SEND).apply {
                    type = "image/png"
                    putExtra(Intent.EXTRA_STREAM, uri)
                    putExtra(Intent.EXTRA_TEXT, title.take(100))
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                }
                runOnUiThread {
                    try { startActivity(Intent.createChooser(share, "Сподели ТРИАЛУМ")) }
                    catch (_: Exception) { }
                }
            } catch (_: Exception) { }
        }
        /**
         * Automatic, user-initiated media export. API 29+: MediaStore in the
         * regular Screenshots / Movies collection with no broad storage access.
         * On API 26–28 the app-specific media fallback is scanned into Gallery.
         */
        @JavascriptInterface fun saveMedia(dataUrl: String, fileName: String, mimeType: String, share: Boolean) {
            val formats = mapOf("image/png" to ".png", "image/gif" to ".gif",
                "video/mp4" to ".mp4", "video/webm" to ".webm")
            val ext = formats[mimeType] ?: return
            val comma = dataUrl.indexOf("base64,")
            if (comma < 0 || dataUrl.length > 45_000_000) return
            val bytes = try { Base64.decode(dataUrl.substring(comma+7), Base64.DEFAULT) }
                catch (_: Exception) { return }
            if (bytes.isEmpty() || bytes.size > 30_000_000) return
            val stem = fileName.substringBeforeLast('.')
                .replace(Regex("[^A-Za-z0-9._-]"), "_").take(70).ifBlank { "TRIALUM" }
            val name = stem + ext
            try {
                val isVideo = mimeType.startsWith("video/")
                val uri: android.net.Uri
                if (Build.VERSION.SDK_INT >= 29) {
                    val values = ContentValues().apply {
                        put(MediaStore.MediaColumns.DISPLAY_NAME, name)
                        put(MediaStore.MediaColumns.MIME_TYPE, mimeType)
                        put(MediaStore.MediaColumns.RELATIVE_PATH,
                            (if (isVideo) Environment.DIRECTORY_MOVIES + "/TRIALUM"
                             else Environment.DIRECTORY_PICTURES + "/Screenshots"))
                        put(MediaStore.MediaColumns.IS_PENDING, 1)
                    }
                    val collection = if(isVideo) MediaStore.Video.Media.EXTERNAL_CONTENT_URI
                        else MediaStore.Images.Media.EXTERNAL_CONTENT_URI
                    uri = contentResolver.insert(collection, values) ?: error("MediaStore insert failed")
                    try {
                        contentResolver.openOutputStream(uri)?.use { it.write(bytes) }
                            ?: error("MediaStore stream unavailable")
                        val finish = ContentValues().apply { put(MediaStore.MediaColumns.IS_PENDING, 0) }
                        contentResolver.update(uri, finish, null, null)
                    } catch (e: Exception) {
                        contentResolver.delete(uri, null, null)
                        throw e
                    }
                } else {
                    // Does not require WRITE_EXTERNAL_STORAGE permission on Android 8–9.
                    val dir = File(getExternalFilesDir(
                        if (isVideo) Environment.DIRECTORY_MOVIES else Environment.DIRECTORY_PICTURES),
                        if(isVideo) "TRIALUM" else "Screenshots").apply { mkdirs() }
                    val target = File(dir, stem + "-" + System.currentTimeMillis() + ext)
                    target.writeBytes(bytes)
                    uri = FileProvider.getUriForFile(this@MainActivity, packageName + ".fileprovider", target)
                    MediaScannerConnection.scanFile(this@MainActivity,
                        arrayOf(target.absolutePath), arrayOf(mimeType), null)
                }
                runOnUiThread {
                    if (share) {
                        val intent = Intent(Intent.ACTION_SEND).apply {
                            type = mimeType
                            putExtra(Intent.EXTRA_STREAM, uri)
                            putExtra(Intent.EXTRA_TEXT, "TRIALUM — Жива искра")
                            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                        }
                        try { startActivity(Intent.createChooser(intent, "Сподели ТРИАЛУМ")) }
                        catch (_: Exception) { }
                    }
                    val feedback = JSONObject().put("ok", true).put("name", name)
                        .put("mime", mimeType)
                    web.evaluateJavascript("window.TrialumMediaSaved && window.TrialumMediaSaved("+
                        feedback.toString()+");", null)
                }
            } catch (e: Exception) {
                val feedback = JSONObject().put("ok", false)
                    .put("message", (e.message ?: "Неуспешно зачувување").take(180))
                runOnUiThread {
                    web.evaluateJavascript("window.TrialumMediaSaved && window.TrialumMediaSaved("+
                        feedback.toString()+");", null)
                }
            }
        }
        @JavascriptInterface fun saveImage(dataUrl: String, fileName: String) {
            val bytes = readPng(dataUrl) ?: return
            val safeName = fileName.replace(Regex("[^A-Za-z0-9._-]"), "_").take(80)
            runOnUiThread {
                pendingImage = bytes
                val intent = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "image/png"
                    putExtra(Intent.EXTRA_TITLE, safeName.ifEmpty { "TRIALUM.png" })
                }
                try { startActivityForResult(intent, imageRequestCode) }
                catch (_: Exception) { pendingImage = null }
            }
        }

    }
    override fun onStart() {
        super.onStart()
        TrialumPush.syncRevocation(applicationContext)
        if (::modelRuntime.isInitialized) modelRuntime.onVisible()
    }
    override fun onStop() {
        if (::nearby.isInitialized) nearby.stop()
        if (::modelRuntime.isInitialized) modelRuntime.onHidden()
        super.onStop()
    }
    override fun onDestroy() {
        if (::nearby.isInitialized) nearby.stop()
        if (::modelRuntime.isInitialized) modelRuntime.destroy()
        web.destroy()
        super.onDestroy()
    }
}
