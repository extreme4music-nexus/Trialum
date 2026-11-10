# Trialum backup/restore hotfix — 10 Nov 2026

## Critical incident
Original Android world export through ACTION_CREATE_DOCUMENT could select an existing filename, truncate it, and still report success without checking its contents. A 0-byte JSON file cannot itself be recovered. Older APKs are still unsafe for same-name exports.

## Protective changes in this source branch
- Modern Android (API 29+): every export **inserts a new MediaStore Downloads/Trialum file** with timestamp and UUID, never overwriting a previous JSON file. Files remain pending until SHA-256 and byte-count read-back passes. On failure only that newly inserted row can be removed.
- Older Android 26–28: user chooses a **folder**, not a file to overwrite. A fresh DocumentsContract document is created and verified.
- Every export first writes an atomic private backup to `noBackupFilesDir/trialum-world-rescue-v2`: temp write, file descriptor sync, read-back hash, rename. Last 16 rolling copies and 4 pinned pre-restore/reset copies are retained. Rescue UI can list/restore backups with required confirmation.
- During normal local autosave, a private rescue is captured at most once per 2 minutes. Before restore or new-game deletion, a pinned rescue is mandatory; failure blocks the destructive action. Web-browser downloads use distinct names but still require user verification.
- No Android save success is reported merely because a system picker was shown. Saved file path is shown only after the read-back check.

## Important limits
The private vault is local to each independently installed Android package. It is erased by **uninstall or clear app data**, not restored by Google Play Games, and intentionally excluded from system cloud backup. A verified external copy in Downloads/Trialum (and on a PC/NAS) is still essential. Do not uninstall the original app because its social credential uses Android Keystore.

## Mandatory real-device QA before acceptance
1. In same game/day, export twice and inspect Downloads/Trialum; two distinct nonzero, valid JSON files must exist, with original intact.
2. Open rescue list and verify correct day/pet counts; create a fresh test world and verify pinned rescue before reset/restore.
3. Use a separate QA package to test restore, not the irreplaceable original app.
4. Confirm permission/storage failure is reported honestly and old files remain untouched.
5. Treat success in GitHub CI as source/build PASS, not full physical restore acceptance.
