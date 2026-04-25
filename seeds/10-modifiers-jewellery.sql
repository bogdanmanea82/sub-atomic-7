-- seeds/10-modifiers-jewellery.sql
-- 28 jewellery modifiers: 14 Rings + 14 Amulets.
-- Each bound at category level (Rings / Amulets).
-- Rings has one subcategory "Rings"; Amulets has one subcategory "Amulets".

DO $$
DECLARE
  v_dom     UUID;
  v_jewel   UUID;
  v_rings   UUID;
  v_ring_s  UUID;
  v_amulets UUID;
  v_amul_s  UUID;
BEGIN
  SELECT id INTO v_dom     FROM game_domain    WHERE name = 'Items';
  SELECT id INTO v_jewel   FROM game_subdomain WHERE name = 'Jewellery';
  SELECT id INTO v_rings   FROM game_category  WHERE name = 'Rings'   AND game_subdomain_id = v_jewel;
  SELECT id INTO v_ring_s  FROM game_subcategory WHERE name = 'Rings'   AND game_category_id = v_rings;
  SELECT id INTO v_amulets FROM game_category  WHERE name = 'Amulets' AND game_subdomain_id = v_jewel;
  SELECT id INTO v_amul_s  FROM game_subcategory WHERE name = 'Amulets' AND game_category_id = v_amulets;

  -- ══════════════════════════════════════════════════════════════════════════
  -- RINGS (14) — bound to Rings category
  -- ══════════════════════════════════════════════════════════════════════════

  -- Life & mana
  PERFORM seed_insert_mod(v_dom, v_jewel, v_rings, v_ring_s, 'ring_added_life',        'prefix', 'life_max',               'flat',      'scalar', 15, 100, 'Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_rings, v_ring_s, 'ring_added_mana',        'prefix', 'mana_max',               'flat',      'scalar', 10, 80,  'Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_rings, v_ring_s, 'ring_life_regen',        'suffix', 'life_regen',             'flat',      'scalar', 1,  12,  'Life Regeneration');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_rings, v_ring_s, 'ring_mana_regen',        'suffix', 'mana_regen',             'increased', 'scalar', 10, 60,  'Mana Regeneration');
  -- Resistances
  PERFORM seed_insert_mod(v_dom, v_jewel, v_rings, v_ring_s, 'ring_fire_res',          'suffix', 'fire_resistance',        'increased', 'scalar', 6,  40,  'Fire Resistance');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_rings, v_ring_s, 'ring_cold_res',          'suffix', 'cold_resistance',        'increased', 'scalar', 6,  40,  'Cold Resistance');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_rings, v_ring_s, 'ring_lightning_res',     'suffix', 'lightning_resistance',   'increased', 'scalar', 6,  40,  'Lightning Resistance');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_rings, v_ring_s, 'ring_chaos_res',         'suffix', 'chaos_resistance',       'increased', 'scalar', 6,  40,  'Chaos Resistance');
  -- Offensive
  PERFORM seed_insert_mod(v_dom, v_jewel, v_rings, v_ring_s, 'ring_inc_attack_speed',  'suffix', 'attack_speed',           'increased', 'scalar', 3,  18,  'Increased Attack Speed');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_rings, v_ring_s, 'ring_added_accuracy',    'suffix', 'accuracy_rating',        'flat',      'scalar', 10, 120, 'Added Accuracy Rating');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_rings, v_ring_s, 'ring_inc_crit_chance',   'suffix', 'critical_strike_chance', 'increased', 'scalar', 3,  30,  'Increased Critical Strike Chance');
  -- Attributes
  PERFORM seed_insert_mod(v_dom, v_jewel, v_rings, v_ring_s, 'ring_added_strength',    'suffix', 'strength',               'flat',      'scalar', 3,  20,  'Added Strength');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_rings, v_ring_s, 'ring_added_dex',         'suffix', 'dexterity',              'flat',      'scalar', 3,  20,  'Added Dexterity');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_rings, v_ring_s, 'ring_added_int',         'suffix', 'intelligence',           'flat',      'scalar', 3,  20,  'Added Intelligence');

  -- ══════════════════════════════════════════════════════════════════════════
  -- AMULETS (14) — bound to Amulets category
  -- ══════════════════════════════════════════════════════════════════════════

  -- Attributes (prefix — primary amulet identity)
  PERFORM seed_insert_mod(v_dom, v_jewel, v_amulets, v_amul_s, 'amul_added_strength',    'prefix', 'strength',               'flat',      'scalar', 5,  30,  'Added Strength');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_amulets, v_amul_s, 'amul_added_dex',         'prefix', 'dexterity',              'flat',      'scalar', 5,  30,  'Added Dexterity');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_amulets, v_amul_s, 'amul_added_int',         'prefix', 'intelligence',           'flat',      'scalar', 5,  30,  'Added Intelligence');
  -- Life & mana
  PERFORM seed_insert_mod(v_dom, v_jewel, v_amulets, v_amul_s, 'amul_added_life',        'suffix', 'life_max',               'flat',      'scalar', 15, 120, 'Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_amulets, v_amul_s, 'amul_added_mana',        'suffix', 'mana_max',               'flat',      'scalar', 10, 90,  'Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_amulets, v_amul_s, 'amul_life_regen',        'suffix', 'life_regen',             'flat',      'scalar', 1,  15,  'Life Regeneration');
  -- Resistances
  PERFORM seed_insert_mod(v_dom, v_jewel, v_amulets, v_amul_s, 'amul_fire_res',          'suffix', 'fire_resistance',        'increased', 'scalar', 6,  40,  'Fire Resistance');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_amulets, v_amul_s, 'amul_cold_res',          'suffix', 'cold_resistance',        'increased', 'scalar', 6,  40,  'Cold Resistance');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_amulets, v_amul_s, 'amul_lightning_res',     'suffix', 'lightning_resistance',   'increased', 'scalar', 6,  40,  'Lightning Resistance');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_amulets, v_amul_s, 'amul_chaos_res',         'suffix', 'chaos_resistance',       'increased', 'scalar', 6,  40,  'Chaos Resistance');
  -- Offensive
  PERFORM seed_insert_mod(v_dom, v_jewel, v_amulets, v_amul_s, 'amul_inc_cast_speed',    'suffix', 'cast_speed',             'increased', 'scalar', 5,  28,  'Increased Cast Speed');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_amulets, v_amul_s, 'amul_inc_crit_chance',   'suffix', 'critical_strike_chance', 'increased', 'scalar', 5,  45,  'Increased Critical Strike Chance');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_amulets, v_amul_s, 'amul_added_crit_multi',  'suffix', 'critical_strike_multiplier', 'flat', 'scalar', 10, 80,  'Added Critical Strike Multiplier');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_amulets, v_amul_s, 'amul_inc_attack_speed',  'suffix', 'attack_speed',           'increased', 'scalar', 5,  25,  'Increased Attack Speed');
END;
$$;
