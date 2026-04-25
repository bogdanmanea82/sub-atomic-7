-- seeds/01-helpers.sql
-- Two helper functions for inserting an item_modifier + 4 progressive tiers + binding.
-- Dropped by 99-cleanup.sql after seeding completes.
--
-- Tier derivation: given overall value_min (M) and value_max (X), step = (X-M)/4.
--   Tier 0 (level_req  1, weight 1000): [M,           LEAST(M+step, X)]
--   Tier 1 (level_req 20, weight  600): [LEAST(M+step, X),   LEAST(M+step*2, X)]
--   Tier 2 (level_req 40, weight  300): [LEAST(M+step*2, X), LEAST(M+step*3, X)]
--   Tier 3 (level_req 60, weight  100): [LEAST(M+step*3, X), X]
-- All boundaries are clamped to X so min <= max always holds for small ranges.
--
-- seed_insert_mod:     binding target_type = 'category'    (shared pool for all subcategories)
-- seed_insert_mod_sub: binding target_type = 'subcategory' (specialised pool for one subcategory)

CREATE OR REPLACE FUNCTION seed_insert_mod(
  p_domain_id         UUID,
  p_subdomain_id      UUID,
  p_category_id       UUID,
  p_subcategory_id    UUID,
  p_code              TEXT,
  p_affix_type        TEXT,
  p_stat_machine_name TEXT,
  p_combination_type  TEXT,
  p_roll_shape        TEXT,
  p_value_min         INTEGER,
  p_value_max         INTEGER,
  p_name              TEXT
) RETURNS VOID AS $$
DECLARE
  v_mod_id  UUID;
  v_stat_id UUID;
  v_step    INTEGER;
BEGIN
  SELECT id INTO v_stat_id FROM stat WHERE machine_name = p_stat_machine_name;

  INSERT INTO item_modifier (
    id, game_domain_id, game_subdomain_id, game_category_id, game_subcategory_id,
    code, affix_type, target_stat_id, combination_type, roll_shape,
    value_min, value_max, modifier_group, display_template,
    name, is_active, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), p_domain_id, p_subdomain_id, p_category_id, p_subcategory_id,
    p_code, p_affix_type, v_stat_id, p_combination_type, p_roll_shape,
    p_value_min, p_value_max, p_code, p_name,
    p_name, true, now(), now()
  ) RETURNING id INTO v_mod_id;

  v_step := GREATEST(1, (p_value_max - p_value_min) / 4);

  INSERT INTO item_modifier_tier
    (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at)
  VALUES
    (gen_random_uuid(), v_mod_id, 0, p_value_min,                                        LEAST(p_value_min + v_step,    p_value_max),  1, 1000, now(), now()),
    (gen_random_uuid(), v_mod_id, 1, LEAST(p_value_min + v_step,    p_value_max),         LEAST(p_value_min + v_step*2,  p_value_max), 20,  600, now(), now()),
    (gen_random_uuid(), v_mod_id, 2, LEAST(p_value_min + v_step*2,  p_value_max),         LEAST(p_value_min + v_step*3,  p_value_max), 40,  300, now(), now()),
    (gen_random_uuid(), v_mod_id, 3, LEAST(p_value_min + v_step*3,  p_value_max),         p_value_max,                                60,  100, now(), now());

  -- Category-level binding: one modifier entry covers all subcategories under the category.
  INSERT INTO item_modifier_binding
    (id, modifier_id, target_type, target_id, is_active, is_included, created_at, updated_at)
  VALUES
    (gen_random_uuid(), v_mod_id, 'category', p_category_id, true, true, now(), now());
END;
$$ LANGUAGE plpgsql;

-- Subcategory-level variant: binds only to p_subcategory_id.
-- Used for specialised mods (Wand, Dagger, Bow, Staff, Shield, Quiver, Focus).
CREATE OR REPLACE FUNCTION seed_insert_mod_sub(
  p_domain_id         UUID,
  p_subdomain_id      UUID,
  p_category_id       UUID,
  p_subcategory_id    UUID,
  p_code              TEXT,
  p_affix_type        TEXT,
  p_stat_machine_name TEXT,
  p_combination_type  TEXT,
  p_roll_shape        TEXT,
  p_value_min         INTEGER,
  p_value_max         INTEGER,
  p_name              TEXT
) RETURNS VOID AS $$
DECLARE
  v_mod_id  UUID;
  v_stat_id UUID;
  v_step    INTEGER;
BEGIN
  SELECT id INTO v_stat_id FROM stat WHERE machine_name = p_stat_machine_name;

  INSERT INTO item_modifier (
    id, game_domain_id, game_subdomain_id, game_category_id, game_subcategory_id,
    code, affix_type, target_stat_id, combination_type, roll_shape,
    value_min, value_max, modifier_group, display_template,
    name, is_active, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), p_domain_id, p_subdomain_id, p_category_id, p_subcategory_id,
    p_code, p_affix_type, v_stat_id, p_combination_type, p_roll_shape,
    p_value_min, p_value_max, p_code, p_name,
    p_name, true, now(), now()
  ) RETURNING id INTO v_mod_id;

  v_step := GREATEST(1, (p_value_max - p_value_min) / 4);

  INSERT INTO item_modifier_tier
    (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at)
  VALUES
    (gen_random_uuid(), v_mod_id, 0, p_value_min,                                        LEAST(p_value_min + v_step,    p_value_max),  1, 1000, now(), now()),
    (gen_random_uuid(), v_mod_id, 1, LEAST(p_value_min + v_step,    p_value_max),         LEAST(p_value_min + v_step*2,  p_value_max), 20,  600, now(), now()),
    (gen_random_uuid(), v_mod_id, 2, LEAST(p_value_min + v_step*2,  p_value_max),         LEAST(p_value_min + v_step*3,  p_value_max), 40,  300, now(), now()),
    (gen_random_uuid(), v_mod_id, 3, LEAST(p_value_min + v_step*3,  p_value_max),         p_value_max,                                60,  100, now(), now());

  -- Subcategory-level binding: only items of this exact subcategory can roll this modifier.
  INSERT INTO item_modifier_binding
    (id, modifier_id, target_type, target_id, is_active, is_included, created_at, updated_at)
  VALUES
    (gen_random_uuid(), v_mod_id, 'subcategory', p_subcategory_id, true, true, now(), now());
END;
$$ LANGUAGE plpgsql;
