-- migrations/011_add_archive_fields_to_character_class.sql
-- Adds archive lifecycle columns to character_class.
-- Mirrors the pattern in 008_add_archive_fields.sql for taxonomy + stat entities.

ALTER TABLE character_class
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_reason TEXT;
