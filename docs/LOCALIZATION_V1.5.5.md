# TRIALUM 1.5.5 — localization and appearance

## Shipped language choices

**17** selectable languages: Macedonian (mk), English (en), Spanish (es), French (fr), German (de), Italian (it), Portuguese (pt), Turkish (tr), Albanian (sq), Arabic (ar), Chinese (zh, Simplified), Japanese (ja), Korean (ko), Russian (ru), Hindi (hi), Indonesian (id), and Polish (pl).

Choose **Automatic (system language)** to detect browser/device locale via `navigator.languages` with regional fallback (`es-MX → es`); unsupported locales fall back to English. Choose a language manually to override this; the chosen mode is stored in the game state. `languagechange` is observed when automatic mode is active. Names, personally written messages and existing diary entries are **not machine-translated**.

**Translation coverage is honest:** English ships the original large reference catalog and added 1.5.5 terminology; the 15 additional languages each ship a reviewed *core UI* starter catalog (navigation, settings, theme, AI and tutorial controls). Older complex narrative and dynamic prose fall back to the English catalog. Some long tutorial prose remains English outside MK and EN until native-speaker review. Do not market these as full professional localizations or claim 100% translated content.

Arabic is an RTL language; right-to-left layout, canvas text overlays and glyph metrics require physical-device testing before claiming complete RTL support.

## Theme behavior

- Default system mode detects `prefers-color-scheme`.
- Manual **Light** and **Dark** overrides persist locally; **System** follows live OS changes.
- The theme remains usable without any Google account, model download, game world or network access.
- Light mode uses separate text/panel colors and accessible focus outlines. Complete accessibility audit (contrast, dynamic type and screen reader) remains a release gate.

## Testing

`node tests/version155.test.cjs` checks all 17 locale files, device language fallback, theme switching and onboarding behavior. Real Android language, system bars, font coverage (CJK, Devanagari, Arabic), text truncation, accessibility and player understanding require human testing.

## Owner-directed closeout patch (10 November 2026)

**Current gate: IN QA, not formally closed.** The owner confirmed that Light/Dark/System and complete English translation still needed work, despite the 1.5.5 code existing. In the review branch `fix/trialum-v155-theme-en-closeout-20261110`:
- Restored theme preference is applied after accepted JSON import; rejecting an import leaves the existing theme unchanged. New worlds preserve the current manual/System choice.
- The effective system theme is reapplied on WebView visibility regain, focus and `pageshow`; CSS covers the previously dark-only sticky header, bottom navigation, HUD, cards, welcome, media and social surfaces.
- English exact phrase translations now include all first-run tutorial steps plus active social, message, skill/playground prompts; the vocabulary catalog was extended for missing modern UI status phrases.
- Automated JSDOM tests exercise mode persistence, app foregrounding, backup restore/rejection and active menu translations. `TRIALUM_LOCALE_AUDIT=1` now asserts no remaining untranslated Cyrillic in the tested static English interface, **excluding actual user-authored content and native language names**.

**Still required before claiming full English or finished 1.5.5:** real English-speaking human review of all branches (not just fixture-exercised paths), dynamically generated errors/prompts, model and device dialogs, text overflow and truncation; physical phone QA for light/dark/system transitions and Samsung status/navigation bars, crash/rotation, contrast and accessibility. Automated passing tests establish only tested coverage; they do not certify all possible dynamic strings or visual contrast. The other 15 locale packs remain intentionally partial; the owner prioritizes English first.

LLM functional operation for all three tiers was **OWNER PASS** on 10 Nov 2026. Expanded visible emotions are deferred to Living World, not a 1.5.5 blocker. See [owner QA](OWNER_QA_STATUS_2026-11-10.md) and [closeout ledger](V1.5.5_V1.5.6_CLOSEOUT_2026-11-10.md).

## Permanent owner text-update rule (10 Nov 2026)

Every future UI/gameplay/code change introducing or changing visible text **MUST synchronize the English translation in the very same change**; record the corresponding `locales/en.json` entry or verify the current translation already matches, then update/regress the affected UI test. This includes dynamically composed text, notifications, native Android strings and accessibility labels. See the repository-wide [English sync policy](ENGLISH_TEXT_SYNC_POLICY.md) and pull-request checklist. A lightweight PR CI check catches newly introduced Macedonian text with no English file update, but manual QA still handles translations that static analysis cannot recognize.

The owner has **deferred the other 15 languages until milestone transitions after all planned Living World phases are completed**, rather than continuous incremental translation. Their starter packs are valid as partial packs only; this is not permission to claim full localization.

**155-03** learned skills accepted partially and richer emotions moved to LW. **155-07** existing local Backup/Restore owner-accepted; Google Play Games cloud setup deferred until Play developer account activation. These do not block current 155-04/155-05. See [owner decisions](OWNER_SCOPE_DECISIONS_2026-11-10.md).

## 155-04 visual evidence boundary

The new daylight palette preserves the existing Trialum typography, round cards, 5-action navigation, tiered HUD, turquoise/violet/gold accents, 2.5D Canvas scenes and gradient/layer language instead of replacing the game with plain white panels. The paired `tests/theme-preview.html?mode=dark|light` static fixture is captured by GitHub Actions into the `Trialum-155-Theme-Comparison` artifact. **This is a representative component preview, not proof of full in-game Android visual QA**. System mode and local backup theme persistence have JSDOM regression coverage; Samsung device visual/contrast inspection remains for owner acceptance.
