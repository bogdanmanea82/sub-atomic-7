-- seeds/04-modifiers-body-armour.sql
-- 16 body armour modifiers — bound to Body Armour category.
-- Representative subcategory: Strength.

DO $$
DECLARE
  v_dom    UUID;
  v_armour UUID;
  v_ba_cat UUID;
  v_ba_str UUID;
BEGIN
  SELECT id INTO v_dom    FROM game_domain    WHERE name = 'Items';
  SELECT id INTO v_armour FROM game_subdomain WHERE name = 'Armour';
  SELECT id INTO v_ba_cat FROM game_category  WHERE name = 'Body Armour' AND game_subdomain_id = v_armour;
  SELECT id INTO v_ba_str FROM game_subcategory WHERE name = 'Strength' AND game_category_id = v_ba_cat;

  -- Life & mana
  PERFORM seed_insert_mod(v_dom, v_armour, v_ba_cat, v_ba_str, 'body_added_life',        'prefix', 'life_max',            'flat',      'scalar', 30, 200, 'Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_armour, v_ba_cat, v_ba_str, 'body_inc_life',          'prefix', 'life_max',            'increased', 'scalar', 5,  30,  'Increased Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_armour, v_ba_cat, v_ba_str, 'body_added_mana',        'prefix', 'mana_max',            'flat',      'scalar', 15, 120, 'Maximum Mana');
  PERFORM seed_insert_mod(v_dom, v_armour, v_ba_cat, v_ba_str, 'body_life_regen',        'suffix', 'life_regen',          'flat',      'scalar', 2,  20,  'Life Regeneration');
  -- Defence
  PERFORM seed_insert_mod(v_dom, v_armour, v_ba_cat, v_ba_str, 'body_added_armour',      'prefix', 'armor_rating',        'flat',      'scalar', 20, 300, 'Armor Rating');
  PERFORM seed_insert_mod(v_dom, v_armour, v_ba_cat, v_ba_str, 'body_added_evasion',     'prefix', 'evasion_rating',      'flat',      'scalar', 20, 280, 'Evasion Rating');
  PERFORM seed_insert_mod(v_dom, v_armour, v_ba_cat, v_ba_str, 'body_block_chance',      'suffix', 'block_chance',        'increased', 'scalar', 2,  10,  'Block Chance');
  PERFORM seed_insert_mod(v_dom, v_armour, v_ba_cat, v_ba_str, 'body_stun_threshold',    'suffix', 'stun_threshold',      'flat',      'scalar', 10, 150, 'Stun Threshold');
  -- Resistances
  PERFORM seed_insert_mod(v_dom, v_armour, v_ba_cat, v_ba_str, 'body_fire_res',          'suffix', 'fire_resistance',     'increased', 'scalar', 6,  40,  'Fire Resistance');
  PERFORM seed_insert_mod(v_dom, v_armour, v_ba_cat, v_ba_str, 'body_cold_res',          'suffix', 'cold_resistance',     'increased', 'scalar', 6,  40,  'Cold Resistance');
  PERFORM seed_insert_mod(v_dom, v_armour, v_ba_cat, v_ba_str, 'body_lightning_res',     'suffix', 'lightning_resistance','increased', 'scalar', 6,  40,  'Lightning Resistance');
  PERFORM seed_insert_mod(v_dom, v_armour, v_ba_cat, v_ba_str, 'body_chaos_res',         'suffix', 'chaos_resistance',    'increased', 'scalar', 6,  40,  'Chaos Resistance');
  -- Accuracy
  PERFORM seed_insert_mod(v_dom, v_armour, v_ba_cat, v_ba_str, 'body_added_accuracy',    'suffix', 'accuracy_rating',     'flat',      'scalar', 10, 150, 'Added Accuracy Rating');
  -- Attributes
  PERFORM seed_insert_mod(v_dom, v_armour, v_ba_cat, v_ba_str, 'body_added_strength',    'suffix', 'strength',            'flat',      'scalar', 4,  20,  'Added Strength');
  PERFORM seed_insert_mod(v_dom, v_armour, v_ba_cat, v_ba_str, 'body_added_dex',         'suffix', 'dexterity',           'flat',      'scalar', 3,  18,  'Added Dexterity');
  PERFORM seed_insert_mod(v_dom, v_armour, v_ba_cat, v_ba_str, 'body_added_int',         'suffix', 'intelligence',        'flat',      'scalar', 3,  18,  'Added Intelligence');
END;
$$;
