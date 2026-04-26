-- seeds/16-items.sql
-- 31 Item template rows — one per rollable subcategory in the Items domain.
--
-- machine_name follows snake_case with alphabetic start (no digit prefixes).
-- Hierarchy FKs are resolved by machine_name join at insert time, so this
-- file remains stable across re-seeds that regenerate UUIDs.

INSERT INTO item (
  id,
  game_domain_id,
  game_subdomain_id,
  game_category_id,
  game_subcategory_id,
  machine_name,
  name,
  description,
  is_active,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM game_domain    WHERE machine_name = 'items'),
  gsd.id,
  gc.id,
  gsc.id,
  v.machine_name,
  v.name,
  v.description,
  true,
  now(),
  now()
FROM (
  VALUES
    -- ── Belts ──────────────────────────────────────────────────────────────
    ('armour',    'belts',       'heavy_belt',           'Heavy Belt',           'Strength-based waist equipment'),
    ('armour',    'belts',       'evasion_belt',         'Evasion Belt',         'Dexterity-based waist equipment'),
    ('armour',    'belts',       'arcane_belt',          'Arcane Belt',          'Intelligence-based waist equipment'),

    -- ── Body Armour ─────────────────────────────────────────────────────────
    ('armour',    'body_armour', 'heavy_armour',         'Heavy Armour',         'Strength-based chest protection'),
    ('armour',    'body_armour', 'evasion_armour',       'Evasion Armour',       'Dexterity-based chest protection'),
    ('armour',    'body_armour', 'energy_shield_armour', 'Energy Shield Armour', 'Intelligence-based chest protection'),

    -- ── Boots ───────────────────────────────────────────────────────────────
    ('armour',    'boots',       'heavy_boots',           'Heavy Boots',           'Strength-based footwear'),
    ('armour',    'boots',       'evasion_boots',         'Evasion Boots',         'Dexterity-based footwear'),
    ('armour',    'boots',       'energy_shield_boots',   'Energy Shield Boots',   'Intelligence-based footwear'),

    -- ── Gloves ──────────────────────────────────────────────────────────────
    ('armour',    'gloves',      'heavy_gloves',          'Heavy Gloves',          'Strength-based handwear'),
    ('armour',    'gloves',      'evasion_gloves',        'Evasion Gloves',        'Dexterity-based handwear'),
    ('armour',    'gloves',      'energy_shield_gloves',  'Energy Shield Gloves',  'Intelligence-based handwear'),

    -- ── Helmets ─────────────────────────────────────────────────────────────
    ('armour',    'helmets',     'heavy_helmet',          'Heavy Helmet',          'Strength-based headgear'),
    ('armour',    'helmets',     'evasion_helmet',        'Evasion Helmet',        'Dexterity-based headgear'),
    ('armour',    'helmets',     'energy_shield_helmet',  'Energy Shield Helmet',  'Intelligence-based headgear'),

    -- ── Jewellery ───────────────────────────────────────────────────────────
    ('jewellery', 'jewellery',   'ring',                  'Ring',                  'Finger accessory'),
    ('jewellery', 'jewellery',   'amulet',                'Amulet',                'Neck accessory'),

    -- ── 1-Handed Weapons ────────────────────────────────────────────────────
    ('weapons',   'one_handed',  'one_h_sword',           '1H Sword',              'One-handed sword — balanced speed and damage'),
    ('weapons',   'one_handed',  'one_h_axe',             '1H Axe',                'One-handed axe — high raw damage'),
    ('weapons',   'one_handed',  'one_h_mace',            '1H Mace',               'One-handed mace — high stun potential'),
    ('weapons',   'one_handed',  'dagger',                'Dagger',                'Fast one-handed weapon — crit-focused'),
    ('weapons',   'one_handed',  'wand',                  'Wand',                  'One-handed spell weapon — intelligence-based'),

    -- ── 2-Handed Weapons ────────────────────────────────────────────────────
    ('weapons',   'two_handed',  'two_h_sword',           '2H Sword',              'Two-handed sword — reach and damage'),
    ('weapons',   'two_handed',  'two_h_axe',             '2H Axe',                'Two-handed axe — massive cleave damage'),
    ('weapons',   'two_handed',  'two_h_mace',            '2H Mace',               'Two-handed mace — high stun and armor-break'),
    ('weapons',   'two_handed',  'staff',                 'Staff',                 'Two-handed spell weapon — intelligence-based'),
    ('weapons',   'two_handed',  'bow',                   'Bow',                   'Two-handed ranged weapon — dexterity-based'),
    ('weapons',   'two_handed',  'crossbow',              'Crossbow',              'Mechanical two-handed ranged weapon'),

    -- ── Off-hand ────────────────────────────────────────────────────────────
    ('weapons',   'off_hand',    'shield',                'Shield',                'Defensive off-hand — blocks and armour'),
    ('weapons',   'off_hand',    'quiver',                'Quiver',                'Ammunition off-hand for bows'),
    ('weapons',   'off_hand',    'focus',                 'Focus',                 'Caster off-hand — amplifies spells')

) AS v(subdomain_name, category_machine_name, machine_name, name, description)
JOIN game_subdomain gsd ON gsd.machine_name = v.subdomain_name
JOIN game_category  gc  ON gc.machine_name  = v.category_machine_name
JOIN game_subcategory gsc ON gsc.machine_name = v.machine_name;
