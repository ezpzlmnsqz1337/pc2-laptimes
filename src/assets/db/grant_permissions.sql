-- Least-privilege PostgREST roles.
--
-- Run as the postgres superuser AFTER create_tables.sql, after the API database
-- password has been generated (see deployment/setup-api-auth.sh):
--
--   psql -v ON_ERROR_STOP=1 -U postgres -d pc2-laptimes -f grant_permissions.sql
--
-- PostgREST connects as laptimes_authenticator (LOGIN NOINHERIT) and switches
-- role per request:
--   * laptimes_anon - SELECT on the leaderboard tables only, used when no JWT
--                     is sent (public read API)
--   * laptimes_api  - SELECT/INSERT/UPDATE/DELETE, used when a valid JWT with
--                     {"role":"laptimes_api"} is sent (application writes)
--
-- Never reuse an existing superuser for these names; the ALTER ROLE statements
-- below enforce non-superuser NOLOGIN/NOINHERIT attributes.
--
-- The postgres superuser must never be used by PostgREST. The authenticator
-- password is set out of band so no credential is stored in this file.
--
-- Re-run this file after adding tables or views: grants apply to existing
-- objects only, so new objects stay denied until then.

BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'laptimes_authenticator') THEN
        CREATE ROLE laptimes_authenticator LOGIN NOINHERIT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'laptimes_anon') THEN
        CREATE ROLE laptimes_anon NOLOGIN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'laptimes_api') THEN
        CREATE ROLE laptimes_api NOLOGIN;
    END IF;
END;
$$;

ALTER ROLE laptimes_authenticator LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
ALTER ROLE laptimes_anon NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
ALTER ROLE laptimes_api NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;

GRANT USAGE ON SCHEMA public TO laptimes_anon, laptimes_api;

-- No PUBLIC privileges on app schema objects; access is only through the
-- roles below. RPC stays closed because the app uses table endpoints only.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;

-- Public reads are limited to the leaderboard tables; anything else stays
-- anonymous-denied until this file grants it explicitly.
GRANT SELECT ON cars, drivers, tracks, times TO laptimes_anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO laptimes_api;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO laptimes_api;

-- New tables stay denied to both roles until this file is re-run, so a future
-- non-leaderboard table is not published by accident.

GRANT laptimes_anon, laptimes_api TO laptimes_authenticator;

COMMIT;
