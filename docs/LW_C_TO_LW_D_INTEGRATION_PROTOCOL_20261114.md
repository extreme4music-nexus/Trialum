# LW-C beta → LW-D preservation & selective integration protocol
## Separate sessions; same Trialum universe • 14 November 2026

**Authority:** owner decides what LW-C beta is accepted and when it may be published.
Codex owns finishing LW-C beta and Google Play preparation in its separate session.
This LW-D session continues the immersive 3D overhaul. Neither session may delete
the other work or assume repository branch equality.

### Handoff from Codex after LW-C is ready
1. Prepare a **reviewable pull request** back to source repository
   \`extreme4music-nexus/Trialum\`, with explicit source repository/ref/SHA and target
   base/ref/SHA. **Do not force-push or directly overwrite** existing main or LW-D branches.
2. Include the LW-C beta release tag/versionCode/applicationId and source SHA, a concise
   feature-by-feature changelog, fixed regressions, **changed file list**, migration/data
   format impacts, new Android dependencies, security changes and known issues.
3. Record QA evidence: Android build signatures (without private keys), test results,
   backup/restore, offline/playground/session/reconnect, ML/AI opt-in behavior and
   release/Play Console readiness. OWNER PASS must come from the owner.
4. Any public \`trialum-beta\` release contains only approved, export-safe artefacts;
   no live secret, private keystore, phone data, personal memory or confidential history.
5. Keep original LW-C draft/history until the handoff is verified.

### This session's LW-D integration
1. Verify source and target **exact commits** first (not branch-name guesses).
2. Compare files and behavior against LW-D's tip. Make a matrix:
   **already present / real new LW-C feature / LW-D supersedes / conflicting**.
3. Bring in **only** accepted useful differences via a dedicated isolated integration
   branch/PR, adapting APIs manually where necessary (e.g. session state, communications,
   language, backup, Android features); never blanket merge or replace a newer LW-D file.
4. Preserve Lab L3 features, the scene renderer, hologram HUD, world navigation and
   established game engine. Server schema/data migrations require explicit risk review
   and rollback plan. Any Play signing/identity change is a separate owner-controlled task.
5. Run complete language, physics/engine, social, security, Android, storage and L3 UI tests;
   get owner device confirmation, then merge by agreed dependency order.

### Must-not-do list
- No copying beta's main branch wholesale onto LW-D or vice versa.
- No automatic merge into source main, release, LW-C or LW-D without owner review.
- No asserting that public beta includes a feature just because Codex reports it done.
- No private signing keys in GitHub; official signing locally per owner's policy.
- No duplicate pet identity/resource/economy state or silent save format migration.
- No copying in-progress untested claims into an owner-approved feature checklist.

At this writing the latest checked repo state is:
source Trialum \`main\` \`f81516ea0c394cb26323f436fba57cef4614e62f\`,
LW-C PR #47 remains draft at \`04457df48b9c012f8667504b935a7ca501d13f07\`,
LW-D PR #54 at \`b3a6850a0c65323152d76d28dd37b309083d57bf\`,
public \`trialum-beta\` main at \`08fe6ff5b946d5da7db545e5b38feb17f4bf6785\`.
These are **observed snapshots**, not permanent baselines: re-fetch them before any merge.
