# Trialum Signing QA

**Internal Android application**, independently installable, `com.trialum.ziivaiskra.signqa`, always signed with the permanent owner-held **QA key** (SHA-256 `681771d0416f60ee1f01272f1dcd13d8557a1337ddc0318255db0b8796f8296c`).

GitHub's protected build workflow deposits `Trialum-signqa.apk` and `provenance.txt` here **only after full checks pass**. Install as an upgrade to the existing Signing QA app without uninstall/clear-data. Do not confuse it with the historical `.lw16` or `.lwa` packages.

For solo Friends testing, run this alongside [Friends Debug](../Friends-Debug/README.md). Keep verified backups, and never upload private world data to GitHub.
