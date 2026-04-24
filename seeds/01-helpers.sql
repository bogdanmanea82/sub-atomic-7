-- seeds/01-helpers.sql
-- Helper for inserting an item_modifier + its single tier in one call.
-- Dropped by 99-cleanup.sql after seeding completes.
--
-- Stat proxy notes (where modifier targets a concept not in the 23-stat registry):
--   energy_shield mods → life_max    (both are HP pools)
--   projectile_speed   → accuracy_rating (ranged offensive)
--   area_of_effect     → attack_range    (spatial reach)
--   flask_duration     → life_regen      (recovery mechanic)
--   life/mana_leech    → life_regen / mana_regen (closest recovery stat)
--   flat_all_ele_res   → fire_resistance (representative element)
--   cannot_be_frozen   → stun_threshold  (status immunity proxy)

CREATE OR REPLACE FUNCTION seed_insert_mod(
  p_domain_id        UUID,
  p_subdomain_id     UUID,
  p_category_id      UUID,
  p_subcategory_id   UUID,
  p_code             TEXT,
  p_affix_type       TEXT,
  p_stat_machine_name TEXT,
  p_combination_type TEXT,
  p_roll_shape       TEXT,
  p_value_min        INTEGER,
  p_value_max        INTEGER,
  p_name             TEXT
) RETURNS VOID AS $$
DECLARE
  v_mod_id  UUID;
  v_stat_id UUID;
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

  INSERT INTO item_modifier_tier (
    id, modifier_id, tier_index, min_value, max_value,
    level_req, spawn_weight, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_mod_id, 0, p_value_min, p_value_max,
    1, 800, now(), now()
  );
END;
$$ LANGUAGE plpgsql;
