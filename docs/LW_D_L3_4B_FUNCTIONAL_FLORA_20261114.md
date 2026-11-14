# LW-D L3.4-B — Real Botanical Gameplay / Holographic Controls
Date: 2026-11-14. Branch: `feature/lw-d-l3-4b-functional-flora-20261114`. Base: OWNER-ACCEPTED `feature/lw-d-l3-4a-flora-laboratory-foundation-20261114`. **NOT a public release.**

## Owner request and evidence
The owner reported the L3.4-A signed APK is great ("Ајде другар. Супер е.") and supplied `Screen_Recording_20261114_220523_Trialum Signing QA.mp4` (30.216s, landscape 2340×1080). The video shows entering the botanical laboratory, switching its seed bank/analyzer/growth chamber and inspecting the real species, oxygen and specimen growth. The owner ordered completing L3.4-B and writing restart instructions in **main** in case this ChatGPT session hits its limit; see `docs/LW_D_CONTINUE_HERE.md` on main.

## Implementation
- **Real seed blueprint unlock** from holographic seed-bank machine. One explicit in-panel Confirm/Cancel, no Android native dropdown/confirm. The trusted parent WebView runs original `E.inventPlant(s,species)` (12 insight + 7 molecules, stage and botanical lab-tier rules; original engine owns unlocking, milestones and saved progress).
- **Real planting in current habitat** from holographic growth chamber. Show the real selected model and real planted specimens; Confirm/Cancel in same glass HUD. Parent verifies **the same current habitat ID** is still selected, then delegates exclusively to `E.plant(s,species)`. Engine alone enforces discovered blueprint, six-slot habitat limit, daily actions, C8/N5/P3/O6 elemental costs and seed creation in existing world data.
- **Scanner** remains a safe analytical read-only station. Real plant species available in `E.PLANTS` (base and research additions), model unlock flags, plant growth and oxygen status read from `TrialumLWBridge.snapshot()`.
- Exact same-origin iframe/source checks, operation whitelist `invent`/`plant`, model identifier validation, habitat-ID guard and one-in-flight click latch. A request is never a second game economy. Original `notice(...,'grow')` handles UI, sound, saving and backup path. Response includes before/after resources and newly synchronized authoritative snapshot.
- A short **2.4 s green success / red failure** particle pulse around seed-bank or growth-machine, only in response to original game engine result. No fake oxygen, bonus XP, extra plant or background animation.
- Regression: `tests/lw-d-flora-actions.test.cjs` exercises actual E.inventPlant/E.plant costs, refusal, no duplicate preview charges, correct save path/identity guard and effects. All prior LW-C AI/social, DNA, food, backup and FCM guards remain mandatory in SignQA CI.

## Scope ownership and signing
`com.trialum.ziivaiskra.signqa` ONLY. Existing Firebase `TRIALUM_FIREBASE_APP_ID_SIGNQA` and pinned `TRIALUM_QA_CERT_SHA256`; pre-existing QA keystore GitHub Secrets. **Automatic signing entirely in GitHub**, never ask owner for local signing, extra Firebase App ID or new secrets. Do not merge main code, Codex official Release/FriendsDebug, Play Console, production backend, database or save schema. This is a standalone Draft PR after owner-accepted 3.4-A.

## QA on phone
Install the **owner-signed** artifact as in-place SignQA upgrade (do not uninstall or clear data). Open Living World 3D → fourth laboratory door.
1. Seed bank: select a locked species whose required tier/resources are met. Cancel -> resources unchanged. Confirm -> original model unlocked and exact -12 insight/-7 molecules.
2. Growth chamber: choose an unlocked species. Cancel -> no habitat change. Confirm -> one seedling added to the **same selected habitat**, -1 habitat daily action, exact C8/N5/P3/O6. Visual reaction and growth bar after state sync.
3. Repeated taps, insufficient elements/insight, lab tier, six-plant capacity, no habitat, wrong habitat selected since confirmation: refuse without mutation.
4. Scanner, MK/EN, same hologram appearance, touch camera, all prior DNA/food/AI/Friends/FCM and backup/restore regression. No new video is necessary for the owner's acceptance when tested personally.

**Owner physical-device PASS remains pending** until explicit confirmation. Automated GitHub build/sign status documented below after run.

## What follows
After user approves L3.4-B on device, proceed incrementally to **L3.5-A — 3D Research Laboratory** (fifth and final door) using the same original engine architecture. Future gameplay-logic redesign is separate, with dedicated data-migration and acceptance gates.

## Final verified automatically signed test build — 2026-11-14

**[GitHub Actions #43642482023](https://github.com/extreme4music-nexus/Trialum/actions/runs/43642482023), run #95: SUCCESS**, source SHA `8059fb1afab95465cd0065b6d98aa64bdbbacbd5` (subsequent doc edits do not modify source). All original LW-C/FCM/DNA/Food regressions, real engine flora transaction tests, the Android SignQA build, compiled existing Firebase/HTTPS config, and **GitHub automatic QA signing with pinned certificate**: PASS. English exact catalog + forward-only accepted-key ledger: PASS. Separate social security contracts: PASS.

**INSTALLABLE signed ZIP artifact:** `Trialum-LW-D-L3-4B-OWNER-SIGNED-SIGNQA-95` (ID `14132991017`, ~6.45 MB). Contains `Trialum-LW-D-L3.4B-SIGNQA-SIGNED.apk`, checksum and BUILD-INFO, expires **2026-11-28**. The artifact `Trialum-LW-D-L3-4B-SIGNQA-UNSIGNED-95` is **not** installable and must not be selected.

**PHYSICAL OWNER QA PENDING**: signed CI is not proof of on-device visuals, actions or resource balance. User should install an in-place SignQA update without clearing data and check both real flora actions, exact resource costs, double-tap prevention, MK/EN and existing FCM, then explicitly PASS/FAIL. Keep PR #67 Draft and no production/main merge until owner direction.
