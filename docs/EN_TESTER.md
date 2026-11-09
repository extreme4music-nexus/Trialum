# TRIALUM 1.5.6-F RC1 — English-language tester build

**Scope:** US English translation/testing of the existing offline-first Android game, friends, local/shared playground and short-message UI. The game and its local world remain on the phone. The optional online friends and shared playground features need the HTTPS server to be reachable.

## For testers

1. Install the `-debug.apk` from this branch's GitHub Actions APK artifact. This is an unreleased **test** build, not a Play Store release.
2. Set the phone language to English (United States), or open Settings inside TRIALUM and choose **English**. The default **Automatic (system language)** uses Android's locale.
3. Test offline gameplay, evolution, pet care, the local playground, and backup/restore independently of the server.
4. Online friends and the shared playground require the private beta service to be online. For the owner-maintained beta instance, users should test only with permission.
5. Push notifications are currently disabled on the home test server. Messaging also requires the separate 005 database migration; an enabled flag is not proof that the database migration has completed.

### Localization exceptions

TRIALUM is a product name. Fictional species and player-authored names, written messages and saved journal entries remain unchanged. Existing saved worlds are never automatically rewritten as part of localization.

### Future small server updates (not implemented in this build)

Plan for a versioned, integrity-checked HTTPS JSON locale/config feed with local bundled fallback, size limits, opt-in/safe rollback, and no remote executable code. Keep Android/native/SDK updates in Play distribution. Do not enable remote runtime code evaluation or modify database schemas just to distribute translations.

**Current status:** translation coverage is significantly expanded for version 1.5.6-B/D/E. English localization still needs an on-device human review for text fit, grammatical consistency, dynamic gameplay messages, accessibility and non-DOM canvas labels.
