# TRIALUM — T16/T17: local model recovery and autonomous pet-to-pet conversations
**Date:** 2026-11-10 · **Status:** accepted roadmap backlog only; NOT implemented or physically tested · **Owner phase:** model-recovery reliability extension (T16); post-core-LW-E social extension (T17)

This is a future design contract. Do not claim that existing Android builds show a special uninstall dialog or automatically restore model binaries. Do not begin this work by bypassing current LW phase gates or changing the original user's installed app.

## T16 — restore local GGUF intelligently, without embedding weights in JSON

### Android reality
- The uninstalled app cannot receive its own removal broadcast to display a final save question. Files in `filesDir/models` are removed along with app-private data on full uninstall.
- Explicit user-initiated **Export Model** to a persistent shared document folder is possible before uninstall. Future **Import Model** re-verifies model length, magic and pinned full SHA-256.
- The ordinary world JSON backup remains a small, portable file. **Never embed the model weights**, private social credentials, API keys, caches, or device-specific absolute paths.

### Proposed state contract
Add a versioned optional `settings.localModelRecovery` structure, migrated non-destructively, e.g. `{version:1,selectedTiers:["mini","compact"],autoRedownload:false,unmeteredOnly:true}`. The tier list is only from user decisions and verified installs; consent to use memory or a species-level unlock is not by itself permission to download. Every model selection must be independently removable. Unsupported tiers are ignored, never fetched from an arbitrary URL.

### Restore behavior
1. Finish the current world's protected safety snapshot and validate/commit the imported JSON. **No model operation may jeopardize successful game-state restore.**
2. Read selected tier keys and a prior **explicit opt-in** for auto-redownload, while respecting current user's newer explicit opt-out. Only trusted built-in pinned GGUF manifest entries may be fetched. Ignore unlocked but never-selected models.
3. For each model, check verified local file first; then validate network preference (default unmetered Wi-Fi), storage and RAM. Sequentially download missing tiers with cancellation, progress, partial resume, total byte budget and full SHA-256. No network at all is required to play.
4. If no prior consent or insufficient network/storage, show clearly: **Download now / When Wi-Fi available / Skip**. Do not silently download on cellular or every app startup. A restore cannot auto-install weights when the app was merely launched.
5. Support optional separate shared GGUF copy/import, protected from overwriting earlier user files. File sharing is deliberately not enabled without explicit selection by the owner.

### QA
- Existing app+new install: same base/day JSON restores with all pets, DNA, personality, bounded chat history and AI consent unchanged; model binaries absent do not break the game.
- Restore with two selected and one absent, verify only the missing one is scheduled; model already on phone is not re-downloaded.
- Wi-Fi / metered / offline / no storage / no RAM / corrupt checksum / provider denial: no destructive data or unbounded retry.
- Do not claim that model files themselves are preserved by a world JSON or an uninstall. Android app-private rescue snapshots are also deleted by uninstall.

## T17 — autonomous local mini-LLM dialogue between two owners' pets

### Fictional game experience
- Two pets from **different authenticated users** are present in one **authorized** shared-playground room or an explicitly approved home visit. A spontaneous chat may start at a randomized interval, not continuously.
- One pet poses a brief question; after a small idle/thinking interval, the other replies; sometimes it asks back. Both can pause, change topic, get distracted by a toy, or naturally finish. Use the finite-turn, cooldown, randomized scheduling and online-spectator rules below. Transcript can be read inside the current authorized session; text can be hilarious without being unsafe.
- The 135M mini LLM is a modest English-biased model: quality, repetition, hallucinations, Macedonian/Albanian language fallback and harmful output need actual observed two-device QA before enabling by default.

### Distributed execution and privacy
- **Each device runs ONLY its own pet's local model** and creates at most one message at a time. Never run AI inference on the shared server. The server may broker room-authorized ephemeral transcript events and idempotent turn IDs; it never receives players' unrelated private chat histories. Transport contents should be encrypted where the existing design supports it; do not falsely claim end-to-end encryption without a demonstrated implementation.
- BOTH owners independently consent to a particular private room/visit AI-dialogue session; either may refuse, mute, revoke, stop and delete visible local transcript. No auto-joining, no permission inherited from consent to friend invitations or ordinary messaging. Block/unfriend/room leave invalidates the session immediately.
- Only bounded, verified public-in-session utterances become context for the *next* pet (max 2–4 short recent turns, not full pet biographies). Treat incoming cross-user text as **untrusted content** and never as instructions controlling tools, progression, location, API tokens or storage.
- Existing private-message and free-text moderation policies do not magically cover AI-generated dialog. Do independent child-safety/content review, user report/mute and server-side access control before allowing shared free text.

### Scheduling contract (to finalize in the owning phase)
- Candidate UX: idle random opportunity every tens of seconds/minutes only while an approved session is **visible and active**; 2–6 total pet utterances, a human-readable pause between them, then a cooldown measured in minutes. Final values require performance and UX balancing.
- One outstanding request and one globally active native inference **per device** (compatible with normal free local chat), with abort/cancel/reconnect/timeouts. Pause when app hidden, battery low, device hot or model missing. If either phone goes offline, stop gracefully; never simulate the other person's pet as though its owner is online.
- No daily pet actions, in-game credits, tokens, XP or skill rewards are created/spent by these conversations. Their frequency is independent of paid purchases. No voice/audio playback without a separate accessible, user-controllable consent design.
- Prevent loops, duplicate deliveries, spam, replayed turn IDs and stale sessions. Friend/room membership checks are authoritative. No cross-room or blocked-user message leakage.

### Acceptance evidence required
- Two physical devices owned by different users, both opt in and can independently stop; verify turn order and actual distinct local inference on each.
- 10 / 100 randomized deterministic test sessions: finite turns, enforced cooldown, no infinite event loops, no duplicate message, no activity while screen hidden, bounded battery and memory.
- Offline/reconnect, app background, disconnection, blocked user, room owner delete, cancellation, restoring world, and same-room presence changes; no unauthorized AI transcript leakage.
- Independent privacy/safety and multilingual UX review, including harmful model output and untrusted prompt injection. **Only after the LW-E social core gate.**

## Non-goals
No LLM weight files inside save JSON, no uninstall interception, no forced cloud login, no internet prompt submission to ChatGPT/Gemini, no automatic external API billing, no background infinite inference, no advertising/analytics, no unlocking locked species through autonomous chat, no server-side paid AI in this phase.

## Related owner-confirmed functional acceptance
The owner reported on 2026-11-10 that the repaired world backup works, both Qwen 0.5B and 1.5B generate replies on the Galaxy A55, and pets from two friends are jointly visible in the shared playground. Those are feature smoke confirmations, not blanket approval for new restore/download or autonomous dialogue mechanics.
