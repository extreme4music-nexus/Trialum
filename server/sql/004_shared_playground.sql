-- 1.5.6-D additive, explicitly applied AFTER database backup; do not modify 001_schema.sql.
-- Default deny: no auto membership based on friendship; server decides all permissions.
CREATE TABLE IF NOT EXISTS playground_invites (
  token_hash bytea PRIMARY KEY CHECK(octet_length(token_hash)=32),
  playground_id uuid NOT NULL REFERENCES playgrounds(id) ON DELETE CASCADE,
  inviter_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK(inviter_id<>recipient_id)
);
CREATE INDEX IF NOT EXISTS pg_invites_recipient ON playground_invites(recipient_id,expires_at);
CREATE TABLE IF NOT EXISTS playground_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  playground_id uuid NOT NULL REFERENCES playgrounds(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  event_key uuid NOT NULL,
  kind varchar(24) NOT NULL CHECK(kind IN ('action','toy_unlock','space_expand','member_join','member_leave','visit_start','visit_end')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(payload)='object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(playground_id,event_key)
);
CREATE INDEX IF NOT EXISTS pg_events_recent ON playground_events(playground_id,id DESC);
CREATE TABLE IF NOT EXISTS playground_wallets (
  playground_id uuid PRIMARY KEY REFERENCES playgrounds(id) ON DELETE CASCADE,
  earned_balance integer NOT NULL DEFAULT 0 CHECK(earned_balance BETWEEN 0 AND 1000000)
);
CREATE TABLE IF NOT EXISTS playground_contribution_limits (
  playground_id uuid NOT NULL REFERENCES playgrounds(id) ON DELETE CASCADE,
  installation_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  day date NOT NULL DEFAULT CURRENT_DATE,
  amount integer NOT NULL DEFAULT 0 CHECK(amount BETWEEN 0 AND 30),
  PRIMARY KEY(playground_id,installation_id,day)
);
CREATE UNIQUE INDEX IF NOT EXISTS pg_one_owner ON playground_members(playground_id) WHERE role='owner';
-- No migration-time grant to health-only role. Run this as DB admin after 003_social_role.sh:
GRANT SELECT,INSERT,UPDATE,DELETE ON playgrounds,playground_members,playground_toys,playground_invites,playground_events,playground_wallets,playground_contribution_limits,visits,contributions TO trialum_app;
GRANT USAGE,SELECT ON SEQUENCE playground_events_id_seq TO trialum_app;
