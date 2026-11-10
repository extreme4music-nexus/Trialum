#!/bin/sh
# LW-A: EXPLICIT one-time migration on existing volumes, after backup and tested restore.
# New volumes run scripts in lexical order (001 -> 006); NEVER delete an existing volume.
set -eu
if [ -z "${TRIALUM_APP_PASSWORD:-}" ]; then
  echo "LW-A 006 skipped: application role not configured"
  exit 0
fi
psql -X -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<'SQL'
BEGIN;
CREATE TABLE IF NOT EXISTS pet_presence (
 installation_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
 pet_ref varchar(64) NOT NULL CHECK (pet_ref ~ '^[A-Za-z0-9_-]{1,64}$'),
 session_id uuid NOT NULL UNIQUE,
 location_kind varchar(8) NOT NULL CHECK (location_kind IN ('shared','visit')),
 room_id uuid REFERENCES playgrounds(id) ON DELETE CASCADE,
 visit_id uuid REFERENCES visits(id) ON DELETE CASCADE,
 pet_public jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(pet_public)='object'),
 expires_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (installation_id,pet_ref),
 CHECK ((location_kind='shared' AND room_id IS NOT NULL AND visit_id IS NULL)
     OR (location_kind='visit' AND visit_id IS NOT NULL AND room_id IS NULL))
);
CREATE INDEX IF NOT EXISTS pet_presence_room_live
  ON pet_presence(room_id,expires_at) WHERE location_kind='shared';
CREATE INDEX IF NOT EXISTS pet_presence_expiry ON pet_presence(expires_at);
CREATE INDEX IF NOT EXISTS pet_presence_visit ON pet_presence(visit_id) WHERE visit_id IS NOT NULL;
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE pet_presence TO trialum_app;
COMMIT;
SQL
