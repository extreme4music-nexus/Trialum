# TRIALUM LW-D — DNA Classic → 3D exact functionality audit and repair
Date: 2026-11-14 | Draft PR #68: https://github.com/extreme4music-nexus/Trialum/pull/68
Branch: `fix/lw-d-dna-classic-parity-20261114` | Based on current functional-flora L3.4-B branch. **NO merge into main or Codex-managed Release/FriendsDebug.**

## Why this was necessary
Owner physically found that 3D DNA had missing features despite the previous L3.2 graphical/partial-operation acceptance. This review supersedes **any assumption** that earlier DNA device PASS proved feature-by-feature parity. Exact ground-truth source reviewed:
- `js/expansion-ui.js`: `dna(s)` provides editable hue, eyes 1–5, jelly/crystal/leaf/cloud, real signature, laboratory level 6 and selected pet level 22, cost 25 molecules + 15 insight + 1 lab action; executes `E.editFictionalGenes`.
- `js/longplay-ui.js`: `dna(s)` adds the **entire advanced lineage catalog** by `E.longplayLineages.filter(id>=4)` and all `E.longplayFaunaList(s)` discoveries. Each target has its original description and every `E.longplayRequirements` criterion and a real `E.longplayTransform` action.
- `js/engine.js`, `js/progression.js`, `js/longplay.js`, `js/fauna-lab.js`: authoritative current-pet selection, genetics, lineage, exact resource costs, habitat source/biocapacity, personal ID/age/memory inheritance.

## Exact parity matrix

| Classic feature | Previously in LW-D DNA | Fixed in PR #68 | Source of truth |
| --- | --- | --- | --- |
| Current pet + switch between saved pets | One current pet, no 3D selector | Scrollable holographic list of **all** saved pets; actual `E.selectPet` and synchronized original habitat | `s.pets`, `E.selectPet` |
| Read genome, status and pet history | Only basic color/eyes/shape/signature | Full selected name/species, level, age, actions, habitat, generation chain, learned trainings and personal memory **count**; no private memory transcripts | Saved `p`, `E.evolutionProgress` |
| Change hue, 1–5 eyes, four shapes | Inputs + Android native selects | Hue slider and entirely in-HUD eyes/shape buttons; saved signature, restore draft, cost/level gates | `E.editFictionalGenes` |
| Consent to DNA operations | Android/system `confirm()` | Holographic Confirm/Cancel; a Cancel never sends a game action; pending latch prevents double clicks | Parent engine |
| All advanced lineage targets | Dropdown with only current target details | Every 7 base advanced lineages **plus all player-researched fauna** (up to original game limit), scrollable selected target list, no fixed 90-target truncation | `E.longplayLineages`, `E.longplayFaunaList(s)` |
| Per-target description and every unlock criterion | Incomplete | Full original description, source species, research, lab, stage, day, growth, biome, knowledge, requirement ✓ / 🔒 plus actual available-cost and capacity status | `E.longplayRequirements` |
| Original line cost | Not displayed | Fixed line target i costs `25+12*i` compounds, `12+7*i` insight and 1 action | `js/longplay.js` |
| Invented-fauan cost | Not displayed | Dynamic fauna cost 120 compounds, 80 insight and 1 action | `js/fauna-lab.js` |
| Actual habitat capacity and quality | Not checked in 3D ready state | Original target biome, quality ≥58% fixed or ≥68% dynamic, resource/capacity previews | `E.occupancy`, `E.loadOf`, original transform |
| Selected-pet identity safety | Only selected-pet implicit | Request includes exact selected pet ID; parent rejects stale/wrong pet before any mutation | `TrialumLWBridge.dnaOperation` |
| Inherited identity/memory | Original engine already owns | Never forked; transformation continues to call original `E.longplayTransform` and preserves pet ID, age and memory | Original saved world |
| Existing gameplay, AI/FCM and backups | Present from upstream | Preserved by non-mutating 3D visuals + same-origin source-checked parent bridge; no new save fields | Existing L3.4-B baseline |

