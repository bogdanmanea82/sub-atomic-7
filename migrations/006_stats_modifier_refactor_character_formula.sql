-- migrations/006_stats_modifier_refactor_character_formula.sql
-- Introduces stat registry, refactors item_modifier field shape,
-- adds character + character_stat_base junction, adds formula entity.
--
-- Safe to re-run on a dev database: item_modifier data is cleared before
-- column changes and must be re-seeded via seed.sh afterwards.

-- ── 1. Create stat table ─────────────────────────────────────────────────────
-- Stat is the authoritative registry of every numeric dimension in the game.
-- All other entities that reference a numeric stat do so by FK into this table.

CREATE TABLE IF NOT EXISTS stat (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_name  VARCHAR(50)  NOT NULL UNIQUE,
  name          VARCHAR(200) NOT NULL,
  description   TEXT,
  data_type     VARCHAR(20)  NOT NULL,
  value_min     INTEGER      NOT NULL,
  value_max     INTEGER      NOT NULL,
  default_value INTEGER      NOT NULL,
  category      VARCHAR(20)  NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT stat_data_type_check CHECK (data_type IN ('raw', 'percentage', 'multiplier')),
  CONSTRAINT stat_category_check  CHECK (category  IN ('attribute', 'resource', 'offensive', 'defensive', 'utility'))
);

-- ── 2. Clear modifier data before altering schema ────────────────────────────
-- All child tables (tier, binding, history) cascade from item_modifier.

TRUNCATE TABLE item_modifier_tier    RESTART IDENTITY CASCADE;
TRUNCATE TABLE item_modifier_binding RESTART IDENTITY CASCADE;
TRUNCATE TABLE item_modifier_history RESTART IDENTITY CASCADE;
TRUNCATE TABLE item_modifier         RESTART IDENTITY CASCADE;

-- ── 3. Refactor item_modifier columns ────────────────────────────────────────
-- Remove the old classification trio; add the new mechanical fields.

ALTER TABLE item_modifier DROP CONSTRAINT IF EXISTS modifier_semantic_cat_check;
ALTER TABLE item_modifier DROP CONSTRAINT IF EXISTS modifier_value_type_check;
ALTER TABLE item_modifier DROP CONSTRAINT IF EXISTS modifier_calc_method_check;

ALTER TABLE item_modifier DROP COLUMN IF EXISTS semantic_cat;
ALTER TABLE item_modifier DROP COLUMN IF EXISTS value_type;
ALTER TABLE item_modifier DROP COLUMN IF EXISTS calc_method;

ALTER TABLE item_modifier
  ADD COLUMN target_stat_id   UUID         REFERENCES stat(id) ON DELETE RESTRICT,
  ADD COLUMN combination_type VARCHAR(15)  NOT NULL DEFAULT 'flat',
  ADD COLUMN roll_shape       VARCHAR(10)  NOT NULL DEFAULT 'scalar',
  ADD COLUMN value_min        INTEGER      NOT NULL DEFAULT 0,
  ADD COLUMN value_max        INTEGER      NOT NULL DEFAULT 0,
  ADD COLUMN modifier_group   VARCHAR(100) NOT NULL DEFAULT '',
  ADD COLUMN display_template TEXT         NOT NULL DEFAULT '';

ALTER TABLE item_modifier
  ADD CONSTRAINT modifier_combination_type_check CHECK (combination_type IN ('flat', 'increased', 'more')),
  ADD CONSTRAINT modifier_roll_shape_check        CHECK (roll_shape       IN ('scalar', 'range'));

-- Remove defaults — columns are populated entirely via seed data.
ALTER TABLE item_modifier
  ALTER COLUMN combination_type DROP DEFAULT,
  ALTER COLUMN roll_shape       DROP DEFAULT,
  ALTER COLUMN value_min        DROP DEFAULT,
  ALTER COLUMN value_max        DROP DEFAULT,
  ALTER COLUMN modifier_group   DROP DEFAULT,
  ALTER COLUMN display_template DROP DEFAULT;

-- ── 4. Create character table ─────────────────────────────────────────────────
-- Quoted because 'character' is a PostgreSQL reserved type keyword.

CREATE TABLE IF NOT EXISTS "character" (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_name VARCHAR(50)  NOT NULL UNIQUE,
  name         VARCHAR(200) NOT NULL,
  description  TEXT,
  is_active    BOOLEAN      NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ── 5. Create character_stat_base junction ────────────────────────────────────
-- One row per (character, stat) pair; stores the baseline value before modifiers.

CREATE TABLE IF NOT EXISTS character_stat_base (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID        NOT NULL REFERENCES "character"(id) ON DELETE CASCADE,
  stat_id      UUID        NOT NULL REFERENCES stat(id)        ON DELETE RESTRICT,
  base_value   INTEGER     NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (character_id, stat_id)
);

-- ── 6. Create formula table ───────────────────────────────────────────────────
-- expression references input stats by machine_name; evaluated by Layer 2.

CREATE TABLE IF NOT EXISTS formula (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(200) NOT NULL,
  output_stat_id UUID         NOT NULL REFERENCES stat(id) ON DELETE RESTRICT,
  expression     VARCHAR(500) NOT NULL,
  description    TEXT,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);
