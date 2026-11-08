-- TRIALUM Social Server 1.5.6-A — dormant schema. Future API endpoints MUST verify credentials and authorize every operation.
-- Not yet used by foundation health/meta service. No raw IP, email, phone, location, device advertising ID or analytics tables.
CREATE TABLE installations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname varchar(32) NOT NULL CHECK (length(trim(nickname)) BETWEEN 1 AND 32),
  credential_hash bytea NOT NULL UNIQUE CHECK (octet_length(credential_hash)=32),
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);
CREATE TABLE invitations (
  token_hash bytea PRIMARY KEY CHECK (octet_length(token_hash)=32),
  inviter_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at>created_at)
);
CREATE INDEX invitations_expiry ON invitations(expires_at);
CREATE TABLE friendships (
  player_a uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  player_b uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  blocked_at timestamptz,
  PRIMARY KEY(player_a,player_b),
  CHECK (player_a<player_b)
);
CREATE TABLE playgrounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(48) NOT NULL,
  tier smallint NOT NULL DEFAULT 1 CHECK (tier BETWEEN 1 AND 20),
  created_at timestamptz NOT NULL DEFAULT now(),
  retired_at timestamptz
);
CREATE TABLE playground_members (
  playground_id uuid NOT NULL REFERENCES playgrounds(id) ON DELETE CASCADE,
  installation_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  role varchar(10) NOT NULL CHECK (role IN ('owner','member')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(playground_id,installation_id)
);
CREATE TABLE playground_toys (
  playground_id uuid NOT NULL REFERENCES playgrounds(id) ON DELETE CASCADE,
  toy_id varchar(20) NOT NULL CHECK(toy_id IN ('sandbox','seesaw','slide','pool','obstacle','trampoline')),
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(playground_id,toy_id)
);
CREATE TABLE contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playground_id uuid NOT NULL,
  installation_id uuid NOT NULL,
  event_key uuid NOT NULL UNIQUE,
  resource_kind varchar(20) NOT NULL CHECK(resource_kind IN ('tokens','resources','effort')),
  amount integer NOT NULL CHECK(amount BETWEEN 1 AND 100000),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(playground_id,installation_id) REFERENCES playground_members(playground_id,installation_id)
);
CREATE TABLE visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  pet_ref varchar(64) NOT NULL,
  destination varchar(12) NOT NULL CHECK(destination IN ('habitat','playground')),
  playground_id uuid REFERENCES playgrounds(id) ON DELETE SET NULL,
  status varchar(12) NOT NULL CHECK(status IN ('pending','accepted','declined','returned','expired')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK(sender_id<>receiver_id),
  CHECK(destination<>'playground' OR playground_id IS NOT NULL)
);
CREATE INDEX visits_pending_expiry ON visits(expires_at) WHERE status IN ('pending','accepted');
CREATE TABLE short_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  body varchar(120) NOT NULL CHECK (length(trim(body)) BETWEEN 1 AND 120),
  expires_at timestamptz NOT NULL,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK(sender_id<>receiver_id)
);
CREATE INDEX short_messages_expiry ON short_messages(expires_at);
CREATE TABLE push_registrations (
  installation_id uuid NOT NULL REFERENCES installations(id) ON DELETE CASCADE,
  token_ciphertext bytea NOT NULL,
  consented_at timestamptz NOT NULL,
  rotated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(installation_id)
);
-- Future requirements before enabling mutation API: least-privilege app DB role, migrations, deletion/export,
-- invite expiry sweeper, encrypted push token/key management, abuse-rate limit, transactional contribution checks,
-- credential proof, replay and concurrency tests. This schema is NOT a production approval.
