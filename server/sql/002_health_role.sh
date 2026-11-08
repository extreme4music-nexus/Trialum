#!/bin/sh
# Initialized only on a NEW PostgreSQL volume. Separate health role gets no table grants.
# Official Postgres entrypoint uses psql as the admin init user; secrets stay in .env.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -v role_password="$TRIALUM_HEALTH_PASSWORD" <<'SQL'
CREATE ROLE trialum_health LOGIN PASSWORD :'role_password' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
GRANT CONNECT ON DATABASE trialum_social TO trialum_health;
SQL
