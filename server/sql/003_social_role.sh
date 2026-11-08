#!/bin/sh
# Postgres first initialization or manually after backup on existing volume.
if [ -z "$TRIALUM_APP_PASSWORD" ]; then
  echo "Social DB role not configured; friends API stays disabled"
else
psql -X -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -v role_password="$TRIALUM_APP_PASSWORD" <<'SQL'
CREATE TABLE IF NOT EXISTS friend_blocks (
  blocker_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(blocker_id,blocked_id),
  CHECK(blocker_id<>blocked_id)
);
SELECT format('CREATE ROLE trialum_app LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT', :'role_password')
  WHERE NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='trialum_app')
\gexec
ALTER ROLE trialum_app WITH PASSWORD :'role_password';
GRANT CONNECT ON DATABASE trialum_social TO trialum_app;
GRANT USAGE ON SCHEMA public TO trialum_app;
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE installations,invitations,friendships,friend_blocks TO trialum_app;
SQL

fi
