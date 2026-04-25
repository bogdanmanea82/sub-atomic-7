-- seeds/07-modifiers-gloves.sql
-- 10 glove modifiers — bound to Gloves category.
-- Representative subcategory: Dexterity.

DO $$
DECLARE
  v_dom    UUID;
  v_armour UUID;
  v_gloves UUID;
  v_glv_d  UUID;
BEGIN
  SELECT id INTO v_dom    FROM game_domain    WHERE name = 'Items';
  SELECT id INTO v_armour FROM game_subdomain WHERE name = 'Armour';
  SELECT id INTO v_gloves FROM game_category  WHERE name = 'Gloves' AND game_subdomain_id = v_armour;
  SELECT id INTO v_glv_d  FROM game_subcategory WHERE name = 'Dexterity' AND game_category_id = v_gloves;

  -- Offensive
  PERFORM seed_insert_mod(v_dom, v_armour, v_gloves, v_glv_d, 'gloves_inc_attack_speed','prefix', 'attack_speed',      'increased', 'scalar', 3,  25,  'Increased Attack Speed');
  PERFORM seed_insert_mod(v_dom, v_armour, v_gloves, v_glv_d, 'gloves_inc_cast_speed',  'suffix', 'cast_speed',        'increased', 'scalar', 3,  20,  'Increased Cast Speed');
  PERFORM seed_insert_mod(v_dom, v_armour, v_gloves, v_glv_d, 'gloves_added_accuracy',  'suffix', 'accuracy_rating',   'flat',      'scalar', 15, 220, 'Added Accuracy Rating');
  PERFORM seed_insert_mod(v_dom, v_armour, v_gloves, v_glv_d, 'gloves_added_range',     'suffix', 'attack_range',      'increased', 'scalar', 1,  10,  'Increased Attack Range');
  -- Defence
  PERFORM seed_insert_mod(v_dom, v_armour, v_gloves, v_glv_d, 'gloves_added_evasion',   'prefix', 'evasion_rating',    'flat',      'scalar', 15, 220, 'Evasion Rating');
  PERFORM seed_insert_mod(v_dom, v_armour, v_gloves, v_glv_d, 'gloves_added_armour',    'prefix', 'armor_rating',      'flat',      'scalar', 15, 220, 'Armor Rating');
  -- Life & mana
  PERFORM seed_insert_mod(v_dom, v_armour, v_gloves, v_glv_d, 'gloves_added_life',      'suffix', 'life_max',          'flat',      'scalar', 10, 80,  'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_armour, v_gloves, v_glv_d, 'gloves_added_mana',      'suffix', 'mana_max',          'flat',      'scalar', 8,  60,  'Added Maximum Mana');
  -- Attributes
  PERFORM seed_insert_mod(v_dom, v_armour, v_gloves, v_glv_d, 'gloves_added_dex',       'suffix', 'dexterity',         'flat',      'scalar', 3,  20,  'Added Dexterity');
  PERFORM seed_insert_mod(v_dom, v_armour, v_gloves, v_glv_d, 'gloves_added_strength',  'suffix', 'strength',          'flat',      'scalar', 3,  18,  'Added Strength');
END;
$$;
