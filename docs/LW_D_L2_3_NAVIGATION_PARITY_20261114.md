# Trialum LW-D L2.3 — Navigation parity, real world metrics and laboratory extension paths

Owner video \`Screen_Recording_20261114_062042.mp4\` (66.9 s, 2340×1080) confirms frosted HUD hide/show, functional lab actions and visible biosphere placeholder. Owner approves this as an interim direction but emphasizes that it is **far from a fully developed 3D game**.

## This slice
- Lightweight top-left display of **real** day, XP, earned credits, molecules, biomass and insight, derived via existing TrialumLWBridge state. No new save schema.
- Nested **World Atlas** with existing classic routes for DNA, research, flora, habitats, pets, food, local/shared playground, friends, messages, Play Games, achievements, diary, notifications and settings. The classic renderer remains available until each replacement gets OWNER PASS.
- Laboratory complex groups basic 3D lab, DNA and flora production alongside research; **future rooms reserved visibly but NOT falsely implemented**. Physical 3D room implementation follows owner-directed laboratory-first milestones.
- PWA/Android optional scene assets added and covered by CI. Existing offline backup and signing untouched.
- Entire-game 3D conversion remains master scope.

## Next stages / acceptance
- Owner QA of layout and route correctness in landscape on Galaxy A55.
- L3 laboratory complex with separate real spaces for DNA, research, flora production; functional machines and experimental live transitions using the single existing engine.
- More detailed models/materials and camera-wall occlusion fix.
- Then biosphere -> pets+homes -> research expansion within labs -> flora -> physical food warehouse -> play/social and all other existing game modules, each with explicit owner QA.

## LW-C comparison boundary
LW-C remains in separate Codex session; as of this commit no owner-approved clean LW-C beta release in \`trialum-beta\` was verified. **No unreviewed LW-C changes merged.** When the actual beta build/revision is available, compare its exact SHA, changed files and behavior against LW-D, cherry-pick **only distinct owner-accepted improvements** after dependency and regression tests; never wholesale overwrite LW-D.
