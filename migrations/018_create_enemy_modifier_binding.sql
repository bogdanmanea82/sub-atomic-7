-- migrations/018_create_enemy_modifier_binding.sql
-- Creates the enemy_modifier_binding table — the enemy-domain sibling of item_modifier_binding.
-- Both tables reference the universal modifier table via modifier_id.
-- Unlike item_modifier_binding, this table has no affix_type column (enemies have no prefix/suffix slots).
-- target_id is polymorphic (no FK) pointing to game_category or game_subcategory in the Enemies hierarchy.

CREATE TABLE enemy_modifier_binding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modifier_id UUID NOT NULL REFERENCES modifier(id) ON DELETE CASCADE,

  -- Target: either an Enemies category OR an Enemies subcategory
  target_type VARCHAR(15) NOT NULL CHECK (target_type IN ('category', 'subcategory')),
  target_id UUID NOT NULL,

  -- Inclusion: true = eligible, false = explicitly excluded
  is_included BOOLEAN NOT NULL DEFAULT TRUE,

  -- Weight override: NULL = use global tier spawn_weight, 0 = included but never rolls
  weight_override INTEGER CHECK (weight_override IS NULL OR weight_override >= 0),

  -- Tier range eligible in this context (NULL = all tiers)
  min_tier_index SMALLINT,
  max_tier_index SMALLINT,

  -- Level requirement override for this context (NULL = use tier's level_req)
  level_req_override SMALLINT,

  -- Audit
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- A modifier can only have one binding per enemy target
  UNIQUE (modifier_id, target_type, target_id)
);

-- Performance: find all active included bindings for a given enemy target
CREATE INDEX idx_enemy_modifier_binding_target
  ON enemy_modifier_binding (target_type, target_id)
  WHERE is_included = TRUE AND is_active = TRUE;

-- Performance: find all enemy bindings for a modifier
CREATE INDEX idx_enemy_modifier_binding_modifier
  ON enemy_modifier_binding (modifier_id);
