# TRIALUM LW-A — Existing Ubuntu Server Migration 006 (SAFE, OPERATOR-LED)

**Status:** SOURCE TESTED IN DISPOSABLE CI — NOT YET DEPLOYED OR VERIFIED ON THE OWNER'S UBUNTU SERVER.  
**Applies to:** existing `/opt/trialum/server`, current PostgreSQL volume and Caddy HTTPS proxy.  
**Source branch:** `feature/trialum-lw-a-pet-presence-20261109`.  
**Requirement:** local beta gameplay works; server-authoritative shared presence/visits and live two-device QA are still pending.

> The server is real user data. No `docker compose down -v`, `docker system prune --volumes`, database reinitialization, router changes, token sharing, or `.env` overwrite. Do not expose the API beyond the already authorized HTTPS endpoint. Execute each gate **manually** and only after reviewing its result. All commands assume Debian shell and the exact two Compose files confirmed by the operator. Do not automate the full sequence blindly.

## Gate 0 — Preflight, before any writes

```bash
cd /opt/trialum/server
pwd
ls -l compose.yaml compose.push.yaml sql/005_messages_push.sh
sudo docker compose -f compose.yaml -f compose.push.yaml ps
sudo docker compose -f compose.yaml -f compose.push.yaml exec -T trialum-db \
  psql -X -U trialum -d trialum_social -Atc \
  "SELECT coalesce(to_regclass('public.pet_presence')::text,'MISSING');"
git rev-parse --show-toplevel 2>/dev/null || echo "NO_GIT_CHECKOUT_IN_THIS_DIRECTORY"
```

**Stop and inspect results** before source syncing. Record current public `/v1/meta` and installed APK build. If files or services differ, do not guess/overwrite.

## Gate 1 — Stage new source without touching existing credentials

Obtain the complete `feature/trialum-lw-a-pet-presence-20261109` branch from the private GitHub repository using an authenticated GitHub checkout/archive. Stage outside production, and review diff. Do not `git reset --hard` or overwrite local modifications.

Transfer **only the reviewed server files** to the existing server directory:

- `server/src/index.mjs`
- `server/src/social.mjs`
- `server/src/shared.mjs`
- `server/src/presence.mjs` (new)
- `server/sql/006_pet_presence.sh` (new)
- `server/compose.yaml` (adds default-OFF presence flag and read-only SQL mount)

**Do not replace** `/opt/trialum/server/.env`, `compose.push.yaml`, existing `001–005` scripts, Caddy secrets/certificates, database files, or credentials. Keep source as an independent stage before applying. `sudo sh -n sql/006_pet_presence.sh` and `sudo docker compose -f compose.yaml -f compose.push.yaml config --quiet` should pass after staging.

**Important:** a running PostgreSQL container will *not automatically acquire the new bind mount* just because Compose YAML changed. Apply migration with **stdin** as in Gate 3; do not recreate/reinitialize the database container merely to mount SQL 006.

## Gate 2 — Verified backup and an actual isolated restore

```bash
cd /opt/trialum/server
sudo install -d -m 700 /root/trialum-db-backups
sudo sh -c 'umask 077; docker compose -f compose.yaml -f compose.push.yaml exec -T trialum-db pg_dump -U trialum -d trialum_social -Fc > /root/trialum-db-backups/trialum-before-lw-a-006.dump'
sudo test -s /root/trialum-db-backups/trialum-before-lw-a-006.dump
sudo docker run --rm --network none -v /root/trialum-db-backups:/backup:ro postgres:17-alpine \
  pg_restore --list /backup/trialum-before-lw-a-006.dump >/dev/null
echo 'BACKUP FORMAT PASS'
```

**A verified archive list is NOT a restore rehearsal.** For a real restore, use a disposable PostgreSQL 17 container with no network, no published ports and no shared production data volume:

```bash
sudo docker run -d --rm --network none --name trialum-lwa-restore-qa \
  -e POSTGRES_HOST_AUTH_METHOD=trust \
  -e POSTGRES_USER=postgres -e POSTGRES_DB=postgres \
  postgres:17-alpine
for i in $(seq 1 30); do
  sudo docker exec trialum-lwa-restore-qa pg_isready -U postgres >/dev/null 2>&1 && break
  sleep 1
done
sudo docker cp /root/trialum-db-backups/trialum-before-lw-a-006.dump trialum-lwa-restore-qa:/tmp/trialum.dump
sudo docker exec trialum-lwa-restore-qa \
  pg_restore -U postgres -d postgres --no-owner --no-acl --exit-on-error /tmp/trialum.dump
sudo docker exec trialum-lwa-restore-qa \
  psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres -c 'CREATE ROLE trialum_app'
sudo docker cp sql/006_pet_presence.sh trialum-lwa-restore-qa:/tmp/006_pet_presence.sh
sudo docker exec -e TRIALUM_APP_PASSWORD=restore-test-only \
  -e POSTGRES_USER=postgres -e POSTGRES_DB=postgres \
  trialum-lwa-restore-qa sh /tmp/006_pet_presence.sh
sudo docker exec -e TRIALUM_APP_PASSWORD=restore-test-only \
  -e POSTGRES_USER=postgres -e POSTGRES_DB=postgres \
  trialum-lwa-restore-qa sh /tmp/006_pet_presence.sh
sudo docker exec trialum-lwa-restore-qa psql -X -U postgres -d postgres -Atc \
  "SELECT to_regclass('public.pet_presence') IS NOT NULL;"
# Expected: t
sudo docker rm -f trialum-lwa-restore-qa
```

