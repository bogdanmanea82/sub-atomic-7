-- seeds/13-character-stat-bases.sql
-- 69 junction rows: 3 character classes × 23 stats.
--
-- base_value follows stat data_type conventions:
--   multiplier stats (attack_speed, cast_speed, movement_speed): 100 = 1.0x
--   percentage stats (mana_regen): 175 = 1.75% per second
--   raw stats: value is the final integer
--
-- Uses a VALUES table joined to character and stat by machine_name,
-- so this file remains correct even if UUIDs are regenerated.

INSERT INTO character_stat_base (id, character_id, stat_id, base_value, created_at, updated_at)
SELECT
  gen_random_uuid(),
  c.id,
  s.id,
  v.base_value,
  now(),
  now()
FROM (
  VALUES
    -- ── Warrior ─────────────────────────────────────────────────────────────
    ('warrior', 'strength',                   32),
    ('warrior', 'dexterity',                  14),
    ('warrior', 'intelligence',               14),
    ('warrior', 'life_max',                   50),
    ('warrior', 'mana_max',                   40),
    ('warrior', 'life_regen',                  0),
    ('warrior', 'mana_regen',                175),
    ('warrior', 'base_damage',                 8),
    ('warrior', 'attack_speed',              100),
    ('warrior', 'cast_speed',                100),
    ('warrior', 'critical_strike_chance',      5),
    ('warrior', 'critical_strike_multiplier', 150),
    ('warrior', 'accuracy_rating',             0),
    ('warrior', 'attack_range',                1),
    ('warrior', 'armor_rating',               10),
    ('warrior', 'evasion_rating',              0),
    ('warrior', 'block_chance',                0),
    ('warrior', 'fire_resistance',             0),
    ('warrior', 'cold_resistance',             0),
    ('warrior', 'lightning_resistance',        0),
    ('warrior', 'chaos_resistance',            0),
    ('warrior', 'movement_speed',            100),
    ('warrior', 'stun_threshold',             50),

    -- ── Hunter ──────────────────────────────────────────────────────────────
    ('hunter', 'strength',                    20),
    ('hunter', 'dexterity',                   32),
    ('hunter', 'intelligence',                14),
    ('hunter', 'life_max',                    42),
    ('hunter', 'mana_max',                    45),
    ('hunter', 'life_regen',                   0),
    ('hunter', 'mana_regen',                 175),
    ('hunter', 'base_damage',                  6),
    ('hunter', 'attack_speed',               110),
    ('hunter', 'cast_speed',                 100),
    ('hunter', 'critical_strike_chance',       6),
    ('hunter', 'critical_strike_multiplier',  150),
    ('hunter', 'accuracy_rating',             10),
    ('hunter', 'attack_range',                10),
    ('hunter', 'armor_rating',                 0),
    ('hunter', 'evasion_rating',              15),
    ('hunter', 'block_chance',                 0),
    ('hunter', 'fire_resistance',              0),
    ('hunter', 'cold_resistance',              0),
    ('hunter', 'lightning_resistance',         0),
    ('hunter', 'chaos_resistance',             0),
    ('hunter', 'movement_speed',             100),
    ('hunter', 'stun_threshold',              42),

    -- ── Wizard ──────────────────────────────────────────────────────────────
    ('wizard', 'strength',                    14),
    ('wizard', 'dexterity',                   14),
    ('wizard', 'intelligence',                32),
    ('wizard', 'life_max',                    34),
    ('wizard', 'mana_max',                    60),
    ('wizard', 'life_regen',                   0),
    ('wizard', 'mana_regen',                 225),
    ('wizard', 'base_damage',                  4),
    ('wizard', 'attack_speed',                90),
    ('wizard', 'cast_speed',                 110),
    ('wizard', 'critical_strike_chance',       5),
    ('wizard', 'critical_strike_multiplier',  150),
    ('wizard', 'accuracy_rating',              0),
    ('wizard', 'attack_range',                 1),
    ('wizard', 'armor_rating',                 0),
    ('wizard', 'evasion_rating',               0),
    ('wizard', 'block_chance',                 0),
    ('wizard', 'fire_resistance',              0),
    ('wizard', 'cold_resistance',              0),
    ('wizard', 'lightning_resistance',         0),
    ('wizard', 'chaos_resistance',             0),
    ('wizard', 'movement_speed',             100),
    ('wizard', 'stun_threshold',              34)

) AS v(character_name, stat_name, base_value)
JOIN "character" c ON c.machine_name = v.character_name
JOIN stat s ON s.machine_name = v.stat_name;
