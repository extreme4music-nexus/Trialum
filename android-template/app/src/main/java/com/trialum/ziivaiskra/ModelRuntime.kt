package com.trialum.ziivaiskra

import android.app.Activity
import android.app.ActivityManager
import android.content.Context
import dev.ffmpegkit.llama.Llama
import dev.ffmpegkit.llama.LlamaConfig
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest
import java.util.concurrent.atomic.AtomicBoolean

/**
 * User-initiated offline GGUF inference.
 * The legacy 135M model stays available; two larger multilingual models
 * are optionally downloadable ONLY after an explicit user interaction.
 * Pinned upstream revisions, exact size and SHA-256 prevent substituted files.
 */
class ModelRuntime(
    private val activity: Activity,
    private val emit: (kind: String, petId: String, text: String) -> Unit
) {
    private data class Spec(
        val key: String, val filename: String, val url: String,
        val size: Long, val digest: String, val minRam: Long, val maxTokens: Int
    )

    private val models = listOf(
        Spec(
            "mini", "SmolLM2-135M-Instruct-Q3_K_M.gguf",
            "https://huggingface.co/unsloth/SmolLM2-135M-Instruct-GGUF/resolve/8637628433dc3df4a2d363adc89e4c3917f299dc/SmolLM2-135M-Instruct-Q3_K_M.gguf",
            93510208L, "3e8e1ce198396779d5a8e60e20c469ad5e064624f4e99790af40de57b46fec95",
            0L, 96
        ),
        Spec(
            "compact", "qwen2.5-0.5b-instruct-q4_k_m.gguf",
            "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/9217f5db79a29953eb74d5343926648285ec7e67/qwen2.5-0.5b-instruct-q4_k_m.gguf",
            491400032L, "74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db",
            4L * 1024 * 1024 * 1024, 168
        ),
        Spec(
            "deep", "qwen2.5-1.5b-instruct-q4_k_m.gguf",
            "https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/91cad51170dc346986eccefdc2dd33a9da36ead9/qwen2.5-1.5b-instruct-q4_k_m.gguf",
            1117320736L, "6a1a2eb6d15622bf3c96857206351ba97e1af16c30d7a74ee38970e434e9407e",
            6L * 1024 * 1024 * 1024, 192
        )
    ).associateBy { it.key }

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val downloading = AtomicBoolean(false)
    private val generating = AtomicBoolean(false)
    @Volatile private var activeDownload = ""
    @Volatile private var activeGeneration = ""
    @Volatile private var visible = true
    private var generation: Job? = null
    private fun spec(key: String): Spec? = models[key]
    private fun file(model: Spec) = File(File(activity.filesDir, "models"), model.filename)
    private fun verifiedFile(model: Spec): Boolean {
        val target = file(model)
        if (!target.exists() || target.length() != model.size) return false
        return try {
            target.inputStream().use { input ->
                val bytes = ByteArray(4)
                input.read(bytes) == 4 && String(bytes, Charsets.US_ASCII) == "GGUF"
            }
        } catch (_: Exception) { false }
    }
    fun status(tier: String = "mini"): String {
        val model = spec(tier) ?: return "not-available"
        return when {
            downloading.get() && activeDownload == model.key -> "downloading"
            generating.get() && activeGeneration == model.key -> "generating"
            verifiedFile(model) -> "installed"
            else -> "not-installed"
        }
    }
    private fun safeReason(e: Exception): String = (e.localizedMessage ?: e.javaClass.simpleName).take(180)
    private fun checkResources(model: Spec) {
        if (model.minRam > 0) {
            val manager = activity.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
            val memory = ActivityManager.MemoryInfo()
            manager.getMemoryInfo(memory)
            if (memory.totalMem < model.minRam) error("Not enough physical RAM for this model.")
        }
        val dir = File(activity.filesDir, "models")
        dir.mkdirs()
        if (!verifiedFile(model) && dir.usableSpace < model.size + 128L * 1024 * 1024) {
            error("Insufficient free storage for this model and temporary download.")
        }
    }
    /** Only directly triggered by the player's Download action. */
    fun download(tier: String = "mini") {
        val model = spec(tier) ?: return
        if (verifiedFile(model)) { emit("status", "", "Local ${model.key} model is already installed."); return }
        if (!downloading.compareAndSet(false, true)) { emit("status", "", "A model download is already running."); return }
        activeDownload = model.key
        scope.launch {
            val target = file(model)
            val temp = File(target.parentFile, model.filename + ".part")
            var connection: HttpURLConnection? = null
            try {
                checkResources(model)
                emit("status", "", "Downloading ${model.key} GGUF: ${model.size / 1_000_000} MB…")
                connection = URL(model.url).openConnection() as HttpURLConnection
                connection.connectTimeout = 25000
                connection.readTimeout = 50000
                connection.instanceFollowRedirects = true
                connection.setRequestProperty("User-Agent", "Trialum-Android-1.5.5")
                connection.connect()
                if (connection.responseCode !in 200..299) error("Model HTTP ${connection.responseCode}")
                val md = MessageDigest.getInstance("SHA-256")
                var readTotal = 0L
                var notified = -1
                connection.inputStream.use { input ->
                    temp.outputStream().use { output ->
                        val buffer = ByteArray(32768)
                        while (true) {
                            val read = input.read(buffer)
                            if (read < 0) break
                            readTotal += read
                            if (readTotal > model.size) error("Model exceeds the expected size.")
                            output.write(buffer, 0, read)
                            md.update(buffer, 0, read)
                            val percent = (100 * readTotal / model.size).toInt().coerceIn(0, 99)
                            if (percent >= notified + 10) {
                                notified = percent
                                emit("progress", "", "${model.key}: ${percent}%")
                            }
                        }
                    }
                }
                if (readTotal != model.size) error("Incomplete GGUF download.")
                val computed = md.digest().joinToString("") { "%02x".format(it.toInt() and 0xff) }
                if (computed != model.digest) error("GGUF SHA-256 mismatch.")
                temp.inputStream().use { input ->
                    val magic = ByteArray(4)
                    if (input.read(magic) != 4 || String(magic, Charsets.US_ASCII) != "GGUF") error("Not a GGUF file.")
                }
                if (!temp.renameTo(target)) {
                    temp.copyTo(target, overwrite = true)
                    temp.delete()
                }
                if (!verifiedFile(model)) error("Local model verification failed.")
                emit("status", "", "${model.key} GGUF installed and SHA-256 verified.")
            } catch (e: Exception) {
                temp.delete()
                emit("error", "", "Model download: " + safeReason(e))
            } finally {
                connection?.disconnect()
                activeDownload = ""
                downloading.set(false)
            }
        }
    }

    fun ask(
        petId: String, petName: String, userMessage: String,
        tier: String = "mini", personaContext: String = ""
    ) {
        if (!visible) return
        val model = spec(tier) ?: return
        if (!verifiedFile(model)) { emit("error", petId, "Download the selected GGUF model first."); return }
        val message = userMessage.trim().take(360)
        if (message.isEmpty() || petId.length > 70 || petName.length > 64) return
        if (!generating.compareAndSet(false, true)) { emit("status", petId, "Model is already generating."); return }
        activeGeneration = tier
        generation = scope.launch {
            emit("status", petId, "🧠 Local ${model.key} model is thinking…")
            try {
                checkResources(model)
                val native = Llama.loadModel(
                    modelPath = file(model).absolutePath,
                    config = LlamaConfig(contextSize = if (tier == "mini") 1024 else 2048, threads = if (tier == "deep") 4 else 3)
                )
                try {
                    val context = personaContext.take(2200)
                    val system =
                        "You are ${petName}, a friendly FICTIONAL evolved creature in TRIALUM. " +
                        "Your mood and personality are simulated game data, never real sentience. " +
                        "Use concise, age-appropriate, warm language. Never request real personal information. " +
                        "Do not claim to access the internet. Follow the player language when possible. " +
                        if (tier == "mini") "" else "Your bounded game biography and recent conversations: " + context
                    val result = Llama.complete(native, prompt = message, systemPrompt = system, maxTokens = model.maxTokens)
                    if (visible) emit(if (tier == "mini") "reply" else "advancedReply", petId, result.text.trim().take(1000))
                } finally {
                    Llama.releaseModel(native)
                }
            } catch (_: CancellationException) {
                // Suppress delayed replies after backgrounding.
            } catch (e: Exception) {
                if (visible) emit("error", petId, "Local model: " + safeReason(e))
            } finally {
                activeGeneration = ""
                generating.set(false)
            }
        }
    }
    fun onVisible() { visible = true }
    fun onHidden() { visible = false; generation?.cancel(); generation = null }
    fun destroy() { onHidden(); scope.cancel() }
}
