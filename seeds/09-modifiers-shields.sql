-- seeds/09-modifiers-shields.sql
-- 8 shield modifiers — bound to Shields category.
-- Representative subcategory: Strength.

DO $$
DECLARE
  v_dom    UUID;
  v_armour UUID;
  v_shields UUID;
  v_shld_s  UUID;
BEGIN
  SELECT id INTO v_dom     FROM game_domain    WHERE name = 'Items';
  SELECT id INTO v_armour  FROM game_subdomain WHERE name = 'Armour';
  SELECT id INTO v_shields FROM game_category  WHERE name = 'Shields' AND game_subdomain_id = v_armour;
  SELECT id INTO v_shld_s  FROM game_subcategory WHERE name = 'Strength' AND game_category_id = v_shields;

  -- Defence
  PERFORM seed_insert_mod(v_dom, v_armour, v_shields, v_shld_s, 'shield_added_armour',   'prefix', 'armor_rating',    'flat',      'scalar', 20, 300, 'Armor Rating');
  PERFORM seed_insert_mod(v_dom, v_armour, v_shields, v_shld_s, 'shield_added_evasion',  'prefix', 'evasion_rating',  'flat',      'scalar', 15, 250, 'Evasion Rating');
  PERFORM seed_insert_mod(v_dom, v_armour, v_shields, v_shld_s, 'shield_block_chance',   'suffix', 'block_chance',    'increased', 'scalar', 3,  18,  'Increased Block Chance');
  -- Life & regen
  PERFORM seed_insert_mod(v_dom, v_armour, v_shields, v_shld_s, 'shield_added_life',     'prefix', 'life_max',        'flat',      'scalar', 20, 150, 'Maximum Life');
  PERFORM seed_insert_mod(v_dom, v_armour, v_shields, v_shld_s, 'shield_life_regen',     'suffix', 'life_regen',      'flat',      'scalar', 2,  18,  'Life Regeneration');
  -- Resistances
  PERFORM seed_insert_mod(v_dom, v_armour, v_shields, v_shld_s, 'shield_fire_res',       'suffix', 'fire_resistance', 'increased', 'scalar', 6,  40,  'Fire Resistance');
  PERFORM seed_insert_mod(v_dom, v_armour, v_shields, v_shld_s, 'shield_cold_res',       'suffix', 'cold_resistance', 'increased', 'scalar', 6,  40,  'Cold Resistance');
  -- Attribute
  PERFORM seed_insert_mod(v_dom, v_armour, v_shields, v_shld_s, 'shield_added_strength', 'suffix', 'strength',        'flat',      'scalar', 3,  18,  'Added Strength');
END;
$$;
