# Trialum — application artifacts in the private Git repository

**Owner decision (2026-11-11):** From now on, keep current installable applications organized by platform in this private Git repository, so a normal `git pull origin main` brings them to the owner's desktop. GitHub Actions remains responsible for controlled builds, verification and safe owner-key signing; no APKs are compiled/signed manually on the owner's workstation.

- [Android](android/README.md) — **active**; current permanently signed APKs are tracked in three separate app folders after the automated signing workflow succeeds.
- [Windows](windows/README.md) — reserved for future Windows desktop builds.
- [iOS](ios/README.md) — reserved for future Apple/iOS builds after separate developer, signing and distribution decisions.

**Never commit private keys, .p12/.jks, Base64 signing secrets, passwords, mobile backups, auth credentials or unverified/debug-runner/unsigned APKs.** Committing the *signed* APKs themselves is intentional for private-owner Git sync. These are internal builds only, not public store releases. The workflow copies *only the most recent* three APKs to stable paths; previous binaries remain in Git history and cost repository space. Revisit Git LFS/Release storage as repository size grows.

**Automation:** A trusted source change that lands on `main` automatically runs full regression tests, packages three variants, signs them with their immutable owner-controlled certificate pins and verifies all three again in a separate job before replacing these paths. The job uses narrowly scoped repository `contents:write` only for the post-signing publish step; the earlier signing step retains read-only repository access. PRs cannot sign or publish APKs. An owner-only manual signing option is retained. The binary-only commit is tagged `[skip ci]`, and the workflow's push paths exclude `artifacts/**` to prevent a loop. A build against a stale source commit is never allowed to overwrite a newer `main` head.

**Repository permissions matter:** GitHub Actions must be permitted to push to `main`; if branch protection prevents `github-actions[bot]` writing there, the publish job will fail while the signed ZIP artifact is still available in the successful signing job. Do not relax security or branch-protection rules silently; adapt the publishing strategy with explicit approval.
