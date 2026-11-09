#!/bin/sh
# 1.5.6-E: apply to EXISTING volume only after backup. No volume deletion.
set -eu
if [ -z "$TRIALUM_APP_PASSWORD" ]; then
  echo '1.5.6-E migration skipped: application role not configured'
else
psql -X -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<'SQL'
BEGIN;
-- New encrypted cards: do not grant access to unused legacy plaintext short_messages.
CREATE TABLE IF NOT EXISTS message_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  kind varchar(12) NOT NULL CHECK (kind IN ('preset','text')),
  preset_id varchar(28),
  text_ciphertext bytea,
  sent_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now()+interval '7 days'),
  sender_deleted_at timestamptz,
  receiver_deleted_at timestamptz,
  CHECK(sender_id<>receiver_id),
  CHECK((kind='preset' AND preset_id IS NOT NULL AND text_ciphertext IS NULL)
     OR (kind='text' AND text_ciphertext IS NOT NULL AND preset_id IS NULL)),
  CHECK(expires_at>sent_at)
);
CREATE INDEX IF NOT EXISTS message_receiver_recent ON message_cards(receiver_id,sent_at DESC);
CREATE INDEX IF NOT EXISTS message_sender_recent ON message_cards(sender_id,sent_at DESC);
CREATE INDEX IF NOT EXISTS message_expiry ON message_cards(expires_at);
CREATE TABLE IF NOT EXISTS message_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES message_cards(id) ON DELETE SET NULL,
  reporter_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  reported_sender_id uuid REFERENCES installations(id) ON DELETE SET NULL,
  reason varchar(24) NOT NULL CHECK(reason IN ('spam','bullying','unsafe','other')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(message_id,reporter_id)
);
CREATE INDEX IF NOT EXISTS message_reports_recent ON message_reports(created_at);
CREATE TABLE IF NOT EXISTS friend_mutes (
  owner_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  other_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  muted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(owner_id,other_id),
  CHECK(owner_id<>other_id)
);
CREATE TABLE IF NOT EXISTS event_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receiver_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES installations(id) ON DELETE CASCADE,
  kind varchar(28) NOT NULL CHECK(kind IN
    ('friend_joined','room_invitation','room_joined','visit_pending',
     'visit_arrived','visit_ended','shared_upgrade','room_closed')),
  reference_id uuid,
  room_id uuid REFERENCES playgrounds(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now()+interval '7 days')
);
CREATE INDEX IF NOT EXISTS event_cards_receiver_recent ON event_cards(receiver_id,created_at DESC);
CREATE INDEX IF NOT EXISTS event_cards_expiry ON event_cards(expires_at);
-- The push_registrations table existed dormant since migration 001.
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE
 message_cards,message_reports,friend_mutes,event_cards,push_registrations TO trialum_app;
COMMIT;
SQL
fi
