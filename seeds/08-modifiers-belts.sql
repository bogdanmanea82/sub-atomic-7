-- seeds/08-modifiers-belts.sql
-- 39 belt modifiers (13 per attribute × 3 attributes) + 1 tier each.

DO $$
DECLARE
  v_dom UUID;
  v_sub UUID;
  v_cat UUID;
  v_str UUID;
  v_dex UUID;
  v_int UUID;
BEGIN
  SELECT id INTO v_dom FROM game_domain WHERE name = 'Items';
  SELECT id INTO v_sub FROM game_subdomain WHERE name = 'Armour';
  SELECT id INTO v_cat FROM game_category WHERE name = 'Belts' AND game_subdomain_id = v_sub;
  SELECT id INTO v_str FROM game_subcategory WHERE name = 'Strength' AND game_category_id = v_cat;
  SELECT id INTO v_dex FROM game_subcategory WHERE name = 'Dexterity' AND game_category_id = v_cat;
  SELECT id INTO v_int FROM game_subcategory WHERE name = 'Intelligence' AND game_category_id = v_cat;

  -- ════════════════════════════════════════════════════════════════════════════
  -- BELTS — STRENGTH (13 mods: 6 core + 7 specific)
  -- ════════════════════════════════════════════════════════════════════════════
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'flat_max_life',        'suffix', 'defensive', 'flat',      'additive',       'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'flat_fire_res',        'suffix', 'defensive', 'flat',      'additive',       'Added Fire Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'flat_cold_res',        'suffix', 'defensive', 'flat',      'additive',       'Added Cold Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'flat_lightning_res',   'suffix', 'defensive', 'flat',      'additive',       'Added Lightning Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'flat_chaos_res',       'suffix', 'defensive', 'flat',      'additive',       'Added Chaos Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'flat_all_ele_res',     'suffix', 'defensive', 'flat',      'additive',       'Added All Elemental Resistances');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'flat_strength',        'suffix', 'defensive', 'flat',      'additive',       'Added Strength');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'flat_armour',          'prefix', 'defensive', 'flat',      'additive',       'Added Armour');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'flat_max_mana',        'suffix', 'resource',  'flat',      'additive',       'Added Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'flat_life_regen',      'suffix', 'resource',  'flat',      'additive',       'Life Regeneration per Second');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'inc_max_life',         'prefix', 'defensive', 'increased', 'multiplicative', 'Increased Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'inc_flask_duration',   'suffix', 'utility',   'increased', 'additive',       'Increased Flask Duration');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_str, 'inc_stun_recovery',    'suffix', 'utility',   'increased', 'additive',       'Increased Stun Recovery');

  -- ════════════════════════════════════════════════════════════════════════════
  -- BELTS — DEXTERITY (13 mods: 6 core + 7 specific)
  -- ════════════════════════════════════════════════════════════════════════════
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'flat_max_life',        'suffix', 'defensive', 'flat',      'additive',       'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'flat_fire_res',        'suffix', 'defensive', 'flat',      'additive',       'Added Fire Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'flat_cold_res',        'suffix', 'defensive', 'flat',      'additive',       'Added Cold Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'flat_lightning_res',   'suffix', 'defensive', 'flat',      'additive',       'Added Lightning Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'flat_chaos_res',       'suffix', 'defensive', 'flat',      'additive',       'Added Chaos Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'flat_all_ele_res',     'suffix', 'defensive', 'flat',      'additive',       'Added All Elemental Resistances');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'flat_dexterity',       'suffix', 'defensive', 'flat',      'additive',       'Added Dexterity');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'flat_evasion',         'prefix', 'defensive', 'flat',      'additive',       'Added Evasion Rating');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'flat_max_mana',        'suffix', 'resource',  'flat',      'additive',       'Added Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'flat_life_regen',      'suffix', 'resource',  'flat',      'additive',       'Life Regeneration per Second');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'inc_max_life',         'prefix', 'defensive', 'increased', 'multiplicative', 'Increased Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'inc_flask_duration',   'suffix', 'utility',   'increased', 'additive',       'Increased Flask Duration');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_dex, 'inc_movement_speed',   'suffix', 'utility',   'increased', 'additive',       'Increased Movement Speed');

  -- ════════════════════════════════════════════════════════════════════════════
  -- BELTS — INTELLIGENCE (13 mods: 6 core + 7 specific)
  -- ════════════════════════════════════════════════════════════════════════════
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'flat_max_life',        'suffix', 'defensive', 'flat',      'additive',       'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'flat_fire_res',        'suffix', 'defensive', 'flat',      'additive',       'Added Fire Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'flat_cold_res',        'suffix', 'defensive', 'flat',      'additive',       'Added Cold Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'flat_lightning_res',   'suffix', 'defensive', 'flat',      'additive',       'Added Lightning Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'flat_chaos_res',       'suffix', 'defensive', 'flat',      'additive',       'Added Chaos Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'flat_all_ele_res',     'suffix', 'defensive', 'flat',      'additive',       'Added All Elemental Resistances');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'flat_intelligence',    'suffix', 'defensive', 'flat',      'additive',       'Added Intelligence');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'flat_energy_shield',   'prefix', 'defensive', 'flat',      'additive',       'Added Energy Shield');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'flat_max_mana',        'suffix', 'resource',  'flat',      'additive',       'Added Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'flat_life_regen',      'suffix', 'resource',  'flat',      'additive',       'Life Regeneration per Second');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'inc_max_life',         'prefix', 'defensive', 'increased', 'multiplicative', 'Increased Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'inc_flask_duration',   'suffix', 'utility',   'increased', 'additive',       'Increased Flask Duration');
  PERFORM seed_insert_mod(v_dom, v_sub, v_cat, v_int, 'inc_mana_regen',       'suffix', 'resource',  'increased', 'additive',       'Increased Mana Regeneration');

END $$;
