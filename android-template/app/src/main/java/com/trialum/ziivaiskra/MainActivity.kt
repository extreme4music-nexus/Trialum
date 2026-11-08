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

/** Source template for later Android build; not packaged as a compiled APK. */
class MainActivity : Activity() {
    private lateinit var web: WebView
    private lateinit var modelRuntime: ModelRuntime
    private val host = "appassets.androidplatform.net"
    private var pendingImage: ByteArray? = null
    private val imageRequestCode = 1303
    private val backupSaveRequest = 1304
    private val backupOpenRequest = 1305
    private var pendingBackup: ByteArray? = null
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
                if (bytes != null) try { contentResolver.openOutputStream(uri)?.use { it.write(bytes) } }
                    catch (_: Exception) { }
            }
            backupOpenRequest -> {
                try {
                    val json = contentResolver.openInputStream(uri)?.use { input ->
                        val bytes=input.readBytes()
                        if(bytes.size>8_000_000) null else String(bytes,Charsets.UTF_8)
                    } ?: return
                    JSONObject(json)
                    web.evaluateJavascript("window.TrialumNativeBackupReceived(" + JSONObject.quote(json) + ")",null)
                } catch (_: Exception) { }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        web = WebView(this)
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
        val loader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this)).build()
        web.settings.javaScriptEnabled = true // only trusted packaged HTML
        web.settings.domStorageEnabled = true
        web.settings.allowFileAccess = false
        web.settings.allowContentAccess = false
        web.settings.mediaPlaybackRequiresUserGesture = true
        web.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest?): WebResourceResponse? =
                request?.url?.let { loader.shouldInterceptRequest(it) }
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean =
                request?.url?.host != host  // don't navigate to remote/untrusted scripts
        }
        web.addJavascriptInterface(Bridge(), "TrialumAndroid")
        web.loadUrl("https://$host/assets/web/index.html")
        val job = PeriodicWorkRequestBuilder<CareWorker>(6, TimeUnit.HOURS).build()
        WorkManager.getInstance(this).enqueueUniquePeriodicWork("trialum-care", ExistingPeriodicWorkPolicy.KEEP, job)
    }
    inner class Bridge {
        @JavascriptInterface fun modelStatus(): String = modelRuntime.status()
        @JavascriptInterface fun downloadModel() { modelRuntime.download() }
        @JavascriptInterface fun askPet(petId: String, petName: String, text: String) {
            modelRuntime.ask(petId, petName, text)
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
            if (json.length > 8_000_000) return
            try { JSONObject(json) } catch (_: Exception) { return }
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
                catch (_: Exception) { pendingBackup = null }
            }
        }
        @JavascriptInterface fun chooseBackup() {
            runOnUiThread {
                val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "application/json"
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                }
                try { startActivityForResult(intent, backupOpenRequest) }
                catch (_: Exception) { }
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
        if (::modelRuntime.isInitialized) modelRuntime.onVisible()
    }
    override fun onStop() {
        if (::modelRuntime.isInitialized) modelRuntime.onHidden()
        super.onStop()
    }
    override fun onDestroy() {
        if (::modelRuntime.isInitialized) modelRuntime.destroy()
        web.destroy()
        super.onDestroy()
    }
}
