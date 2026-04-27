-- seeds/99-cleanup.sql
-- Remove the temporary helper functions used during seeding.

DROP FUNCTION IF EXISTS seed_insert_modifier_raw(UUID, UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, TEXT);
-- Belt-and-suspenders: drop pre-rename variant in case of partial seed run
DROP FUNCTION IF EXISTS seed_insert_mod_raw(UUID, UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, TEXT);
