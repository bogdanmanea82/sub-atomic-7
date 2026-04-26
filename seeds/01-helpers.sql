-- seeds/01-helpers.sql
-- Helper function for inserting a bare item_modifier row.
-- Dropped by 99-cleanup.sql after seeding completes.
--
-- seed_insert_mod_raw: inserts modifier row only — NO tiers, NO binding.
-- Returns the modifier UUID so the caller inserts tiers and bindings manually.
-- Used by 15-modifiers-special.sql for all binding patterns (A–F).

CREATE OR REPLACE FUNCTION seed_insert_mod_raw(
  p_domain_id         UUID,
  p_subdomain_id      UUID,
  p_category_id       UUID,
  p_subcategory_id    UUID,
  p_machine_name      TEXT,
  p_affix_type        TEXT,
  p_stat_machine_name TEXT,
  p_combination_type  TEXT,
  p_roll_shape        TEXT,
  p_value_min         INTEGER,
  p_value_max         INTEGER,
  p_name              TEXT
) RETURNS UUID AS $$
DECLARE
  v_mod_id  UUID;
  v_stat_id UUID;
BEGIN
  SELECT id INTO v_stat_id FROM stat WHERE machine_name = p_stat_machine_name;

  INSERT INTO item_modifier (
    id, game_domain_id, game_subdomain_id, game_category_id, game_subcategory_id,
    machine_name, affix_type, target_stat_id, combination_type, roll_shape,
    value_min, value_max, modifier_group, display_template,
    name, is_active, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), p_domain_id, p_subdomain_id, p_category_id, p_subcategory_id,
    p_machine_name, p_affix_type, v_stat_id, p_combination_type, p_roll_shape,
    p_value_min, p_value_max, p_machine_name, p_name,
    p_name, true, now(), now()
  ) RETURNING id INTO v_mod_id;

  RETURN v_mod_id;
END;
$$ LANGUAGE plpgsql;
