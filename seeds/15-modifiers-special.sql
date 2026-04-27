-- seeds/15-modifiers-special.sql
-- 12 modifiers demonstrating advanced binding patterns using seed_insert_modifier_raw.
-- Each modifier has manually defined tiers (custom level_req, weights) and one or
-- more explicit item_modifier_binding rows (include/exclude, category/subcategory).
--
-- affix_type is stored on item_modifier_binding (not on item_modifier).
-- Each binding row carries 'prefix' or 'suffix' explicitly.
--
-- PATTERN REFERENCE:
--   A. Multiple category inclusions          — mod appears across several slots
--   B. Category include + subcategory exclude — "all X except Y"
--   C. Category exclude + subcategory include — "only Y, not the rest of the category"
--   D. Subcategory-only, no category binding  — strict single-type exclusive
--   E. Cross-category, same subdomain         — category + unrelated subcategory both included
--   F. Multi-category across armour slots + exclusions
--
-- Modifiers in this file:
--  1. Maximum Life              (A) — life_max       Body Armour + Helmets + Belts
--  2. Chaos Resistance          (A) — chaos_res      all 5 armour categories
--  3. Added Strength            (B) — strength       1-Handed incl., Wand excl.
--  4. Added Intelligence        (B) — intelligence   Helmets incl., Heavy Helmet excl.
--  5. Mana Regeneration         (B) — mana_regen     2-Handed incl., 2H Sword/Axe/Mace excl.
--  6. Increased Movement Speed  (B) — movement_speed Boots incl., Heavy Boots excl.
--  7. Maximum Mana              (C) — mana_max       Jewellery excl., Ring incl.
--  8. Life Regeneration         (C) — life_regen     Jewellery excl., Amulet incl.
--  9. Critical Strike Chance    (D) — crit_chance    Dagger only
-- 10. Cast Speed                (D) — cast_speed     Focus only
-- 11. Added Accuracy Rating     (E) — accuracy       2-Handed incl. + Quiver incl.
-- 12. Evasion Rating            (F) — evasion_rating Gloves incl. + Boots incl., Heavy* excl.

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
  v_1h     UUID;
  v_2h     UUID;
  v_offh   UUID;

  -- Jewellery category
  v_jewcat UUID;

  -- Representative / exclusion subcategories — armour
  v_heavy_armour  UUID;
  v_heavy_helmet  UUID;
  v_ev_helmet     UUID;
  v_es_helmet     UUID;
  v_heavy_boots   UUID;
  v_ev_boots      UUID;
  v_heavy_gloves  UUID;
  v_ev_gloves     UUID;

  -- Representative / exclusion subcategories — weapons
  v_1h_sword UUID;
  v_wand     UUID;
  v_2h_sword UUID;
  v_2h_axe   UUID;
  v_2h_mace  UUID;
  v_staff    UUID;
  v_bow      UUID;
  v_quiver   UUID;
  v_focus    UUID;
  v_dagger   UUID;

  -- Jewellery subcategories
  v_ring   UUID;
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
  SELECT id INTO v_ev_helmet    FROM game_subcategory WHERE name = 'Evasion Helmet'        AND game_category_id = v_helm;
  SELECT id INTO v_es_helmet    FROM game_subcategory WHERE name = 'Energy Shield Helmet'  AND game_category_id = v_helm;
  SELECT id INTO v_heavy_boots  FROM game_subcategory WHERE name = 'Heavy Boots'           AND game_category_id = v_boots;
  SELECT id INTO v_ev_boots     FROM game_subcategory WHERE name = 'Evasion Boots'         AND game_category_id = v_boots;
  SELECT id INTO v_heavy_gloves FROM game_subcategory WHERE name = 'Heavy Gloves'          AND game_category_id = v_gloves;
  SELECT id INTO v_ev_gloves    FROM game_subcategory WHERE name = 'Evasion Gloves'        AND game_category_id = v_gloves;

  SELECT id INTO v_1h_sword FROM game_subcategory WHERE name = '1H Sword' AND game_category_id = v_1h;
  SELECT id INTO v_wand     FROM game_subcategory WHERE name = 'Wand'     AND game_category_id = v_1h;
  SELECT id INTO v_dagger   FROM game_subcategory WHERE name = 'Dagger'   AND game_category_id = v_1h;
  SELECT id INTO v_2h_sword FROM game_subcategory WHERE name = '2H Sword' AND game_category_id = v_2h;
  SELECT id INTO v_2h_axe   FROM game_subcategory WHERE name = '2H Axe'   AND game_category_id = v_2h;
  SELECT id INTO v_2h_mace  FROM game_subcategory WHERE name = '2H Mace'  AND game_category_id = v_2h;
  SELECT id INTO v_staff    FROM game_subcategory WHERE name = 'Staff'    AND game_category_id = v_2h;
  SELECT id INTO v_bow      FROM game_subcategory WHERE name = 'Bow'      AND game_category_id = v_2h;
  SELECT id INTO v_quiver   FROM game_subcategory WHERE name = 'Quiver'   AND game_category_id = v_offh;
  SELECT id INTO v_focus    FROM game_subcategory WHERE name = 'Focus'    AND game_category_id = v_offh;

  SELECT id INTO v_ring   FROM game_subcategory WHERE name = 'Ring'   AND game_category_id = v_jewcat;
  SELECT id INTO v_amulet FROM game_subcategory WHERE name = 'Amulet' AND game_category_id = v_jewcat;

  -- ══════════════════════════════════════════════════════════════════════════
  -- 1. MAXIMUM LIFE — flat life_max, prefix
  -- Pattern A: Body Armour + Helmets + Belts (multiple category inclusions)
  -- Boots and Gloves are deliberately NOT bound — extremities feel less "vital".
  -- ══════════════════════════════════════════════════════════════════════════
  v_mod := seed_insert_modifier_raw(
    v_dom, v_armour, v_body, v_heavy_armour,
    'maximum_life', 'life_max', 'flat', 'scalar', 25, 350, 'Maximum Life'
  );
  INSERT INTO modifier_tier (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 0,  25,  80,  1, 1000, now(), now()),
    (gen_random_uuid(), v_mod, 1,  80, 160, 20,  700, now(), now()),
    (gen_random_uuid(), v_mod, 2, 160, 250, 40,  400, now(), now()),
    (gen_random_uuid(), v_mod, 3, 250, 350, 60,  150, now(), now());
  INSERT INTO item_modifier_binding (id, modifier_id, target_type, target_id, affix_type, is_active, is_included, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 'category', v_body,  'prefix', true, true, now(), now()),
    (gen_random_uuid(), v_mod, 'category', v_helm,  'prefix', true, true, now(), now()),
    (gen_random_uuid(), v_mod, 'category', v_belts, 'prefix', true, true, now(), now());

  -- ══════════════════════════════════════════════════════════════════════════
  -- 2. CHAOS RESISTANCE — increased chaos_resistance, suffix
  -- Pattern A: All 5 armour categories — chaos res is rare and valuable everywhere.
  -- Steep level requirements; T3 needs level 70.
  -- ══════════════════════════════════════════════════════════════════════════
  v_mod := seed_insert_modifier_raw(
    v_dom, v_armour, v_body, v_heavy_armour,
    'chaos_resistance', 'chaos_resistance', 'increased', 'scalar', 4, 60, 'Chaos Resistance'
  );
  INSERT INTO modifier_tier (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 0,  4, 12,  1,  800, now(), now()),
    (gen_random_uuid(), v_mod, 1, 12, 25, 30,  400, now(), now()),
    (gen_random_uuid(), v_mod, 2, 25, 40, 50,  200, now(), now()),
    (gen_random_uuid(), v_mod, 3, 40, 60, 70,   50, now(), now());
  INSERT INTO item_modifier_binding (id, modifier_id, target_type, target_id, affix_type, is_active, is_included, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 'category', v_body,   'suffix', true, true, now(), now()),
    (gen_random_uuid(), v_mod, 'category', v_helm,   'suffix', true, true, now(), now()),
    (gen_random_uuid(), v_mod, 'category', v_boots,  'suffix', true, true, now(), now()),
    (gen_random_uuid(), v_mod, 'category', v_gloves, 'suffix', true, true, now(), now()),
    (gen_random_uuid(), v_mod, 'category', v_belts,  'suffix', true, true, now(), now());

  -- ══════════════════════════════════════════════════════════════════════════
  -- 3. ADDED STRENGTH — flat strength, suffix
  -- Pattern B: 1-Handed category included, Wand subcategory excluded.
  -- Wands are intelligence weapons — strength is thematically wrong.
  -- ══════════════════════════════════════════════════════════════════════════
  v_mod := seed_insert_modifier_raw(
    v_dom, v_wpn, v_1h, v_1h_sword,
    'added_strength', 'strength', 'flat', 'scalar', 3, 35, 'Added Strength'
  );
  INSERT INTO modifier_tier (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 0,  3, 10,  1, 1000, now(), now()),
    (gen_random_uuid(), v_mod, 1, 10, 18, 25,  600, now(), now()),
    (gen_random_uuid(), v_mod, 2, 18, 25, 45,  300, now(), now()),
    (gen_random_uuid(), v_mod, 3, 25, 35, 65,  100, now(), now());
  INSERT INTO item_modifier_binding (id, modifier_id, target_type, target_id, affix_type, is_active, is_included, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 'category',    v_1h,   'suffix', true, true,  now(), now()),
    (gen_random_uuid(), v_mod, 'subcategory', v_wand, 'suffix', true, false, now(), now());

  -- ══════════════════════════════════════════════════════════════════════════
  -- 4. ADDED INTELLIGENCE — flat intelligence, suffix
  -- Pattern B: Helmets category included, Heavy Helmet excluded.
  -- Physical strength helmets don't enhance arcane knowledge.
  -- ══════════════════════════════════════════════════════════════════════════
  v_mod := seed_insert_modifier_raw(
    v_dom, v_armour, v_helm, v_es_helmet,
    'added_intelligence', 'intelligence', 'flat', 'scalar', 3, 35, 'Added Intelligence'
  );
  INSERT INTO modifier_tier (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 0,  3, 10,  1, 1000, now(), now()),
    (gen_random_uuid(), v_mod, 1, 10, 18, 25,  600, now(), now()),
    (gen_random_uuid(), v_mod, 2, 18, 25, 45,  300, now(), now()),
    (gen_random_uuid(), v_mod, 3, 25, 35, 65,  100, now(), now());
  INSERT INTO item_modifier_binding (id, modifier_id, target_type, target_id, affix_type, is_active, is_included, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 'category',    v_helm,         'suffix', true, true,  now(), now()),
    (gen_random_uuid(), v_mod, 'subcategory', v_heavy_helmet, 'suffix', true, false, now(), now());

  -- ══════════════════════════════════════════════════════════════════════════
  -- 5. MANA REGENERATION — increased mana_regen, suffix
  -- Pattern B: 2-Handed category included; 2H Sword, 2H Axe, 2H Mace excluded.
  -- Physical melee two-handers don't channel mana — Staff, Bow, Crossbow do.
  -- ══════════════════════════════════════════════════════════════════════════
  v_mod := seed_insert_modifier_raw(
    v_dom, v_wpn, v_2h, v_staff,
    'mana_regeneration', 'mana_regen', 'increased', 'scalar', 8, 120, 'Mana Regeneration'
  );
  INSERT INTO modifier_tier (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 0,   8,  25,  1, 1000, now(), now()),
    (gen_random_uuid(), v_mod, 1,  25,  50, 30,  500, now(), now()),
    (gen_random_uuid(), v_mod, 2,  50,  80, 50,  250, now(), now()),
    (gen_random_uuid(), v_mod, 3,  80, 120, 70,   80, now(), now());
  INSERT INTO item_modifier_binding (id, modifier_id, target_type, target_id, affix_type, is_active, is_included, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 'category',    v_2h,       'suffix', true, true,  now(), now()),
    (gen_random_uuid(), v_mod, 'subcategory', v_2h_sword, 'suffix', true, false, now(), now()),
    (gen_random_uuid(), v_mod, 'subcategory', v_2h_axe,   'suffix', true, false, now(), now()),
    (gen_random_uuid(), v_mod, 'subcategory', v_2h_mace,  'suffix', true, false, now(), now());

  -- ══════════════════════════════════════════════════════════════════════════
  -- 6. INCREASED MOVEMENT SPEED — increased movement_speed, prefix
  -- Pattern B: Boots category included, Heavy Boots excluded.
  -- Steel-reinforced boots are too heavy for nimble footwork.
  -- ══════════════════════════════════════════════════════════════════════════
  v_mod := seed_insert_modifier_raw(
    v_dom, v_armour, v_boots, v_ev_boots,
    'movement_speed', 'movement_speed', 'increased', 'scalar', 5, 30, 'Increased Movement Speed'
  );
  INSERT INTO modifier_tier (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 0,  5, 10,  1,  800, now(), now()),
    (gen_random_uuid(), v_mod, 1, 10, 16, 25,  400, now(), now()),
    (gen_random_uuid(), v_mod, 2, 16, 22, 45,  200, now(), now()),
    (gen_random_uuid(), v_mod, 3, 22, 30, 65,   60, now(), now());
  INSERT INTO item_modifier_binding (id, modifier_id, target_type, target_id, affix_type, is_active, is_included, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 'category',    v_boots,       'prefix', true, true,  now(), now()),
    (gen_random_uuid(), v_mod, 'subcategory', v_heavy_boots, 'prefix', true, false, now(), now());

  -- ══════════════════════════════════════════════════════════════════════════
  -- 7. MAXIMUM MANA — flat mana_max, prefix
  -- Pattern C: Jewellery category excluded; Ring subcategory explicitly included.
  -- The subcategory inclusion overrides the category exclusion for Rings only.
  -- Amulets get neither — effectively Ring-exclusive via explicit hierarchy.
  -- ══════════════════════════════════════════════════════════════════════════
  v_mod := seed_insert_modifier_raw(
    v_dom, v_jewel, v_jewcat, v_ring,
    'maximum_mana', 'mana_max', 'flat', 'scalar', 8, 90, 'Maximum Mana'
  );
  INSERT INTO modifier_tier (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 0,  8, 20,  1, 1000, now(), now()),
    (gen_random_uuid(), v_mod, 1, 20, 40, 20,  600, now(), now()),
    (gen_random_uuid(), v_mod, 2, 40, 65, 40,  300, now(), now()),
    (gen_random_uuid(), v_mod, 3, 65, 90, 60,  100, now(), now());
  INSERT INTO item_modifier_binding (id, modifier_id, target_type, target_id, affix_type, is_active, is_included, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 'category',    v_jewcat, 'prefix', true, false, now(), now()),
    (gen_random_uuid(), v_mod, 'subcategory', v_ring,   'prefix', true, true,  now(), now());

  -- ══════════════════════════════════════════════════════════════════════════
  -- 8. LIFE REGENERATION — flat life_regen, suffix
  -- Pattern C: Jewellery category excluded; Amulet subcategory explicitly included.
  -- Mirror of Maximum Mana — Amulet-exclusive via same override pattern.
  -- ══════════════════════════════════════════════════════════════════════════
  v_mod := seed_insert_modifier_raw(
    v_dom, v_jewel, v_jewcat, v_amulet,
    'life_regeneration', 'life_regen', 'flat', 'scalar', 2, 22, 'Life Regeneration'
  );
  INSERT INTO modifier_tier (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 0,  2,  5,  1, 1000, now(), now()),
    (gen_random_uuid(), v_mod, 1,  5, 10, 20,  600, now(), now()),
    (gen_random_uuid(), v_mod, 2, 10, 15, 40,  300, now(), now()),
    (gen_random_uuid(), v_mod, 3, 15, 22, 60,  100, now(), now());
  INSERT INTO item_modifier_binding (id, modifier_id, target_type, target_id, affix_type, is_active, is_included, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 'category',    v_jewcat, 'suffix', true, false, now(), now()),
    (gen_random_uuid(), v_mod, 'subcategory', v_amulet, 'suffix', true, true,  now(), now());

  -- ══════════════════════════════════════════════════════════════════════════
  -- 9. CRITICAL STRIKE CHANCE — increased critical_strike_chance, suffix
  -- Pattern D: Dagger subcategory only. No category binding at all.
  -- High crit values exclusive to the assassin weapon.
  -- ══════════════════════════════════════════════════════════════════════════
  v_mod := seed_insert_modifier_raw(
    v_dom, v_wpn, v_1h, v_dagger,
    'critical_strike_chance', 'critical_strike_chance', 'increased', 'scalar', 10, 90, 'Critical Strike Chance'
  );
  INSERT INTO modifier_tier (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 0, 10, 25,  1,  800, now(), now()),
    (gen_random_uuid(), v_mod, 1, 25, 45, 25,  400, now(), now()),
    (gen_random_uuid(), v_mod, 2, 45, 65, 45,  200, now(), now()),
    (gen_random_uuid(), v_mod, 3, 65, 90, 65,   60, now(), now());
  INSERT INTO item_modifier_binding (id, modifier_id, target_type, target_id, affix_type, is_active, is_included, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 'subcategory', v_dagger, 'suffix', true, true, now(), now());

  -- ══════════════════════════════════════════════════════════════════════════
  -- 10. CAST SPEED — increased cast_speed, prefix
  -- Pattern D: Focus subcategory only. No category binding.
  -- Caster off-hand amplifies spells; Shield and Quiver don't channel arcane energy.
  -- ══════════════════════════════════════════════════════════════════════════
  v_mod := seed_insert_modifier_raw(
    v_dom, v_wpn, v_offh, v_focus,
    'cast_speed', 'cast_speed', 'increased', 'scalar', 8, 50, 'Cast Speed'
  );
  INSERT INTO modifier_tier (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 0,  8, 18,  1,  800, now(), now()),
    (gen_random_uuid(), v_mod, 1, 18, 28, 25,  400, now(), now()),
    (gen_random_uuid(), v_mod, 2, 28, 38, 45,  200, now(), now()),
    (gen_random_uuid(), v_mod, 3, 38, 50, 65,   60, now(), now());
  INSERT INTO item_modifier_binding (id, modifier_id, target_type, target_id, affix_type, is_active, is_included, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 'subcategory', v_focus, 'prefix', true, true, now(), now());

  -- ══════════════════════════════════════════════════════════════════════════
  -- 11. ADDED ACCURACY RATING — flat accuracy_rating, prefix
  -- Pattern E: 2-Handed category included AND Quiver subcategory included.
  -- Ranged characters stack accuracy on their weapon AND their ammo pouch.
  -- ══════════════════════════════════════════════════════════════════════════
  v_mod := seed_insert_modifier_raw(
    v_dom, v_wpn, v_2h, v_2h_sword,
    'accuracy_rating', 'accuracy_rating', 'flat', 'scalar', 15, 250, 'Added Accuracy Rating'
  );
  INSERT INTO modifier_tier (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 0,  15,  50,  1, 1000, now(), now()),
    (gen_random_uuid(), v_mod, 1,  50, 100, 20,  600, now(), now()),
    (gen_random_uuid(), v_mod, 2, 100, 175, 40,  300, now(), now()),
    (gen_random_uuid(), v_mod, 3, 175, 250, 60,  100, now(), now());
  INSERT INTO item_modifier_binding (id, modifier_id, target_type, target_id, affix_type, is_active, is_included, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 'category',    v_2h,     'prefix', true, true, now(), now()),
    (gen_random_uuid(), v_mod, 'subcategory', v_quiver, 'prefix', true, true, now(), now());

  -- ══════════════════════════════════════════════════════════════════════════
  -- 12. EVASION RATING — flat evasion_rating, prefix
  -- Pattern F: Gloves + Boots categories included; Heavy Gloves + Heavy Boots excluded.
  -- Evasion is for light and magical armour — plate extremities don't dodge.
  -- ══════════════════════════════════════════════════════════════════════════
  v_mod := seed_insert_modifier_raw(
    v_dom, v_armour, v_gloves, v_ev_gloves,
    'evasion_rating', 'evasion_rating', 'flat', 'scalar', 15, 280, 'Evasion Rating'
  );
  INSERT INTO modifier_tier (id, modifier_id, tier_index, min_value, max_value, level_req, spawn_weight, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 0,  15,  50,  1, 1000, now(), now()),
    (gen_random_uuid(), v_mod, 1,  50, 100, 20,  600, now(), now()),
    (gen_random_uuid(), v_mod, 2, 100, 180, 40,  300, now(), now()),
    (gen_random_uuid(), v_mod, 3, 180, 280, 60,  100, now(), now());
  INSERT INTO item_modifier_binding (id, modifier_id, target_type, target_id, affix_type, is_active, is_included, created_at, updated_at) VALUES
    (gen_random_uuid(), v_mod, 'category',    v_gloves,       'prefix', true, true,  now(), now()),
    (gen_random_uuid(), v_mod, 'category',    v_boots,        'prefix', true, true,  now(), now()),
    (gen_random_uuid(), v_mod, 'subcategory', v_heavy_gloves, 'prefix', true, false, now(), now()),
    (gen_random_uuid(), v_mod, 'subcategory', v_heavy_boots,  'prefix', true, false, now(), now());

END;
$$;
