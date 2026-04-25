-- seeds/08-modifiers-belts.sql
-- 10 belt modifiers — bound to Belts category.
-- Representative subcategory: Strength.

DO $$
DECLARE
  v_dom    UUID;
  v_armour UUID;
  v_belts  UUID;
  v_belt_s UUID;
BEGIN
  SELECT id INTO v_dom    FROM game_domain    WHERE name = 'Items';
  SELECT id INTO v_armour FROM game_subdomain WHERE name = 'Armour';
  SELECT id INTO v_belts  FROM game_category  WHERE name = 'Belts' AND game_subdomain_id = v_armour;
  SELECT id INTO v_belt_s FROM game_subcategory WHERE name = 'Strength' AND game_category_id = v_belts;

  -- Life & regen
  PERFORM seed_insert_mod(v_dom, v_armour, v_belts, v_belt_s, 'belt_added_life',     'prefix', 'life_max',            'flat',      'scalar', 20, 150, 'Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_armour, v_belts, v_belt_s, 'belt_life_regen',     'suffix', 'life_regen',          'flat',      'scalar', 1,  20,  'Life Regeneration');
  PERFORM seed_insert_mod(v_dom, v_armour, v_belts, v_belt_s, 'belt_added_mana',     'suffix', 'mana_max',            'flat',      'scalar', 10, 80,  'Added Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_armour, v_belts, v_belt_s, 'belt_mana_regen',     'suffix', 'mana_regen',          'increased', 'scalar', 10, 80,  'Mana Regeneration');
  -- Defence
  PERFORM seed_insert_mod(v_dom, v_armour, v_belts, v_belt_s, 'belt_added_armour',   'prefix', 'armor_rating',        'flat',      'scalar', 15, 250, 'Armor Rating');
  PERFORM seed_insert_mod(v_dom, v_armour, v_belts, v_belt_s, 'belt_stun_threshold', 'suffix', 'stun_threshold',      'flat',      'scalar', 15, 200, 'Stun Threshold');
  -- Resistances
  PERFORM seed_insert_mod(v_dom, v_armour, v_belts, v_belt_s, 'belt_fire_res',       'suffix', 'fire_resistance',     'increased', 'scalar', 6,  35,  'Fire Resistance');
  PERFORM seed_insert_mod(v_dom, v_armour, v_belts, v_belt_s, 'belt_cold_res',       'suffix', 'cold_resistance',     'increased', 'scalar', 6,  35,  'Cold Resistance');
  -- Attributes
  PERFORM seed_insert_mod(v_dom, v_armour, v_belts, v_belt_s, 'belt_added_strength', 'suffix', 'strength',            'flat',      'scalar', 4,  22,  'Added Strength');
  PERFORM seed_insert_mod(v_dom, v_armour, v_belts, v_belt_s, 'belt_added_dex',      'suffix', 'dexterity',           'flat',      'scalar', 3,  18,  'Added Dexterity');
END;
$$;
