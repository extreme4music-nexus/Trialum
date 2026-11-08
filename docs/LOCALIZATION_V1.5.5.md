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
