-- seeds/14-formulas.sql
-- Foundational attribute-to-stat derivations (PoE-style baseline).
-- expression references input stats by machine_name; evaluated by Layer 2.
--
-- strength → life:     every 2 STR grants +1 life (0.5 per point)
-- intelligence → mana: every 2 INT grants +1 mana (0.5 per point)
-- dexterity → accuracy: dex * 2 + level * 2 (compound: two inputs + level)

INSERT INTO formula (id, name, output_stat_id, expression, description, created_at, updated_at)
VALUES
  (gen_random_uuid(),
   'Strength to Life',
   (SELECT id FROM stat WHERE machine_name = 'life_max'),
   'strength * 0.5',
   'Each point of Strength grants 0.5 Maximum Life (every 2 Strength = +1 life).',
   now(), now()),

  (gen_random_uuid(),
   'Intelligence to Mana',
   (SELECT id FROM stat WHERE machine_name = 'mana_max'),
   'intelligence * 0.5',
   'Each point of Intelligence grants 0.5 Maximum Mana (every 2 Intelligence = +1 mana).',
   now(), now()),

  (gen_random_uuid(),
   'Dexterity to Accuracy',
   (SELECT id FROM stat WHERE machine_name = 'accuracy_rating'),
   'dexterity * 2 + level * 2',
   'Accuracy Rating scales with both Dexterity and character level.',
   now(), now());
