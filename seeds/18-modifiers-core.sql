-- seeds/18-modifiers-core.sql
-- 11 modifiers covering the remaining targetable stats.
--
-- Stats already covered in 15-modifiers-special.sql (12):
--   life_max, chaos_resistance, strength, intelligence, mana_regen,
--   movement_speed, mana_max, life_regen, critical_strike_chance,
--   cast_speed, accuracy_rating, evasion_rating
--
-- Stats excluded from modifier pool (4 — equipment requirements):
--   level_requirement, strength_requirement, dexterity_requirement, intelligence_requirement
--
-- affix_type is stored on item_modifier_binding (not on item_modifier).
-- Each binding row carries 'prefix' or 'suffix' explicitly.
--
-- New modifiers (11):
--  1. Added Dexterity               (B)  dexterity              Boots incl, Heavy Boots excl
--  2. Added Base Damage             (A+) base_damage            1H+2H incl, Wand+Staff excl
--  3. Increased Attack Speed        (E)  attack_speed           Gloves+1H incl, Heavy Gloves excl
--  4. Increased Crit Multiplier     (D)  crit_strike_multiplier Amulet only
--  5. Added Attack Range            (B)  attack_range           2H incl, Bow+Crossbow+Staff excl
--  6. Added Armor Rating            (F)  armor_rating           Body+Helm incl, ES Armour+ES Helm excl
--  7. Added Block Chance            (D)  block_chance           Shield only
--  8. Fire Resistance               (A)  fire_resistance        Body+Helm+Belts
--  9. Cold Resistance               (A)  cold_resistance        Boots+Gloves+Belts
-- 10. Lightning Resistance          (A)  lightning_resistance   Body+Helm+Gloves
-- 11. Added Stun Threshold          (A)  stun_threshold         Helmets+Belts

DO $$
DECLARE
  -- Domain / subdomains
  v_dom    UUID;
  v_armour UUID;
  v_wpn    UUID;
  v_jewel  UUID;

  -- Armour categories
  v_body   UUID;
  v_helm   UUID;
  v_boots  UUID;
  v_gloves UUID;
  v_belts  UUID;

  -- Weapon categories
  v_1h   UUID;
  v_2h   UUID;
  v_offh UUID;

  -- Jewellery category
  v_jewcat UUID;

  -- Armour subcategories
  v_heavy_armour UUID;
  v_heavy_helmet UUID;
  v_ev_boots     UUID;
  v_heavy_boots  UUID;
  v_ev_gloves    UUID;
  v_heavy_gloves UUID;
  v_es_armour    UUID;
  v_es_helmet    UUID;

  -- Weapon subcategories
  v_1h_sword UUID;
  v_wand     UUID;
  v_2h_sword UUID;
  v_staff    UUID;
  v_bow      UUID;
  v_crossbow UUID;
  v_shield   UUID;

  -- Jewellery subcategories
  v_amulet UUID;

  -- Working variable
  v_mod UUID;
