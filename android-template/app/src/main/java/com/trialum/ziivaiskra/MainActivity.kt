package com.trialum.ziivaiskra

import android.Manifest
import android.content.Intent
import android.util.Base64
import androidx.core.content.FileProvider
import java.io.File
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
    private val host = "appassets.androidplatform.net"
    private var pendingImage: ByteArray? = null
    private val imageRequestCode = 1303
    private fun readPng(dataUrl: String): ByteArray? {
        if (!dataUrl.startsWith("data:image/png;base64,") || dataUrl.length > 12_000_000) return null
        return try {
            val data = Base64.decode(dataUrl.substringAfter(","), Base64.DEFAULT)
            val sig = byteArrayOf(0x89.toByte(), 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)
            if (data.size < 100 || data.size > 8_000_000 || !data.take(8).toByteArray().contentEquals(sig)) null else data
        } catch (_: Exception) { null }
    }
    @Deprecated("Storage Access Framework save result")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != imageRequestCode) return
        val bytes = pendingImage
        pendingImage = null
        if (resultCode == RESULT_OK && bytes != null) {
            try { data?.data?.let { uri -> contentResolver.openOutputStream(uri)?.use { it.write(bytes) } } }
            catch (_: Exception) { }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        web = WebView(this)
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
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)
            != android.content.pm.PackageManager.PERMISSION_GRANTED) {
            requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 11)
        }
    }
    inner class Bridge {
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
    override fun onDestroy() { web.destroy(); super.onDestroy() }
}
