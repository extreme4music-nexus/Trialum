# TRIALUM — owner scope acceptance and remaining closeout, 10 November 2026

**Authority:** explicit owner direction dated 2026-11-10. **Effective for prioritization immediately.** This is **owner feature-scope acceptance**, not independent technical certification of unobserved security/accessibility/physical-device checks. Existing historical acceptance tables are retained for traceability rather than retroactively marked tested.

## 1.5.5 — definitive owner decisions

| Task | Owner disposition | Current closeout rule |
|---|---|---|
| **155-03 — learned skills / richer emotion** | **PARTIAL accepted as-is** | Learned-skill display is sufficient for the present release; all remaining emotional expression, evolving personality/behavior and interactions move to Living World. Never list deferred LW work as a current 1.5.5 blocker. |
| **155-04 — appearance** | **ACTIVE: must finish now** | Light mode must be genuinely brighter while preserving Trialum's existing UI design language, cards, layers, shape system, accents and 2.5D world. Preserve System and Dark, persistence, backup restore and Android lifecycle. Run automated UI/theme tests and real-device visual review. |
| **155-05 — English** | **ACTIVE: only complete missing translations** | Preserve valid translations; fill genuine untranslated content and verify active flows. Every future code change that adds/edits any user-visible text **must update the corresponding English catalog in the same PR/commit** and rerun translation regressions. Do not defer sync. |
| **155-06 — other languages** | **DEFERRED to milestone boundaries AFTER Living World is complete** | Retain existing partial catalogs and language selection; do not spend development time continuously translating the other 15 packs now. Revisit only at defined milestones, initially after all agreed LW phases finish, and never label partial catalogs complete. |
| **155-07 — legacy JSON backup / restore** | **OWNER PASS / CLOSED AS CURRENT** | The old local Backup and Restore flow works end-to-end. Preserve regression tests. Real Google Play Games cloud functions/settings remain deferred until Google Play developer/console activation, and are not a blocker to the current local-backup task. |

Existing three local LLM tiers are **OWNER PASS** from earlier testing. Model rehydration after reinstall/restore (N17) stays separately planned; no forced download without appropriate user consent. No automatic closure of 155-04/155-05 until their concrete fixes are tested.

## 1.5.6 — definitive owner decisions

| Subphase | Owner acceptance | Notes |
|---|---|---|
| **156-B** | **OWNER ACCEPTED / CLOSED AS IMPLEMENTED** | Friends/consent/invitations achieved the currently intended feature scope; further upgrades belong to later game growth. |
| **156-C** | **OWNER ACCEPTED / CLOSED AS IMPLEMENTED** | Skills and solo playground accepted as built; later refinements are future scope. |
| **156-D** | **OWNER ACCEPTED / CLOSED AS IMPLEMENTED** | Shared playground and visits accepted as built. Owner separately confirmed safe pet return and reconnection. |
| **156-E** | **OWNER FUNCTIONAL PASS / ACCEPTED AS-IS** | Messages/notifications framework works in the owner's current environment; future enhancements are later scope. No separate claim that every Android FCM/background delivery matrix test was carried out. |
| **156-F** | **OWNER ACCEPTED AS-IS / FEATURE DEVELOPMENT CLOSED** | The owner explicitly considers current RC acceptance/audit-gate phase complete for **private functional scope**. This closes additional feature work under 1.5.6-F, **not** the external security, minor-safety, privacy, 2-device or Play Store publication assurance. Historical F-M01–F-M16 'not verified' entries remain truthful records; no fictitious security PASS. |

**Release separation:** Owner acceptance of B–F as currently implemented does **not** automatically permit public deployment. Keep public Play Store/closed beta, independent security/privacy/accessibility audit, verified 2-device/migration/backup and official Google developer/Play Games/FCM setup as **distinct pre-publication requirements** when publication is eventually authorized. Do not reopen B–F as feature-development blockers merely because those future release gates remain. Core data integrity or security vulnerabilities found later still require repair.

## Exact next actions

1. Finish 155-04 visual light-theme refinement + System/Dark compatibility; automated tests and device look/feel review.
2. Complete only missing 155-05 English UI strings; enforce bilingual text-change policy in docs, source tests and CI.
3. Mark 155-03/155-06/155-07 and 156-B–F dispositions consistently in root roadmap, owner QA and release docs.
4. Once concrete current closeout items are solved, the owner has reserved a **serious separate conversation about the future of Trialum**. Do not initiate Living World scope changes or schedule public release in advance of that discussion.

See [closeout ledger](V1.5.5_V1.5.6_CLOSEOUT_2026-11-10.md), [Living World](TRIALUM_LIVING_WORLD_ROADMAP_2026.md), and [historical F technical gates](V1.5.6_F_RELEASE_GATE.md).
