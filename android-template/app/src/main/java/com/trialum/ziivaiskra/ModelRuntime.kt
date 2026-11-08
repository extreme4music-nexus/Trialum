package com.trialum.ziivaiskra

import android.app.Activity
import android.os.Build
import dev.ffmpegkit.llama.Llama
import dev.ffmpegkit.llama.LlamaConfig
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import java.security.MessageDigest
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Optional, real on-device GGUF LLM. No cloud inference and no background
 * generation. Only explicit chat requests trigger model load and inference.
 * The model file is not part of the APK and is never auto-downloaded.
 */
class ModelRuntime(
    private val activity: Activity,
    private val emit: (kind: String, petId: String, text: String) -> Unit
) {
    companion object {
        private const val FILENAME = "SmolLM2-135M-Instruct-Q3_K_M.gguf"
        private const val URL_MODEL =
            "https://huggingface.co/unsloth/SmolLM2-135M-Instruct-GGUF/resolve/8637628433dc3df4a2d363adc89e4c3917f299dc/SmolLM2-135M-Instruct-Q3_K_M.gguf"
        private const val MIN_SIZE = 93_510_208L
        private const val MAX_SIZE = 93_510_208L
        private const val EXPECTED_SHA = "3e8e1ce198396779d5a8e60e20c469ad5e064624f4e99790af40de57b46fec95"
    }
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val downloading = AtomicBoolean(false)
    @Volatile private var visible = true
    @Volatile private var busy = false
    private var generation: Job? = null
    private val file: File get() = File(File(activity.filesDir, "models"), FILENAME)
    private fun valid(): Boolean {
        val f = file
        if (!f.exists() || f.length() !in MIN_SIZE..MAX_SIZE) return false
        return try { f.inputStream().use { String(it.readNBytes(4), Charsets.US_ASCII) == "GGUF" } }
        catch (_: Exception) { false }
    }
    fun status(): String {
        return when {
            downloading.get() -> "downloading"
            busy -> "generating"
            valid() -> "installed"
            else -> "not-installed"
        }
    }
    fun download() {
        if (valid()) { emit("status", "", "Моделот веќе е преземен."); return }
        if (!downloading.compareAndSet(false, true)) return
        scope.launch {
            val dest = file
            val temp = File(dest.parentFile, FILENAME + ".part")
            try {
                dest.parentFile?.mkdirs()
                emit("status", "", "Преземање на вистински GGUF модел (~94 MB)…")
                val conn = URL(URL_MODEL).openConnection() as HttpURLConnection
                conn.connectTimeout = 25000
                conn.readTimeout = 50000
                conn.instanceFollowRedirects = true
                conn.setRequestProperty("User-Agent", "Trialum-Android-1.4.1")
                val sha = MessageDigest.getInstance("SHA-256")
                conn.inputStream.use { input ->
                    temp.outputStream().use { output ->
                        val buffer = ByteArray(32768)
                        var size = 0L
                        var lastPercent = -1
                        val total = conn.contentLengthLong
                        while (true) {
                            val n = input.read(buffer)
                            if (n < 0) break
                            size += n
                            if (size > MAX_SIZE) error("Неподдржана големина на моделот.")
                            output.write(buffer, 0, n)
                            sha.update(buffer, 0, n)
                            if (total > 0) {
                                val percent = (100 * size / total).toInt().coerceIn(0, 99)
                                if (percent >= lastPercent + 10) {
                                    lastPercent = percent
                                    emit("progress", "", "Преземени $percent% од моделот")
                                }
                            }
                        }
                    }
                }
                val downloadedHash = sha.digest().joinToString("") { "%02x".format(it.toInt() and 0xff) }
                if (downloadedHash != EXPECTED_SHA) error("Моделот не ја помина SHA-256 проверката.")
                if (temp.length() !in MIN_SIZE..MAX_SIZE ||
                    temp.inputStream().use { String(it.readNBytes(4), Charsets.US_ASCII) } != "GGUF"
                ) error("Преземената датотека не е валиден GGUF.")
                if (!temp.renameTo(dest)) {
                    temp.copyTo(dest, overwrite = true)
                    temp.delete()
                }
                if (!valid()) error("Неуспешна проверка на GGUF.")
                emit("status", "", "Готово! Вистинскиот модел е инсталиран локално.")
            } catch (e: Exception) {
                temp.delete()
                emit("error", "", "Преземањето не успеа: " + (e.message ?: "грешка во врската"))
            } finally { downloading.set(false) }
        }
    }
    fun ask(petId: String, petName: String, userMessage: String) {
        if (!visible) return
        if (!valid()) { emit("error", petId, "Прво преземи го мини LLM пакетот."); return }
        val msg = userMessage.trim().take(360)
        if (msg.isBlank() || petId.length > 70 || petName.length > 64) return
        if (busy) { emit("status", petId, "Миленикот веќе размислува…"); return }
        generation = scope.launch {
            busy = true
            emit("status", petId, "🧠 Моделот размислува локално…")
            try {
                // Avoid holding hundreds of MB while the app is idle:
                // load on demand, generate, then release native memory.
                val model = Llama.loadModel(
                    modelPath = file.absolutePath,
                    config = LlamaConfig(contextSize = 1024, threads = 3)
                )
                try {
                    val answer = Llama.complete(
                        model,
                        prompt = msg,
                        systemPrompt =
                            "You are $petName, a friendly, fictional animal evolved in the game TRIALUM. " +
                            "Speak in very short playful sentences. Keep the conversation creative and " +
                            "clear. You do not have access to the Internet or to private data.",
                        maxTokens = 96
                    )
                    if (visible) emit("reply", petId, answer.text.trim().take(1000))
                } finally {
                    Llama.releaseModel(model)
                }
            } catch (_: CancellationException) {
                // The app moved to the background. Never send delayed replies.
            } catch (e: Exception) {
                if (visible) emit("error", petId, "Локалниот LLM не успеа: " + (e.message ?: "грешка"))
            } finally { busy = false }
        }
    }
    fun onVisible() { visible = true }
    fun onHidden() { visible = false; generation?.cancel(); generation = null }
    fun destroy() { onHidden(); scope.cancel() }
}
