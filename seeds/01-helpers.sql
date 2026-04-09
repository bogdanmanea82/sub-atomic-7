-- seeds/01-helpers.sql
-- Temporary helper function for inserting a modifier + its single tier in one call.
-- Dropped by 99-cleanup.sql after seeding completes.

CREATE OR REPLACE FUNCTION seed_insert_mod(
  p_domain_id UUID,
  p_subdomain_id UUID,
  p_category_id UUID,
  p_subcategory_id UUID,
  p_code TEXT,
  p_affix_type TEXT,
  p_semantic_cat TEXT,
  p_value_type TEXT,
  p_calc_method TEXT,
  p_name TEXT
) RETURNS VOID AS $$
DECLARE
  v_mod_id UUID;
  v_min_val NUMERIC(12,4);
BEGIN
  INSERT INTO modifier (
    id, game_domain_id, game_subdomain_id, game_category_id, game_subcategory_id,
    code, affix_type, semantic_cat, value_type, calc_method,
    name, is_active, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), p_domain_id, p_subdomain_id, p_category_id, p_subcategory_id,
    p_code, p_affix_type, p_semantic_cat, p_value_type, p_calc_method,
    p_name, true, now(), now()
  ) RETURNING id INTO v_mod_id;

  v_min_val := round((1 + random() * 9)::numeric, 4);

  INSERT INTO modifier_tier (
    id, modifier_id, tier_index, min_value, max_value,
    level_req, spawn_weight, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_mod_id, 0, v_min_val,
    v_min_val + round((1 + random() * 4)::numeric, 4),
    1, 800, now(), now()
  );
END;
$$ LANGUAGE plpgsql;
