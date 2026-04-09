-- Create modifier_binding table for Phase 3: Modifier Bindings
-- Stores eligibility relationships between modifiers and categories/subcategories.
-- Each binding defines whether a modifier can appear on items within a target scope,
-- with optional overrides for spawn weight, tier range, and level requirements.

CREATE TABLE modifier_binding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modifier_id UUID NOT NULL REFERENCES modifier(id) ON DELETE CASCADE,

  -- Target: either a category OR a subcategory
  target_type VARCHAR(15) NOT NULL CHECK (target_type IN ('category','subcategory')),
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

  -- A modifier can only have one binding per target
  UNIQUE (modifier_id, target_type, target_id)
);

-- Performance: find all active included bindings for a given target
CREATE INDEX idx_bindings_target ON modifier_binding (target_type, target_id)
  WHERE is_included = TRUE AND is_active = TRUE;

-- Performance: find all bindings for a modifier
CREATE INDEX idx_bindings_modifier ON modifier_binding (modifier_id);
