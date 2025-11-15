-- Grant permissions to postgres role for PostgREST access
-- Run this after creating tables to allow PostgREST to read the schema

GRANT USAGE ON SCHEMA public TO postgres;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO postgres;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;
