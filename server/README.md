# TRIALUM Social Server — 1.5.6-A–D private beta

This project now contains **opt-in private authenticated friend pairing (B)** and **server-authoritative shared playgrounds, consent visits and WSS state notifications (D)**. All social/shared endpoints are disabled by default. It does **NOT** implement public messaging, push notifications, Google payment/billing, advertisements or production anti-abuse approval. Do not expose it as a public game service yet.

This is intentionally a private developer stage. No credentials, DDNS hostname, private NAS mount paths or personal data are stored here. PostgreSQL has no published host port. The foundation API uses a dedicated DB health-only role with no table access; future social endpoints require a separate least-privilege app role. HTTP is only bound to 127.0.0.1 on the Ubuntu host. No code modifies WireGuard, Webmin, router or NAS.

Quick start from server/: copy .env.example to .env; replace PG_PASSWORD with a unique random secret; run docker compose config; docker compose up -d --build; curl http://127.0.0.1:8787/healthz and /v1/meta.

Run contract tests with node --test tests/*.test.mjs (Node 22+). SQL init runs only for a **new empty database volume**; future migrations will require separate review and backup. Do not use docker compose down -v on the actual world data.

All design/quality gates: ../docs/V1.5.6_MASTER_PLAN.md, ../docs/V1.5.6_PRIVACY_AND_FAIR_PLAY.md and ../docs/V1.5.6_HOME_SERVER.md.

## 1.5.6-B social API (opt-in)
Social endpoints remain OFF by default. Existing PostgreSQL volumes do not automatically execute 003_social_role.sh. Apply the migration safely after a backup (see docs/V1.5.6_B_SERVER_MIGRATION.md). No public access approval yet.

## 1.5.6-D shared playground (strictly opt-in)
Set `TRIALUM_SHARED_ENABLED=false` by default. `TRIALUM_SHARED_ENABLED=true` requires `TRIALUM_SOCIAL_ENABLED=true`, a separately reviewed private HTTPS test address and the idempotent `004_shared_playgrounds.sh` migration after PostgreSQL backup. The code authorizes membership and friendship; only owner may spend the limited effort points earned by server-validated events. No personal pet XP/currency crosses the network. See [D protocol](../docs/V1.5.6_D_SHARED_PLAYGROUND.md) and [NAS-safe migration](../docs/V1.5.6_D_SERVER_MIGRATION.md). Docker host port is user-configurable; existing Ubuntu uses 8687 while API container continues at 8787.
