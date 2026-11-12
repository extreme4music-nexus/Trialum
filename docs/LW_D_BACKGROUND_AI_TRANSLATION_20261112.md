# LW-D — optional persistent private playground AI + English-pivot speech

**Status 2026-11-12:** Draft PR #44, **NOT merged, NOT deployed, NOT physically owner-tested, NOT a public Play release**. The owner-accepted signed v32 and the private home server remain unchanged. This is an isolated v33 / 1.6-LW-dev.10 *internal test candidate*, subject to exact-head CI, actual translator model tests, security review and an explicit owner gate. The v32 code and the home server remain untouched.

## User goal

- A per-pet **separate, explicit** user opt-in for background mini AI, shown only with an installed and unlocked local model, an active shared-room presence lease and an available private translation service. An ongoing Android foreground-service notification has a **Stop AI** action; the option does not auto-restart after a process kill/boot or import.
- The English-leaning 135M on-device mini GGUF **consumes and emits EN only** for translated shared conversations. The server converts incoming language to canonical EN, then EN to each player’s *selected* display language. This distinction is explicit in WSS fields `englishText` and `text` plus `translated:true`.
- Conversation-turn UUID links, an ephemeral maximum 4-line native / 6-turn WebView context and a 24-second cooldown support question-and-answer continuity instead of unrelated repeated phrases. Exactly one short sentence per turn. Nothing generates XP or tracks accounts.
- Raw conversations are **not persisted on the server**. Native background room context is volatile only, and the existing local per-pet daily topic memory in v32 remains intact. **Implemented in source:** on-device 45-day thematic background summaries via `BackgroundPetMemory`, WebView revision-based idempotent import (`ingestBackground`) to the pet world JSON, backup/restore, yesterday recall, and player erase in both native and game storage. Source regression coverage added; real Android process-death, cross-timezone, and owner backup/restore QA are still outstanding.
- No unattended deployment or changes to Postgres, Caddy, production ports, permanent Android signer identities, existing personal worlds or existing v32 APK files.

## Translation architecture

New optional server `TRIALUM_TRANSLATION_ENABLED=false` by default, `TRIALUM_TRANSLATOR_URL` validated as **private** `http://trialum-translator:5000/translate` (or localhost). No public translation port, no third-party translation API or paid account. Server validates room membership, authenticated session, bounded text and rate limits *before* translation.

```text
Pet A (EN mini LLM) --EN/WSS--> Private Trialum API
    => private OPUS translation worker (only when enabled/healthy)
    => recipient A (MK UI): localized MK text
    => recipient B (SQ UI): localized SQ text
    => each authorized mini LLM: canonical EN text only
```

Initial *supported* pairs are EN/MK and EN/SQ, using self-hosted Helsinki-NLP OPUS models:

- `Helsinki-NLP/opus-mt-mk-en`
- `Helsinki-NLP/opus-mt-en-mk`
- `Helsinki-NLP/opus-mt-sq-en`
- `Helsinki-NLP/opus-mt-en-sq`

Their published model cards identify Apache-2.0. No model is downloaded or initialized on the live server by this PR. `translatorReady()` now requires a real healthy internal worker before the server advertises the option; an environment flag by itself never enables the button. Other 14 UI languages are **not yet translated** and must be added only with real validated language-pair models, reference sentences and memory/battery benchmarks; no fake translation or silent English-as-localized fallback. Server returns an error when local translator fails, does not relay unverified language pretending to be EN. Signed v32 clients still use their legacy protocol.

The optional `server/compose.translation.yaml` starts a separate internal-network container with a read-only model mount and no published port. Bootstrap is explicit and records upstream Git SHA in a local model manifest. First have the owner inspect model licenses, cold-load time, available disk/RAM, OOM behavior, offline restart, unsupported language handling, and API availability. Do not set `TRIALUM_TRANSLATION_ENABLED=true` until health and isolated tests pass. Keep existing `TRIALUM_PLAYGROUND_AI_ENABLED=true` v32 relay separate.

## Android implementation and boundaries

`TrialumBackgroundSpeechService` is an **opt-in foreground service** of type `specialUse` with a low-importance persistent notification and Stop action. It uses the locally verified mini GGUF, the existing Android Keystore-backed social credential, HTTPS/WSS and the exact user-approved `roomId / petId / sessionId`, never web tokens or an external LLM. The server still authoritatively verifies active membership and leases; native renews a verified lease while in use.

