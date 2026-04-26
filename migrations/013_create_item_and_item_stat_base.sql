-- migrations/013_create_item_and_item_stat_base.sql
-- Creates the item template table and its stat-base junction.

-- Item: one row per rollable base item type.
-- Hierarchy FKs classify the item's slot via the game domain tree.
CREATE TABLE IF NOT EXISTS item (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_domain_id      UUID NOT NULL REFERENCES game_domain(id) ON DELETE RESTRICT,
  game_subdomain_id   UUID NOT NULL REFERENCES game_subdomain(id) ON DELETE RESTRICT,
  game_category_id    UUID NOT NULL REFERENCES game_category(id) ON DELETE RESTRICT,
  game_subcategory_id UUID NOT NULL REFERENCES game_subcategory(id) ON DELETE RESTRICT,
  machine_name        TEXT NOT NULL UNIQUE,
  name                TEXT NOT NULL,
  description         TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ItemStatBase: one row per (item, stat) pair — implicits and requirements.
CREATE TABLE IF NOT EXISTS item_stat_base (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id          UUID NOT NULL REFERENCES item(id) ON DELETE CASCADE,
  stat_id          UUID NOT NULL REFERENCES stat(id) ON DELETE RESTRICT,
  combination_type TEXT NOT NULL DEFAULT 'flat',
  base_value       INTEGER NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (item_id, stat_id)
);
