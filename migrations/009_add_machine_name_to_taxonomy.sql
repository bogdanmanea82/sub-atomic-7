-- migrations/009_add_machine_name_to_taxonomy.sql
-- Adds machine_name to the four taxonomy tables so every hierarchy entity
-- has a stable snake_case identifier for programmatic dispatch, matching
-- the pattern already used by stat and item_modifier.
--
-- Column order: added after id (before name) to match config field ordering.
-- Constraint: globally unique per table (not scoped to parent hierarchy).
--
-- Safe to re-run: IF NOT EXISTS guards prevent duplicate column errors.

ALTER TABLE game_domain
  ADD COLUMN IF NOT EXISTS machine_name VARCHAR(100) NOT NULL DEFAULT '';

ALTER TABLE game_domain
  DROP CONSTRAINT IF EXISTS game_domain_machine_name_unique;
ALTER TABLE game_domain
  ADD CONSTRAINT game_domain_machine_name_unique UNIQUE (machine_name);

-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE game_subdomain
  ADD COLUMN IF NOT EXISTS machine_name VARCHAR(100) NOT NULL DEFAULT '';

ALTER TABLE game_subdomain
  DROP CONSTRAINT IF EXISTS game_subdomain_machine_name_unique;
ALTER TABLE game_subdomain
  ADD CONSTRAINT game_subdomain_machine_name_unique UNIQUE (machine_name);

-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE game_category
  ADD COLUMN IF NOT EXISTS machine_name VARCHAR(100) NOT NULL DEFAULT '';

ALTER TABLE game_category
  DROP CONSTRAINT IF EXISTS game_category_machine_name_unique;
ALTER TABLE game_category
  ADD CONSTRAINT game_category_machine_name_unique UNIQUE (machine_name);

-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE game_subcategory
  ADD COLUMN IF NOT EXISTS machine_name VARCHAR(100) NOT NULL DEFAULT '';

ALTER TABLE game_subcategory
  DROP CONSTRAINT IF EXISTS game_subcategory_machine_name_unique;
ALTER TABLE game_subcategory
  ADD CONSTRAINT game_subcategory_machine_name_unique UNIQUE (machine_name);