BEGIN

  -- ── lookups ──────────────────────────────────────────────────────────────
  SELECT id INTO v_dom    FROM game_domain    WHERE name = 'Items';
  SELECT id INTO v_armour FROM game_subdomain WHERE name = 'Armour';
  SELECT id INTO v_wpn    FROM game_subdomain WHERE name = 'Weapons';
  SELECT id INTO v_jewel  FROM game_subdomain WHERE name = 'Jewellery';

  SELECT id INTO v_body   FROM game_category WHERE name = 'Body Armour' AND game_subdomain_id = v_armour;
  SELECT id INTO v_helm   FROM game_category WHERE name = 'Helmets'     AND game_subdomain_id = v_armour;
  SELECT id INTO v_boots  FROM game_category WHERE name = 'Boots'       AND game_subdomain_id = v_armour;
  SELECT id INTO v_gloves FROM game_category WHERE name = 'Gloves'      AND game_subdomain_id = v_armour;
  SELECT id INTO v_belts  FROM game_category WHERE name = 'Belts'       AND game_subdomain_id = v_armour;

  SELECT id INTO v_1h   FROM game_category WHERE name = '1-Handed' AND game_subdomain_id = v_wpn;
  SELECT id INTO v_2h   FROM game_category WHERE name = '2-Handed' AND game_subdomain_id = v_wpn;
  SELECT id INTO v_offh FROM game_category WHERE name = 'Off-hand'  AND game_subdomain_id = v_wpn;

  SELECT id INTO v_jewcat FROM game_category WHERE name = 'Jewellery' AND game_subdomain_id = v_jewel;

  SELECT id INTO v_heavy_armour FROM game_subcategory WHERE name = 'Heavy Armour'         AND game_category_id = v_body;
  SELECT id INTO v_heavy_helmet FROM game_subcategory WHERE name = 'Heavy Helmet'          AND game_category_id = v_helm;
  SELECT id INTO v_ev_boots     FROM game_subcategory WHERE name = 'Evasion Boots'         AND game_category_id = v_boots;
  SELECT id INTO v_heavy_boots  FROM game_subcategory WHERE name = 'Heavy Boots'           AND game_category_id = v_boots;
  SELECT id INTO v_ev_gloves    FROM game_subcategory WHERE name = 'Evasion Gloves'        AND game_category_id = v_gloves;
  SELECT id INTO v_heavy_gloves FROM game_subcategory WHERE name = 'Heavy Gloves'          AND game_category_id = v_gloves;
  SELECT id INTO v_es_armour    FROM game_subcategory WHERE name = 'Energy Shield Armour'  AND game_category_id = v_body;
  SELECT id INTO v_es_helmet    FROM game_subcategory WHERE name = 'Energy Shield Helmet'  AND game_category_id = v_helm;

  SELECT id INTO v_1h_sword FROM game_subcategory WHERE name = '1H Sword' AND game_category_id = v_1h;
  SELECT id INTO v_wand     FROM game_subcategory WHERE name = 'Wand'     AND game_category_id = v_1h;
  SELECT id INTO v_2h_sword FROM game_subcategory WHERE name = '2H Sword' AND game_category_id = v_2h;
  SELECT id INTO v_staff    FROM game_subcategory WHERE name = 'Staff'    AND game_category_id = v_2h;
  SELECT id INTO v_bow      FROM game_subcategory WHERE name = 'Bow'      AND game_category_id = v_2h;
  SELECT id INTO v_crossbow FROM game_subcategory WHERE name = 'Crossbow' AND game_category_id = v_2h;
  SELECT id INTO v_shield   FROM game_subcategory WHERE name = 'Shield'   AND game_category_id = v_offh;

  SELECT id INTO v_amulet FROM game_subcategory WHERE name = 'Amulet' AND game_category_id = v_jewcat;

  -- ══════════════════════════════════════════════════════════════════════════
  -- 1. ADDED DEXTERITY — flat dexterity, suffix
  -- Pattern B: Boots category included, Heavy Boots excluded.
  -- Dexterity scales with agility — plate boots are too rigid for nimble footwork.
  -- ══════════════════════════════════════════════════════════════════════════
  v_mod := seed_insert_mod_raw(
    v_dom, v_armour, v_boots, v_ev_boots,
    'added_dexterity', 'dexterity', 'flat', 'scalar', 3, 35, 'Added Dexterity'
  );
  INSERT INTO modifier_tier (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 0,  3, 10,  1, 1000, now(), now()),
    (gen_random_uuid(), v_mod, 1, 10, 18, 25,  600, now(), now()),
    (gen_random_uuid(), v_mod, 2, 18, 25, 45,  300, now(), now()),
    (gen_random_uuid(), v_mod, 3, 25, 35, 65,  100, now(), now());
  INSERT INTO item_modifier_binding (id, modifier_id, target_type, target_id, affix_type, is_active, is_included, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 'category',    v_boots,       'suffix', true, true,  now(), now()),
    (gen_random_uuid(), v_mod, 'subcategory', v_heavy_boots, 'suffix', true, false, now(), now());

  -- ══════════════════════════════════════════════════════════════════════════
  -- 2. ADDED BASE DAMAGE — flat base_damage, prefix
  -- Pattern A+: 1-Handed and 2-Handed categories included.
  -- Wand and Staff excluded — their damage comes from spell power, not physical strikes.
  -- ══════════════════════════════════════════════════════════════════════════
  v_mod := seed_insert_mod_raw(
    v_dom, v_wpn, v_1h, v_1h_sword,
    'added_base_damage', 'base_damage', 'flat', 'scalar', 5, 90, 'Added Base Damage'
  );
  INSERT INTO modifier_tier (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 0,  5, 20,  1, 1000, now(), now()),
    (gen_random_uuid(), v_mod, 1, 20, 45, 20,  600, now(), now()),
    (gen_random_uuid(), v_mod, 2, 45, 70, 40,  300, now(), now()),
    (gen_random_uuid(), v_mod, 3, 70, 90, 60,  100, now(), now());
  INSERT INTO item_modifier_binding (id, modifier_id, target_type, target_id, affix_type, is_active, is_included, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 'category',    v_1h,    'prefix', true, true,  now(), now()),
    (gen_random_uuid(), v_mod, 'category',    v_2h,    'prefix', true, true,  now(), now()),
    (gen_random_uuid(), v_mod, 'subcategory', v_wand,  'prefix', true, false, now(), now()),
    (gen_random_uuid(), v_mod, 'subcategory', v_staff, 'prefix', true, false, now(), now());

  -- ══════════════════════════════════════════════════════════════════════════
  -- 3. INCREASED ATTACK SPEED — increased attack_speed, prefix
  -- Pattern E: Gloves category included AND 1-Handed category included.
  -- Heavy Gloves excluded — gauntlets restrict finger movement.
  -- attack_speed stored as multiplier (100=1.0x); values are % points added.
  -- ══════════════════════════════════════════════════════════════════════════
  v_mod := seed_insert_mod_raw(
    v_dom, v_armour, v_gloves, v_ev_gloves,
    'increased_attack_speed', 'attack_speed', 'increased', 'scalar', 5, 20, 'Increased Attack Speed'
  );
  INSERT INTO modifier_tier (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 0,  5,  8,  1, 800, now(), now()),
    (gen_random_uuid(), v_mod, 1,  8, 12, 25, 400, now(), now()),
    (gen_random_uuid(), v_mod, 2, 12, 16, 45, 200, now(), now()),
    (gen_random_uuid(), v_mod, 3, 16, 20, 65,  60, now(), now());
  INSERT INTO item_modifier_binding (id, modifier_id, target_type, target_id, affix_type, is_active, is_included, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 'category',    v_gloves,       'prefix', true, true,  now(), now()),
    (gen_random_uuid(), v_mod, 'category',    v_1h,           'prefix', true, true,  now(), now()),
    (gen_random_uuid(), v_mod, 'subcategory', v_heavy_gloves, 'prefix', true, false, now(), now());

  -- ══════════════════════════════════════════════════════════════════════════
  -- 4. INCREASED CRITICAL STRIKE MULTIPLIER — increased crit_multiplier, suffix
  -- Pattern D: Amulet subcategory only. No category binding.
  -- Critical strike multiplier is the province of neck slot theorycrafting.
  -- crit_multiplier stored as percentage (150=150%); values are % points added.
  -- ══════════════════════════════════════════════════════════════════════════
  v_mod := seed_insert_mod_raw(
    v_dom, v_jewel, v_jewcat, v_amulet,
    'critical_strike_multiplier', 'critical_strike_multiplier', 'increased', 'scalar', 10, 70, 'Increased Critical Strike Multiplier'
  );
  INSERT INTO modifier_tier (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 0, 10, 20,  1, 600, now(), now()),
    (gen_random_uuid(), v_mod, 1, 20, 35, 30, 300, now(), now()),
    (gen_random_uuid(), v_mod, 2, 35, 50, 55, 150, now(), now()),
    (gen_random_uuid(), v_mod, 3, 50, 70, 70,  40, now(), now());
  INSERT INTO item_modifier_binding (id, modifier_id, target_type, target_id, affix_type, is_active, is_included, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 'subcategory', v_amulet, 'suffix', true, true, now(), now());

  -- ══════════════════════════════════════════════════════════════════════════
  -- 5. ADDED ATTACK RANGE — flat attack_range, prefix
  -- Pattern B: 2-Handed category included; Bow, Crossbow, Staff excluded.
  -- Range is a melee reach stat — ranged weapons have inherent infinite range.
  -- ══════════════════════════════════════════════════════════════════════════
  v_mod := seed_insert_mod_raw(
    v_dom, v_wpn, v_2h, v_2h_sword,
    'added_attack_range', 'attack_range', 'flat', 'scalar', 1, 4, 'Added Attack Range'
  );
  INSERT INTO modifier_tier (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 0, 1, 1,  1, 1000, now(), now()),
    (gen_random_uuid(), v_mod, 1, 1, 2, 25,  500, now(), now()),
    (gen_random_uuid(), v_mod, 2, 2, 3, 45,  250, now(), now()),
    (gen_random_uuid(), v_mod, 3, 3, 4, 65,   80, now(), now());
  INSERT INTO item_modifier_binding (id, modifier_id, target_type, target_id, affix_type, is_active, is_included, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 'category',    v_2h,       'prefix', true, true,  now(), now()),
    (gen_random_uuid(), v_mod, 'subcategory', v_bow,      'prefix', true, false, now(), now()),
    (gen_random_uuid(), v_mod, 'subcategory', v_crossbow, 'prefix', true, false, now(), now()),
    (gen_random_uuid(), v_mod, 'subcategory', v_staff,    'prefix', true, false, now(), now());

  -- ══════════════════════════════════════════════════════════════════════════
  -- 6. ADDED ARMOR RATING — flat armor_rating, prefix
  -- Pattern F: Body Armour and Helmets included; Energy Shield variants excluded.
  -- Armour and energy shield are opposing defensive types — ES pieces don't add armour.
  -- ══════════════════════════════════════════════════════════════════════════
  v_mod := seed_insert_mod_raw(
    v_dom, v_armour, v_body, v_heavy_armour,
    'added_armor_rating', 'armor_rating', 'flat', 'scalar', 20, 400, 'Added Armor Rating'
  );
  INSERT INTO modifier_tier (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 0,  20,  80,  1, 1000, now(), now()),
    (gen_random_uuid(), v_mod, 1,  80, 160, 20,  600, now(), now()),
    (gen_random_uuid(), v_mod, 2, 160, 270, 40,  300, now(), now()),
    (gen_random_uuid(), v_mod, 3, 270, 400, 60,  100, now(), now());
  INSERT INTO item_modifier_binding (id, modifier_id, target_type, target_id, affix_type, is_active, is_included, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 'category',    v_body,      'prefix', true, true,  now(), now()),
    (gen_random_uuid(), v_mod, 'category',    v_helm,      'prefix', true, true,  now(), now()),
    (gen_random_uuid(), v_mod, 'subcategory', v_es_armour, 'prefix', true, false, now(), now()),
    (gen_random_uuid(), v_mod, 'subcategory', v_es_helmet, 'prefix', true, false, now(), now());

  -- ══════════════════════════════════════════════════════════════════════════
  -- 7. ADDED BLOCK CHANCE — flat block_chance, prefix
  -- Pattern D: Shield subcategory only. No category binding.
  -- Block is mechanically locked to shields; no other slot can block.
  -- block_chance stored as percentage (0–75); values are flat % points.
  -- ══════════════════════════════════════════════════════════════════════════
  v_mod := seed_insert_mod_raw(
    v_dom, v_wpn, v_offh, v_shield,
    'added_block_chance', 'block_chance', 'flat', 'scalar', 3, 20, 'Added Block Chance'
  );
  INSERT INTO modifier_tier (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 0,  3,  6,  1, 800, now(), now()),
    (gen_random_uuid(), v_mod, 1,  6, 10, 25, 400, now(), now()),
    (gen_random_uuid(), v_mod, 2, 10, 14, 45, 200, now(), now()),
    (gen_random_uuid(), v_mod, 3, 14, 20, 65,  60, now(), now());
  INSERT INTO item_modifier_binding (id, modifier_id, target_type, target_id, affix_type, is_active, is_included, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 'subcategory', v_shield, 'prefix', true, true, now(), now());

  -- ══════════════════════════════════════════════════════════════════════════
  -- 8. FIRE RESISTANCE — flat fire_resistance, suffix
  -- Pattern A: Body Armour + Helmets + Belts (broad torso and head coverage).
  -- Fire protection is core defensive coverage — wide but not universal.
  -- Stored as percentage integer; flat adds directly to the stat.
  -- ══════════════════════════════════════════════════════════════════════════
  v_mod := seed_insert_mod_raw(
    v_dom, v_armour, v_body, v_heavy_armour,
    'fire_resistance', 'fire_resistance', 'flat', 'scalar', 10, 50, 'Fire Resistance'
  );
  INSERT INTO modifier_tier (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 0, 10, 15,  1, 1000, now(), now()),
    (gen_random_uuid(), v_mod, 1, 15, 25, 30,  500, now(), now()),
    (gen_random_uuid(), v_mod, 2, 25, 35, 50,  200, now(), now()),
    (gen_random_uuid(), v_mod, 3, 35, 50, 70,   60, now(), now());
  INSERT INTO item_modifier_binding (id, modifier_id, target_type, target_id, affix_type, is_active, is_included, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 'category', v_body,  'suffix', true, true, now(), now()),
    (gen_random_uuid(), v_mod, 'category', v_helm,  'suffix', true, true, now(), now()),
    (gen_random_uuid(), v_mod, 'category', v_belts, 'suffix', true, true, now(), now());

  -- ══════════════════════════════════════════════════════════════════════════
  -- 9. COLD RESISTANCE — flat cold_resistance, suffix
  -- Pattern A: Boots + Gloves + Belts (extremities and core — cold bites at the edges).
  -- Deliberately distinct from fire (Body+Helm+Belts) for binding variety.
  -- ══════════════════════════════════════════════════════════════════════════
  v_mod := seed_insert_mod_raw(
    v_dom, v_armour, v_boots, v_ev_boots,
    'cold_resistance', 'cold_resistance', 'flat', 'scalar', 10, 50, 'Cold Resistance'
  );
  INSERT INTO modifier_tier (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 0, 10, 15,  1, 1000, now(), now()),
    (gen_random_uuid(), v_mod, 1, 15, 25, 30,  500, now(), now()),
    (gen_random_uuid(), v_mod, 2, 25, 35, 50,  200, now(), now()),
    (gen_random_uuid(), v_mod, 3, 35, 50, 70,   60, now(), now());
  INSERT INTO item_modifier_binding (id, modifier_id, target_type, target_id, affix_type, is_active, is_included, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 'category', v_boots,  'suffix', true, true, now(), now()),
    (gen_random_uuid(), v_mod, 'category', v_gloves, 'suffix', true, true, now(), now()),
    (gen_random_uuid(), v_mod, 'category', v_belts,  'suffix', true, true, now(), now());

  -- ══════════════════════════════════════════════════════════════════════════
  -- 10. LIGHTNING RESISTANCE — flat lightning_resistance, suffix
  -- Pattern A: Body Armour + Helmets + Gloves (conducting metal coverage).
  -- Each resistance targets a distinct 3-slot combination for variety.
  -- ══════════════════════════════════════════════════════════════════════════
  v_mod := seed_insert_mod_raw(
    v_dom, v_armour, v_body, v_heavy_armour,
    'lightning_resistance', 'lightning_resistance', 'flat', 'scalar', 10, 50, 'Lightning Resistance'
  );
  INSERT INTO modifier_tier (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 0, 10, 15,  1, 1000, now(), now()),
    (gen_random_uuid(), v_mod, 1, 15, 25, 30,  500, now(), now()),
    (gen_random_uuid(), v_mod, 2, 25, 35, 50,  200, now(), now()),
    (gen_random_uuid(), v_mod, 3, 35, 50, 70,   60, now(), now());
  INSERT INTO item_modifier_binding (id, modifier_id, target_type, target_id, affix_type, is_active, is_included, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 'category', v_body,   'suffix', true, true, now(), now()),
    (gen_random_uuid(), v_mod, 'category', v_helm,   'suffix', true, true, now(), now()),
    (gen_random_uuid(), v_mod, 'category', v_gloves, 'suffix', true, true, now(), now());

  -- ══════════════════════════════════════════════════════════════════════════
  -- 11. ADDED STUN THRESHOLD — flat stun_threshold, suffix
  -- Pattern A: Helmets + Belts (head protection and core bracing).
  -- A sturdy helmet and a reinforced belt are the classic stun resistance gear.
  -- ══════════════════════════════════════════════════════════════════════════
  v_mod := seed_insert_mod_raw(
    v_dom, v_armour, v_helm, v_heavy_helmet,
    'added_stun_threshold', 'stun_threshold', 'flat', 'scalar', 30, 400, 'Added Stun Threshold'
  );
  INSERT INTO modifier_tier (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 0,  30,  80,  1, 1000, now(), now()),
    (gen_random_uuid(), v_mod, 1,  80, 160, 20,  600, now(), now()),
    (gen_random_uuid(), v_mod, 2, 160, 250, 40,  300, now(), now()),
    (gen_random_uuid(), v_mod, 3, 250, 400, 60,  100, now(), now());
  INSERT INTO item_modifier_binding (id, modifier_id, target_type, target_id, affix_type, is_active, is_included, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 'category', v_helm,  'suffix', true, true, now(), now()),
    (gen_random_uuid(), v_mod, 'category', v_belts, 'suffix', true, true, now(), now());

END;
$$;
