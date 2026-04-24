-- seeds/10-modifiers-jewellery.sql
-- 36 jewellery modifiers (18 Rings + 18 Amulets) + 1 tier each.

DO $$
DECLARE
  v_dom UUID;
  v_sub UUID;
  v_rings_cat UUID;
  v_amulets_cat UUID;
  v_rings UUID;
  v_amulets UUID;
BEGIN
  SELECT id INTO v_dom FROM game_domain WHERE name = 'Items';
  SELECT id INTO v_sub FROM game_subdomain WHERE name = 'Jewellery';
  SELECT id INTO v_rings_cat FROM game_category WHERE name = 'Rings' AND game_subdomain_id = v_sub;
  SELECT id INTO v_amulets_cat FROM game_category WHERE name = 'Amulets' AND game_subdomain_id = v_sub;
  SELECT id INTO v_rings FROM game_subcategory WHERE name = 'Rings' AND game_category_id = v_rings_cat;
  SELECT id INTO v_amulets FROM game_subcategory WHERE name = 'Amulets' AND game_category_id = v_amulets_cat;

  -- ════════════════════════════════════════════════════════════════════════════
  -- RINGS (18 mods)
  -- ════════════════════════════════════════════════════════════════════════════
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_max_life',       'suffix', 'life_max',                   'flat',      'scalar', 10,  80, 'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_fire_res',       'suffix', 'fire_resistance',            'flat',      'scalar', 5,   40, 'Added Fire Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_cold_res',       'suffix', 'cold_resistance',            'flat',      'scalar', 5,   40, 'Added Cold Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_lightning_res',  'suffix', 'lightning_resistance',       'flat',      'scalar', 5,   40, 'Added Lightning Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_chaos_res',      'suffix', 'chaos_resistance',           'flat',      'scalar', 5,   30, 'Added Chaos Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_all_ele_res',    'suffix', 'fire_resistance',            'flat',      'scalar', 5,   20, 'Added All Elemental Resistances');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_strength',       'suffix', 'strength',                   'flat',      'scalar', 5,   20, 'Added Strength');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_dexterity',      'suffix', 'dexterity',                  'flat',      'scalar', 5,   20, 'Added Dexterity');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_intelligence',   'suffix', 'intelligence',               'flat',      'scalar', 5,   20, 'Added Intelligence');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_max_mana',       'suffix', 'mana_max',                   'flat',      'scalar', 5,   40, 'Added Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_life_regen',     'suffix', 'life_regen',                 'flat',      'scalar', 5,   30, 'Life Regeneration per Second');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'inc_max_life',        'prefix', 'life_max',                   'increased', 'scalar', 10,  40, 'Increased Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_phys_damage',    'prefix', 'base_damage',                'flat',      'range',  1,   30, 'Added Physical Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_fire_damage',    'prefix', 'base_damage',                'flat',      'range',  1,   25, 'Added Fire Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'flat_accuracy',       'suffix', 'accuracy_rating',            'flat',      'scalar', 20, 100, 'Added Accuracy Rating');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'inc_attack_speed',    'suffix', 'attack_speed',               'increased', 'scalar', 5,   20, 'Increased Attack Speed');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'life_leech',          'suffix', 'life_regen',                 'flat',      'scalar', 1,   3,  'Life Leech');
  PERFORM seed_insert_mod(v_dom, v_sub, v_rings_cat, v_rings, 'inc_crit_chance',     'suffix', 'critical_strike_chance',     'increased', 'scalar', 10,  50, 'Increased Critical Strike Chance');

  -- ════════════════════════════════════════════════════════════════════════════
  -- AMULETS (18 mods)
  -- ════════════════════════════════════════════════════════════════════════════
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'flat_max_life',       'suffix', 'life_max',                   'flat',      'scalar', 10,  80, 'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'flat_fire_res',       'suffix', 'fire_resistance',            'flat',      'scalar', 5,   40, 'Added Fire Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'flat_cold_res',       'suffix', 'cold_resistance',            'flat',      'scalar', 5,   40, 'Added Cold Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'flat_lightning_res',  'suffix', 'lightning_resistance',       'flat',      'scalar', 5,   40, 'Added Lightning Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'flat_chaos_res',      'suffix', 'chaos_resistance',           'flat',      'scalar', 5,   30, 'Added Chaos Resistance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'flat_all_ele_res',    'suffix', 'fire_resistance',            'flat',      'scalar', 5,   20, 'Added All Elemental Resistances');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'flat_strength',       'suffix', 'strength',                   'flat',      'scalar', 5,   20, 'Added Strength');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'flat_dexterity',      'suffix', 'dexterity',                  'flat',      'scalar', 5,   20, 'Added Dexterity');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'flat_intelligence',   'suffix', 'intelligence',               'flat',      'scalar', 5,   20, 'Added Intelligence');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'flat_max_mana',       'suffix', 'mana_max',                   'flat',      'scalar', 5,   40, 'Added Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'flat_life_regen',     'suffix', 'life_regen',                 'flat',      'scalar', 5,   30, 'Life Regeneration per Second');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'inc_max_life',        'prefix', 'life_max',                   'increased', 'scalar', 10,  40, 'Increased Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'inc_spell_damage',    'prefix', 'base_damage',                'increased', 'scalar', 10,  50, 'Increased Spell Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'inc_cast_speed',      'suffix', 'cast_speed',                 'increased', 'scalar', 5,   20, 'Increased Cast Speed');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'inc_crit_chance',     'suffix', 'critical_strike_chance',     'increased', 'scalar', 10,  50, 'Increased Critical Strike Chance');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'flat_crit_multi',     'suffix', 'critical_strike_multiplier', 'flat',      'scalar', 10,  50, 'Added Critical Strike Multiplier');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'inc_ele_damage',      'prefix', 'base_damage',                'increased', 'scalar', 10,  40, 'Increased Elemental Damage');
  PERFORM seed_insert_mod(v_dom, v_sub, v_amulets_cat, v_amulets, 'inc_mana_regen',      'suffix', 'mana_regen',                 'increased', 'scalar', 10,  40, 'Increased Mana Regeneration');

END $$;