`POSTGRES_HOST_AUTH_METHOD=trust` above is **restricted to the networkless, temporary, isolated QA container only**. It must never be set in the real Compose project. The restore rehearsal contains a copy of user data: do not network-enable or keep this QA container.

**If any restore/second-migration step fails: STOP. Do not proceed to the live database.**

## Gate 3 — Existing PostgreSQL migration; no volume replacement

After source staging, verified backup, successful separate restore and explicit operator approval:

```bash
cd /opt/trialum/server
head -n 1 sql/006_pet_presence.sh | cat -v
sh -n sql/006_pet_presence.sh
sudo docker compose -f compose.yaml -f compose.push.yaml exec -T trialum-db \
  sh -s < sql/006_pet_presence.sh
sudo docker compose -f compose.yaml -f compose.push.yaml exec -T trialum-db \
  psql -X -U trialum -d trialum_social -Atc \
  "SELECT to_regclass('public.pet_presence'),count(*) FROM pet_presence GROUP BY 1;"
```

Expected migration ends with `COMMIT`. The query should show `pet_presence|0` on first use. This is additive, not a database reset.

## Gate 4 — Enable feature and rebuild ONLY API (after compatible APK backup)

**Important:** Once `TRIALUM_PRESENCE_ENABLED=true`, the server refuses group play from old beta APKs without a current session ID. Obtain a matching-signature LW-A Android APK from a green CI run and **verify JSON world backup before updating**. If Android reports an install signature mismatch, do **not uninstall** without confirmed restore and an isolated test device.

Edit the existing private `.env` *in place* to add exactly one line:
```text
TRIALUM_PRESENCE_ENABLED=true
```
Do not post the file or any credentials in chat. Keep `TRIALUM_FREE_TEXT_ENABLED=false` for the child-facing private beta until the separate moderation review; Firebase configuration is independent of LW-A.

```bash
cd /opt/trialum/server
sudo docker compose -f compose.yaml -f compose.push.yaml config --quiet
sudo docker compose -f compose.yaml -f compose.push.yaml up -d --no-deps --build --force-recreate trialum-api
curl -fsS https://dedopero.servegame.com/v1/meta
sudo docker compose -f compose.yaml -f compose.push.yaml ps
```

Expect `"presenceEnabled":true`; existing messages/social flags must retain their previous intended values. A failed restart **must be handled by leaving the database intact** and reverting only `TRIALUM_PRESENCE_ENABLED=false` plus rebuilding/recreating the API with the old known-good source if necessary.

## Gate 5 — Android and independent acceptance (NO automatic sign-off)

- On a compatible LW-A test APK, send pet to private shared room. It disappears from home and appears in live `occupants`. Returning removes it from the room.
- Attempt repeated/competing shared admission on second authorized test device. No duplicate pet, no second reward, no side-channel leakage.
- Test room member removal, friendship block/revoke, visit accept/return/expiry, Wi-Fi/mobile-data drop, app background/reopen and 2-hour lease expiry.
- Confirm local offline world remains independent of the social API and no XP/credits/skill loss occurred.
- Record response codes, screenshots with NO tokens/names/secret metadata, and a rollback rehearsal.
- Independent US English tester signs off separately; do not merge to `main` or start LW-B until owner accepts LW-A.

## Compatibility and security notes

- Local solo mode works with no server and no Google OAuth.
- New server presence stores only installation ID, opaque pet ID, sanitized cosmetic snapshot, room/visit IDs, randomized UUID session and bounded expiry. No private game save or XP is sent.
- Active room lease is renewed while the shared scene is open; stale/expired presence is reconciled from authenticated server state on next successful refresh.
- SQL 006 adds a table/indices and privilege grant; it does not change existing table columns.
- Current public release is still BLOCKED by the preexisting 1.5.6-F security, privacy and independent QA gates.

## CI evidence and exact source

Latest source and associated workflow results should be recorded **from the final commit after all fixes**, never from an earlier green run. See [LW-A contract](LW_A_PRESENCE_CONTRACT.md), [root roadmap](../PROJECT_ROADMAP.md) and the draft LW-A pull request.
