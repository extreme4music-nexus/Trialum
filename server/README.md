# TRIALUM Social Server — 1.5.6-A Foundation

This repository stage contains a **locally runnable isolated health/metadata API** and a versioned initial SQL schema for the future social engine. It does **NOT** implement pairing, real-time gameplay, messaging, registration, virtual currency transactions, push notifications or billing. Do not expose it as a public game service yet.

This is intentionally a private developer stage. No credentials, DDNS hostname, private NAS mount paths or personal data are stored here. PostgreSQL has no published host port. HTTP is only bound to 127.0.0.1 on the Ubuntu host. No code modifies WireGuard, Webmin, router or NAS.

Quick start from server/: copy .env.example to .env; replace PG_PASSWORD with a unique random secret; run docker compose config; docker compose up -d --build; curl http://127.0.0.1:8787/healthz and /v1/meta.

Run contract tests with node --test tests/*.test.mjs (Node 22+). SQL init runs only for a **new empty database volume**; future migrations will require separate review and backup. Do not use docker compose down -v on the actual world data.

All design/quality gates: ../docs/V1.5.6_MASTER_PLAN.md, ../docs/V1.5.6_PRIVACY_AND_FAIR_PLAY.md and ../docs/V1.5.6_HOME_SERVER.md.
