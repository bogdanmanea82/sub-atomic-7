#!/usr/bin/env bash
# seeds/seed.sh
# Orchestrates seed data files in dependency order.
# Usage: ./seeds/seed.sh
# Requires DATABASE_URL environment variable.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set."
  exit 1
fi

FILES=(
  "00-clean.sql"
  "01-helpers.sql"
  "11-stats.sql"
  "02-hierarchy.sql"
  "03-modifiers-weapons.sql"
  "04-modifiers-body-armour.sql"
  "05-modifiers-helmets.sql"
  "06-modifiers-boots.sql"
  "07-modifiers-gloves.sql"
  "08-modifiers-belts.sql"
  "09-modifiers-shields.sql"
  "10-modifiers-jewellery.sql"
  "12-characters.sql"
  "13-character-stat-bases.sql"
  "14-formulas.sql"
  "99-cleanup.sql"
)

echo "Seeding database..."
for file in "${FILES[@]}"; do
  echo "  Running $file..."
  psql "$DATABASE_URL" -f "$SCRIPT_DIR/$file" --quiet --set ON_ERROR_STOP=on
done

echo ""
echo "Verifying counts..."
psql "$DATABASE_URL" --quiet --tuples-only -c "
  SELECT 'stat:                 ' || count(*) FROM stat
  UNION ALL SELECT 'game_domain:          ' || count(*) FROM game_domain
  UNION ALL SELECT 'game_subdomain:       ' || count(*) FROM game_subdomain
  UNION ALL SELECT 'game_category:        ' || count(*) FROM game_category
  UNION ALL SELECT 'game_subcategory:     ' || count(*) FROM game_subcategory
  UNION ALL SELECT 'item_modifier:        ' || count(*) FROM item_modifier
  UNION ALL SELECT 'item_modifier_tier:   ' || count(*) FROM item_modifier_tier
  UNION ALL SELECT 'character:            ' || count(*) FROM \"character\"
  UNION ALL SELECT 'character_stat_base:  ' || count(*) FROM character_stat_base
  UNION ALL SELECT 'formula:              ' || count(*) FROM formula;
"

echo "Done."
