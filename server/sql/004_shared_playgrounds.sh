#!/bin/sh
# 1.5.6-D: idempotent for BOTH empty volume and existing volume.
# On existing volumes execute manually AFTER a verified local backup.
set -eu
if [ -z "$TRIALUM_APP_PASSWORD" ]; then
  echo "1.5.6-D migration skipped: application role not configured"
  exit 0
fi
psql -X -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<'SQL'
BEGIN;
CREATE TABLE IF NOT EXISTS shared_playground_state (
  playground_id uuid PRIMARY KEY REFERENCES playgrounds(id) ON DELETE CASCADE,
  points integer NOT NULL DEFAULT 0 CHECK (points BETWEEN 0 AND 1000000),
  version bigint NOT NULL DEFAULT 1 CHECK (version>0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS playground_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playground_id uuid NOT NULL REFERENCES playgrounds(id) ON DELETE CASCADE,
  inviter_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  invitee_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  status varchar(10) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','declined','expired')),
  expires_at timestamptz NOT NULL DEFAULT (now()+interval '24 hours'),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (inviter_id<>invitee_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS pg_invites_pending_unique
 ON playground_invites(playground_id,invitee_id) WHERE status='pending';
CREATE INDEX IF NOT EXISTS pg_invites_receiver ON playground_invites(invitee_id,expires_at);
CREATE TABLE IF NOT EXISTS playground_activities (
  event_key uuid PRIMARY KEY,
  playground_id uuid NOT NULL REFERENCES playgrounds(id) ON DELETE CASCADE,
  installation_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  toy_id varchar(20) NOT NULL CHECK (toy_id IN ('sandbox','seesaw','slide','pool','obstacle','trampoline')),
  pet_public jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(pet_public)='object'),
  earned_points smallint NOT NULL DEFAULT 1 CHECK (earned_points=1),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  occurred_day date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date
);
CREATE INDEX IF NOT EXISTS pg_activity_daily ON playground_activities(playground_id,installation_id,occurred_day);
CREATE TABLE IF NOT EXISTS playground_spends (
  event_key uuid PRIMARY KEY,
  playground_id uuid NOT NULL REFERENCES playgrounds(id) ON DELETE CASCADE,
  installation_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  kind varchar(12) NOT NULL CHECK(kind IN ('expand','toy')),
  toy_id varchar(20),
  amount smallint NOT NULL CHECK(amount BETWEEN 1 AND 100),
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS playground_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  playground_id uuid NOT NULL REFERENCES playgrounds(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES installations(id) ON DELETE SET NULL,
  kind varchar(22) NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(payload)='object'),
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pg_events_room_id ON playground_events(playground_id,id DESC);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS event_key uuid;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS pet_public jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS accepted_at timestamptz;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS ended_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS visits_event_key_unique ON visits(event_key) WHERE event_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS visits_participants_recent ON visits(receiver_id,created_at DESC);
-- Legacy FKs would otherwise prevent room deletion and member withdrawal.
-- Consent withdrawal must always work, even after prior contributions or visits.
ALTER TABLE contributions DROP CONSTRAINT IF EXISTS contributions_playground_id_installation_id_fkey;
ALTER TABLE contributions ADD CONSTRAINT contributions_playground_id_installation_id_fkey
 FOREIGN KEY (playground_id,installation_id)
 REFERENCES playground_members(playground_id,installation_id) ON DELETE CASCADE;
ALTER TABLE visits DROP CONSTRAINT IF EXISTS visits_playground_id_fkey;
ALTER TABLE visits ADD CONSTRAINT visits_playground_id_fkey
 FOREIGN KEY (playground_id) REFERENCES playgrounds(id) ON DELETE CASCADE;
INSERT INTO shared_playground_state(playground_id)
 SELECT id FROM playgrounds ON CONFLICT DO NOTHING;
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE
 playgrounds, playground_members, playground_toys, contributions, visits,
 shared_playground_state, playground_invites, playground_activities,
 playground_spends, playground_events TO trialum_app;
GRANT USAGE,SELECT ON SEQUENCE playground_events_id_seq TO trialum_app;
COMMIT;
SQL
