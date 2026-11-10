# TRIALUM 1.5.5 — release scope and quality gate

> 8 November 2026 · Android SDK 36 debug beta. **Not yet a public Google Play release.** Built on `feature/trialum-v1.5.4-play-games` and its opt-in Google Play Games integration. The canonical planning file is [PROJECT_ROADMAP.md](../PROJECT_ROADMAP.md).

## Functional additions

1. **Mnemos optional advanced intelligence:** existing species-9 Mnemos at personal level ≥165 and research lab level ≥20 can opt into bounded local conversation memory, deterministic personality traits, game-simulated emotion labels and reaction animations. No reset, purchase or new creature needed. AI stays disabled until per-pet consent.
2. **Two larger real GGUF models:** Qwen2.5 0.5B Q4_K_M (491,400,032 bytes), 1.5B Q4_K_M (1,117,320,736 bytes), Apache-2.0, pinned upstream revisions and SHA-256 checks. Models download on demand to Android app-private storage, with free-space/RAM checks; the smaller 135M SmolLM2 model remains available for earlier species.
3. **Welcome and tutorial:** first-run three-step introduction; first-world five-step tutorial; both skippable and replayable from Settings. Replaying does not change game state or progression.
4. **Appearance:** system/light/dark modes with live system detection, manual persistence, a light palette, and reduced-motion attention.
5. **Internationalization:** 17 total available locale selections. System language or manual override, English fallback for untranslated content, no automatic translation of personal histories. The 15 new packs cover essential interface strings; full localization remains unfinished.
6. **Offline and Google:** the 1.5.4 Play Games functions remain optional and unconfigured until Play Console registration, OAuth/SHA-1 and physical 2-device QA. JSON backup/import continues unchanged.

## Save migration and privacy

- Save schema marker 1.5.5 accepts existing 1.4.1–1.5.4 worlds through existing migration functions.
- Already evolved Mnemos unlocks without transformation or migration into a separate world.
- Only opted-in Mnemos writes `p.mind` with bounded last-eight short memory records. The existing local `p.chatHistory` remains, and all private records travel in player-initiated JSON backup and optional Google cloud save **if the player enables cloud**. Thus **do not claim that opt-in cloud backups never contain chats**.
- Advanced LLM runs on-device, not a chat server. No model is silently downloaded. Generation is canceled when the app is backgrounded; model memory is released after each message. The underlying model may make inaccurate statements.
- Real-world player identity is not requested by the fictional creature. Chat history is user-controlled through world backup/reset.

## Version and build

- Android `applicationId=com.trialum.ziivaiskra`, `versionCode=21`, `versionName=1.5.5`.
- `compileSdk=36`, `targetSdk=36`, `minSdk=26`.
- `main` should only be synchronized after the full Android CI suite, review and explicit recognition of remaining Play Console/device-test blockers.
- Reinstalling separately signed debug APKs can require uninstall; **export and verify JSON backup first**.

## Not done in 1.5.5

Play Console app registration, production signing, AAB store release, real OAuth/cloud two-device validation, billing/payments, Apple/macOS/Windows/Linux distribution, full 15-language narrative proofreading, and measured model latency, battery/thermal performance on a real Galaxy-class device. See [localization status](LOCALIZATION_V1.5.5.md), [advanced model metadata](../model-packs/qwen2.5-advanced/README.md), and [Play Games setup](GOOGLE_PLAY_GAMES_V1.5.4.md).

## Release QA acceptance

- [ ] JS tests, locale/theme/tutorial/Mnemos tests and Android debug build all green.
- [ ] Existing and new worlds open; no lost pets/DNA/history; JSON restore manually verified.
- [ ] Light/dark/system, onboarding and all 17 language selections work on physical phone.
- [ ] Advanced model checksums/downloads and replies actually work on representative Android hardware with sufficient storage/RAM.
- [ ] Verify real device RTL/CJK/Indic typography, audio, 2.5D eyes and thermal behavior.
- [ ] Google Play Console, Saved Games and leaderboards verified separately before public store listing.
