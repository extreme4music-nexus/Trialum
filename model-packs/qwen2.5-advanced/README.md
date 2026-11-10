# TRIALUM 1.5.5 — optional larger on-device models for Mnemos

This directory contains **metadata only**: no model binaries, API tokens or private chat transcripts are committed.

| Tier | Publisher & file | Exact bytes | SHA-256 | Pinned revision |
|---|---|---:|---|---|
| `compact` | `Qwen/Qwen2.5-0.5B-Instruct-GGUF` — `qwen2.5-0.5b-instruct-q4_k_m.gguf` | 491400032 | `74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db` | `9217f5db79a29953eb74d5343926648285ec7e67` |
| `deep` | `Qwen/Qwen2.5-1.5B-Instruct-GGUF` — `qwen2.5-1.5b-instruct-q4_k_m.gguf` | 1117320736 | `6a1a2eb6d15622bf3c96857206351ba97e1af16c30d7a74ee38970e434e9407e` | `91cad51170dc346986eccefdc2dd33a9da36ead9` |

Publisher files are downloaded only after the player explicitly chooses a tier and confirms. Android checks free space, physical RAM, exact size, GGUF magic, and SHA-256 **during download**. File size and magic are checked again before runtime use. Installed file tampering is not continuously rehashed on every launch; do not imply otherwise.

Original model: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct and https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct. Publisher GGUF repos use Apache-2.0; preserve model license and attribution in downstream distributions. The download URLs reference exact upstream Git revisions. No model weights are bundled in the APK, and neither weights nor conversations are uploaded to the game server.

**Hardware guidance (estimates, not benchmarks):** compact tier checks at least 4 GiB physical RAM; deep tier checks at least 6 GiB. Users need additional free storage and sufficient memory for native runtime, WebView and other apps. Actual generation speed, thermal behavior, and multilingual response quality remain unverified on real test phones.

Unlock: already-evolved Mnemos (species index 9), personal level at least 165, research lab level at least 20, and explicit per-pet consent. Other creatures retain the original 135M mini model at their existing milestones. Emotion and personality are fictional simulation states; do not describe them as sentience.

See [1.5.5 release notes](../../docs/RELEASE_V1.5.5.md).


## 2026-11-10: safer on-device download UX

The source is **public pinned Hugging Face**, not a GitHub private release asset. Private GitHub releases require account authorization and must not be relied upon by anonymous Android users. Model binaries remain outside the repo and APK.

Android now preserves `.part` files after a recoverable interrupted download and resumes with an HTTPS `Range` request. A server returning HTTP 200 instead of 206 restarts the transfer safely; an invalid 206 Content-Range is rejected. Only exact byte length, GGUF header and full SHA-256 matching the pinned manifest are accepted. A checksum mismatch deletes the corrupt partial file, and the UI exposes the precise download error and a resume action. Download remains opt-in and local; no model chat or private text is uploaded.

The advanced AI eligibility extends to species 9 (Mnemos) **and higher indexed evolved species**, still requiring personal level 165 and research lab level 20. No future creature gains autonomous LLM access without consent.

**Physical Android verification still required:** successful large GGUF download, restart/connection-loss resume, final checksum, model load and generation, memory/thermal handling. CI cannot replace a real on-device inference test.

## Offline model import fallback

If the Android device cannot reach Hugging Face directly, the player can use the official pinned URLs from `manifest.json` to download the correct GGUF through a browser, then choose **Import downloaded GGUF** in Trialum. Android uses the Storage Access Framework document picker and streams the file to app-private storage; it does **not** trust the filename or file MIME type. Exact size, GGUF header and SHA-256 must match before the file becomes usable. The original source file stays in the player's Downloads folder. No tokens, credentials or user chat data are involved.

LLM GGUF weights and partial files under `files/models/` are excluded from OS cloud/device-transfer backups so they cannot interfere with restoring small game-world data. They are optional and can be downloaded/imported again.
