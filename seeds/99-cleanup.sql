-- seeds/99-cleanup.sql
-- Remove the temporary helper function used during seeding.

DROP FUNCTION IF EXISTS seed_insert_mod;