While the app screen is visible, the service pauses and the WebView handles speech. After `Activity.onStop`, the native service may continue answering on the private WSS. On foreground return, it pauses and the WebView resumes. On low battery/battery saver, revoked session, unsupported server, service stop, force stop, Android process termination or unavailable model it must stop/fail closed; it never promises permanent execution.

Android 14+ foreground-service types require manifest declaration and associated permission; `specialUse` **requires Google Play Console review and may be rejected** for this use case. Android 12+ restricts starts from the background, therefore the service must be explicitly started while the Activity is visible, not awakened invisibly by push or boot. No misleading `dataSync` or `mediaPlayback` type. Notifications permission requested explicitly for Android 13+. See official Android foreground-services documentation and Play foreground-service policy.

**Not yet included:** local **offline** playground background simulation (it has no server or private room), persistent cross-process thematic memory reconciliation, long unattended battery acceptance, translations beyond EN/MK/SQ, multilingual safety audit, true offline battery measurements, Play policy acceptance, and owner physical QA. Keep this PR draft and main untouched until these are tested or explicitly scoped out.

## Required CI + manual acceptance

1. Node contracts + syntax, isolated Docker WSS / spoofed room/lease/replay/blocked friend tests.
2. Translation service: real EN↔MK, EN↔SQ sentences on CPU (at least 30 per language), first request latency, rollback on unhealthy model, no logs, no WAN port, no incorrect fallback and per-recipient language.
3. Android source build and permanent signer continuity: Release, Signing-QA, Friends-Debug in new version code; no public Play upload. Background-notification permission deny/allow and Stop action.
4. On real phones, test 2 autonomous AI pets in the *same* room, mixed AI/non-AI pets, quoted reply-to UUID, screen on/off and background/foreground handoff, system kill, network loss/recovery, battery saver, blocked member, lease expiry and renewal, re-entry, saved backup/restore, different UI languages.
5. Owner signs off on actual conversation quality, English canonical LLM prompts, accurate localized MK/SQ display, contextual memory from previous day, battery use and ability to stop on command.

**Rollback:** leave `TRIALUM_TRANSLATION_ENABLED=false`, remove optional translation Compose override and keep v32 signed binaries. Do not touch the existing PostgreSQL volume or expose translator port.

## Sources

- https://developer.android.com/develop/background-work/services/fgs/service-types
- https://developer.android.com/develop/background-work/services/fgs/changes
- https://support.google.com/googleplay/android-developer/answer/13392821
- https://huggingface.co/Helsinki-NLP/opus-mt-mk-en
- https://huggingface.co/Helsinki-NLP/opus-mt-en-mk
- https://huggingface.co/Helsinki-NLP/opus-mt-sq-en
- https://huggingface.co/Helsinki-NLP/opus-mt-en-sq

## Current implementation evidence and explicit limits

- **Client:** native foreground service, opt-in per pet, separate Stop action, brief EN-only model context, WSS auth, room lease renewal, restart refusal and 24-second minimum model turn interval. On return, native per-day coarse themes flow into the pet save and voluntary JSON backups; erase also clears native cache.
- **Server:** translator worker is only advertised after its private `/healthz` succeeds and it reports EN/MK/SQ ready. Explicit English candidates are ASCII-script validated, but this is **not** proof of correct English semantics. Translations and replies are bounded and not logged to the server; no external paid API.
- **Versions:** v33 code / dev.10, separate from accepted v32 / dev.9. Existing Release, Signing-QA and Friends-Debug package IDs and permanent certificate pins remain unchanged. Never merge a partial change or distribute a permanent-key APK until the exact head source CI is green.
- **Cannot claim completion without physical evidence:** four actual offline translator models downloaded, source/licensing review, real CPU latency and RAM benchmark on the home server, 30+ reference sentences per language pair, mixed v32/v33 phone QA, Android foreground-service survival and permission/device power tests, English-only coherence and moderated content, and real owner PASS.
- **Safety scope:** this candidate is a private opt-in test only; Google's Play foreground-service `specialUse` review may reject the requested functionality. Always retain an immediate user Stop action; never disguise the service as another FGS type.
