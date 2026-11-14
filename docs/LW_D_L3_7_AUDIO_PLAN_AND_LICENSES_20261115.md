# Trialum LW-D L3.7 — ROOM MUSIC, SPATIAL AUDIO & OPEN-ASSET LICENSES
**Owner directive:** 2026-11-15. **Status:** implementation in progress on `feature/lw-d-l3-7-laboratory-life-reactions-20261115`; NOT owner phone-tested.

## Accepted now
- Main Lobby is the universal public entrance and interchange to all present and future **non-home** 3D scenes, not merely a laboratory corridor. Existing laboratory rooms remain physically distinct; World Atlas provides transitional access to Classic screens that have not yet become real 3D rooms.
- Every room gets a recognizable *different* background-music motif.
- Engine-confirmed actions trigger appropriate sounds, including failure; source locations and relative camera orientation control spatial audio.
- Music is NON-SPATIAL, gently mixed and never louder when the camera turns; machine/event effects are 3D positional.
- Respect existing player audio settings, explicit WebView tap-to-unlock autoplay rules, audio OFF as a valid choice, pause/cleanup on hidden scenes/background, and reduced-motion/safe-listening behavior.
- **Do NOT replace the entire 3D geometry or all models yet**. Owner wants a later visual-remaster pass once the full game has 3D coverage.

## Source-verified options (software vs audio content are separate licenses)
| Item | URL | License | Decision |
| --- | --- | --- | --- |
| Native Web Audio API | https://www.w3.org/TR/webaudio-1.0/ | Web platform API; not a commercial asset pack | **IMPLEMENT FIRST**: AudioContext, PannerNode HRTF, AudioListener camera vectors, offline with no dependency |
| Howler.js with spatial plugin | https://github.com/goldfire/howler.js | MIT | Good future implementation option if asset management/cross-platform playback requires it. Vendor locally and retain MIT notice if used. Not yet vendored. |
| Tone.js | https://github.com/Tonejs/Tone.js | MIT | Useful future composition engine for dynamic arrangements/transport. Not yet vendored; don't load via a remote CDN in offline Android. |
| Kenney Sci-fi Sounds | https://kenney.nl/assets/sci-fi-sounds | CC0 | 70 freely reusable sci-fi SFX; candidate machine effects after quality review. **No sample files copied to repo in this step.** |
| Kenney Interface Sounds | https://kenney.nl/assets/interface-sounds | CC0 (verify on pack page at import) | Candidate buttons/feedback. Not yet bundled. |
| OpenGameArt music/effects | https://opengameart.org/ | PER FILE (CC0/CC BY/etc) | Candidate ambient loops; accept only explicit licenses and complete per-file author/source metadata; no indiscriminate downloads. |
| Freesound | https://freesound.org/ | PER SOUND | Optional CC0 individual sounds only after URL/license provenance review; not yet imported. |

**License distinction:** MIT is the code library license. CC0 refers to a particular audio pack, not everything on the hosting site. Attribution obligations are determined per asset. Do not assume a track is open source just because it downloads for free; preserve provenance in `assets/audio/LICENSES.md` for any future import. Avoid license-restricted music, unverified generative samples or external stream requests.

## First code slice now (original, lightweight, offline)
- `prototypes/lw-d/spatial-audio.js`: initial original algorithmic themes for Hub, Basic, DNA, Food, Flora, Research (plus distinct interim scene profiles) using native Web Audio oscillators. They are **prototype scores**, not a claim that final recorded compositions or high-fidelity production are already complete.
- `prototypes/lw-d/event-reactions.js`: whitelisted, read-only success/failure event normalization **after** trusted original-engine confirmation.
- `prototypes/lw-d/world.js`: true camera eye/forward/up vectors, updated while foreground rendered; room navigation passes via Hub.
- `js/app.js` projects existing sound/music/volume preferences as read-only data; `js/lw-d-interface.js` suspends legacy audio when 3D opens, then restores it.
- `prototypes/lw-d/world.html` exposes an explicit tap-to-unlock control; invisible WebViews do not secretly start audio.
- Scripts operate without cloud APIs or new device permissions. Sound settings OFF and muted background must remain silent.
- Existing 3D scene visuals already consume authoritative event result streams. L3.7 adds normalized output for positional SFX, with later detailed room-specific graphic effects after first regression/phone QA.

## Spatial mapping contract
Camera 3D position and forward/up direction come from the renderer's view transform, not accelerometer/phone heading. Each room's selected station has the same in-world x/y/z coordinates as its corresponding sound emitter. Interacting with a machine to the viewer's left should place its short sound to the left; turn camera towards it and the spatial position changes accordingly. No claim of room-acoustics/occlusion realism until implemented and physically tested. On speakers HRTF may be less perceptible; headphones improve the test.

## QA gates
1. Node tests cover six distinct themes, operations before sound, universal hub routing and no storage or network access.
2. Full L3.6/L3.5/LW-C, original Classic transactions, FCM, backup and localization regression tests.
3. Owner-signed existing `com.trialum.ziivaiskra.signqa` APK from trusted GitHub branch only; existing Firebase and signer; never change official/FriendsDebug/Play.
4. Galaxy A55 real-device test: landscape room switch audio, music/SFX toggles, listener left/right with headphones, muted/background and resume, no double soundtrack, performance/battery and existing save preserved. **OWNER L3.7 AUDIO PASS PENDING.**
5. For future external CC0 asset imports, spot-check each source license, metadata, audio level and package impact; keep samples local in APK/offline cache.

## Deferred, not part of L3.7
- Complete final musical production/mixing, full new high-detail 3D models, authentic acoustic simulation/occlusion and multi-user persistent city. The city is documented separately as a future proposal at the pets+homes stage.
