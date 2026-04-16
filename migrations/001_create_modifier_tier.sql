-- Create modifier_tier table for Phase 2: Modifier Tiers
-- Each modifier has one or more tiers representing power levels (e.g., Fire Resistance I/II/III)

CREATE TABLE modifier_tier (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modifier_id UUID NOT NULL REFERENCES modifier(id) ON DELETE CASCADE,
  tier_index SMALLINT NOT NULL CHECK (tier_index >= 0),
  min_value NUMERIC(12, 4) NOT NULL,
  max_value NUMERIC(12, 4) NOT NULL,
  level_req SMALLINT NOT NULL DEFAULT 1 CHECK (level_req >= 1),
  spawn_weight INTEGER NOT NULL DEFAULT 100 CHECK (spawn_weight >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (modifier_id, tier_index),
  CHECK (max_value >= min_value)
);
