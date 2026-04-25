-- seeds/10-modifiers-jewellery.sql
-- 14 shared jewellery modifiers — bound to the Jewellery category (Path A).
-- Rings and Amulets are now subcategories; one shared pool covers both.
-- Representative subcategory: Ring (satisfies NOT NULL FK; binding targets category).

DO $$
DECLARE
  v_dom    UUID;
  v_jewel  UUID;
  v_jewcat UUID;
  v_ring_s UUID;
BEGIN
  SELECT id INTO v_dom    FROM game_domain    WHERE name = 'Items';
  SELECT id INTO v_jewel  FROM game_subdomain WHERE name = 'Jewellery';
  SELECT id INTO v_jewcat FROM game_category  WHERE name = 'Jewellery' AND game_subdomain_id = v_jewel;
  SELECT id INTO v_ring_s FROM game_subcategory WHERE name = 'Ring' AND game_category_id = v_jewcat;

  -- ══════════════════════════════════════════════════════════════════════════
  -- JEWELLERY POOL (14) — shared by Ring and Amulet via category-level binding
  -- ══════════════════════════════════════════════════════════════════════════

  -- Life & mana
  PERFORM seed_insert_mod(v_dom, v_jewel, v_jewcat, v_ring_s, 'jewel_added_life',       'prefix', 'life_max',                   'flat',      'scalar', 15, 120, 'Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_jewcat, v_ring_s, 'jewel_added_mana',       'prefix', 'mana_max',                   'flat',      'scalar', 10, 90,  'Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_jewcat, v_ring_s, 'jewel_life_regen',       'suffix', 'life_regen',                 'flat',      'scalar', 1,  15,  'Life Regeneration');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_jewcat, v_ring_s, 'jewel_mana_regen',       'suffix', 'mana_regen',                 'increased', 'scalar', 10, 60,  'Mana Regeneration');

  -- Resistances
  PERFORM seed_insert_mod(v_dom, v_jewel, v_jewcat, v_ring_s, 'jewel_fire_res',         'suffix', 'fire_resistance',            'increased', 'scalar', 6,  40,  'Fire Resistance');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_jewcat, v_ring_s, 'jewel_cold_res',         'suffix', 'cold_resistance',            'increased', 'scalar', 6,  40,  'Cold Resistance');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_jewcat, v_ring_s, 'jewel_lightning_res',    'suffix', 'lightning_resistance',       'increased', 'scalar', 6,  40,  'Lightning Resistance');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_jewcat, v_ring_s, 'jewel_chaos_res',        'suffix', 'chaos_resistance',           'increased', 'scalar', 6,  40,  'Chaos Resistance');

  -- Offensive
  PERFORM seed_insert_mod(v_dom, v_jewel, v_jewcat, v_ring_s, 'jewel_inc_attack_speed', 'suffix', 'attack_speed',               'increased', 'scalar', 3,  20,  'Increased Attack Speed');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_jewcat, v_ring_s, 'jewel_inc_cast_speed',   'suffix', 'cast_speed',                 'increased', 'scalar', 3,  20,  'Increased Cast Speed');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_jewcat, v_ring_s, 'jewel_added_accuracy',   'suffix', 'accuracy_rating',            'flat',      'scalar', 10, 120, 'Added Accuracy Rating');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_jewcat, v_ring_s, 'jewel_inc_crit_chance',  'suffix', 'critical_strike_chance',     'increased', 'scalar', 3,  40,  'Increased Critical Strike Chance');
  PERFORM seed_insert_mod(v_dom, v_jewel, v_jewcat, v_ring_s, 'jewel_added_crit_multi', 'suffix', 'critical_strike_multiplier', 'flat',      'scalar', 10, 80,  'Added Critical Strike Multiplier');

  -- Attributes
  PERFORM seed_insert_mod(v_dom, v_jewel, v_jewcat, v_ring_s, 'jewel_added_strength',   'suffix', 'strength',                   'flat',      'scalar', 3,  25,  'Added Strength');
END;
$$;