**Scope clarification:** The Classic `research` tab separately studies genomics and discovers new fauna. This audit matches the actual Classic **DNA** tab plus its legitimate pet selection, not unrelated Research, Food or Pet-training menus. Those remain available in Classic until their own authorized 3D phases.

## Security and synchronization
- All world writes remain in the existing parent game: `E.editFictionalGenes(s,s.selectedPet,...)`, `E.longplayTransform(s,s.selectedPet,target)`, `E.selectPet(s,id)`. Same-origin AND exact child iframe source required.
- Hologram never creates a second DNA economy, mutates pet arrays, alters persistent save format, shares pet history, downloads models or runs new background timers.
- MK/EN labels for the new hologram and engine errors added **additively**; updated the historical accepted-English exact-key ledger (now 972 keys, no accepted key removed).
- Regression suite `tests/lw-d-dna-parity.test.cjs` covers classic-contract completeness, real resource charges, original source pet ID / age / memories, researched fauna, no native selectors/dialogs, cancellation/pending and original game-only mutations. All former DNA, food, flora, LW-C social/AI, FCM and Play Games guards still in QA CI.

## AUTOMATED QA EVIDENCE (SOURCE PASS, NOT OWNER PHONE PASS)
[GitHub Actions #43646385492](https://github.com/extreme4music-nexus/Trialum/actions/runs/43646385492), run **#99**, commit `3e1509a8bd0bae0a84341e897e2768a5147279dd`: **SUCCESS** for all LW-D source/engine tests, Android `:app:assembleSignqa`, exact compiled existing Firebase SignQA identity/HTTPS social parameters, reused pre-existing owner QA keystore Secrets, pinned SHA256 certificate and uploaded signed APK. Corresponding PR checks: English exact-key ledger, LW-D prototype and Social security **PASS**.

- **INSTALLABLE signed ZIP:** `Trialum-LW-D-DNA-PARITY-OWNER-SIGNED-SIGNQA-99` (artifact ID `14134057152`, ~6.46 MB). Extract signed APK from ZIP; use its `BUILD-INFO` and `SHA256SUMS`. Expires **2026-11-28**.
- **DO NOT INSTALL** `Trialum-LW-D-DNA-PARITY-SIGNQA-UNSIGNED-99`.
- The APK is ONLY existing `com.trialum.ziivaiskra.signqa`, signed with the current owner-pinned permanent QA certificate. **No** new Firebase App ID, local signing, Codex release APK, server migration or production Play deployment.
- Documentation-only commits after source SHA do not change the tested APK. PR remains Draft until owner hands-on verification.

## Owner device checklist (OWNER PASS PENDING)
Install as **in-place update** (never uninstall/clear app data). Open immersive 3D laboratory complex → DNA door, inspect:
1. Choose among 2+ original saved pets inside DNA, verify name/age/genome/lineage and selected habitat remain the same as Classic after switching.
2. Genome scanner shows actual pet/species, history/ID-safe status and actual genome signature.
3. Gene designer: hue, all 5 eye counts, all 4 forms, reset, lab 6/pet 22 locks and genuine 25/15/1 cost. Cancel = no change; Confirm = original unique genome change on the **selected** pet only.
4. Lineage: scroll through all original 7 advanced species and additionally researched fauna; compare each target's exact description, unlock checks, source, costs and target habitat/capacity with Classic. Wrong source or insufficient cost blocks transform; successful transformation keeps original pet ID, age and memory.
5. Verify no gray Android-native DNA selection/confirmation popup; hologram remains responsive in landscape and scroll/zoom; fall back to Classic DNA when needed.
6. Regression: leave/return corridor, food L3.3-B, flora L3.4-B, LW-C conversations and friends, FCM notifications, save/restore without data loss.

Only record **OWNER PASS** when owner explicitly confirms physical phone result. Then continue sequential roadmap, next unbuilt fifth 3D Research Laboratory as authorized.
