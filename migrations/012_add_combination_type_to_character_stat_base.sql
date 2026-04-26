-- migrations/012_add_combination_type_to_character_stat_base.sql
-- Adds combination_type column to character_stat_base.
-- Default 'flat' preserves existing row semantics (all bases are direct additions).

ALTER TABLE character_stat_base
  ADD COLUMN IF NOT EXISTS combination_type TEXT NOT NULL DEFAULT 'flat';
