-- seeds/06-modifiers-boots.sql
-- 10 boot modifiers — bound to Boots category.
-- Representative subcategory: Evasion Boots (Dex).

DO $$
DECLARE
  v_dom    UUID;
  v_armour UUID;
  v_boots  UUID;
  v_boot_d UUID;
BEGIN
  SELECT id INTO v_dom    FROM game_domain    WHERE name = 'Items';
  SELECT id INTO v_armour FROM game_subdomain WHERE name = 'Armour';
  SELECT id INTO v_boots  FROM game_category  WHERE name = 'Boots' AND game_subdomain_id = v_armour;
  SELECT id INTO v_boot_d FROM game_subcategory WHERE name = 'Evasion Boots' AND game_category_id = v_boots;

  -- Utility
  PERFORM seed_insert_mod(v_dom, v_armour, v_boots, v_boot_d, 'boots_inc_movement',  'prefix', 'movement_speed',   'increased', 'scalar', 5,  24,  'Increased Movement Speed');
  PERFORM seed_insert_mod(v_dom, v_armour, v_boots, v_boot_d, 'boots_stun_threshold','suffix', 'stun_threshold',   'flat',      'scalar', 10, 120, 'Stun Threshold');
  -- Defence
  PERFORM seed_insert_mod(v_dom, v_armour, v_boots, v_boot_d, 'boots_added_evasion', 'prefix', 'evasion_rating',   'flat',      'scalar', 15, 220, 'Evasion Rating');
  PERFORM seed_insert_mod(v_dom, v_armour, v_boots, v_boot_d, 'boots_added_armour',  'prefix', 'armor_rating',     'flat',      'scalar', 15, 220, 'Armor Rating');
  -- Life & regen
  PERFORM seed_insert_mod(v_dom, v_armour, v_boots, v_boot_d, 'boots_added_life',    'suffix', 'life_max',         'flat',      'scalar', 10, 70,  'Added Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_armour, v_boots, v_boot_d, 'boots_life_regen',    'suffix', 'life_regen',       'flat',      'scalar', 1,  15,  'Life Regeneration');
  -- Resistances
  PERFORM seed_insert_mod(v_dom, v_armour, v_boots, v_boot_d, 'boots_fire_res',      'suffix', 'fire_resistance',  'increased', 'scalar', 6,  35,  'Fire Resistance');
  PERFORM seed_insert_mod(v_dom, v_armour, v_boots, v_boot_d, 'boots_cold_res',      'suffix', 'cold_resistance',  'increased', 'scalar', 6,  35,  'Cold Resistance');
  -- Attributes
  PERFORM seed_insert_mod(v_dom, v_armour, v_boots, v_boot_d, 'boots_added_dex',     'suffix', 'dexterity',        'flat',      'scalar', 3,  20,  'Added Dexterity');
  PERFORM seed_insert_mod(v_dom, v_armour, v_boots, v_boot_d, 'boots_added_strength','suffix', 'strength',         'flat',      'scalar', 3,  18,  'Added Strength');
END;
$$;
