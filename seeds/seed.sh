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
  "02-hierarchy.sql"
  "03-modifiers-weapons.sql"
  "04-modifiers-body-armour.sql"
  "05-modifiers-helmets.sql"
  "06-modifiers-boots.sql"
  "07-modifiers-gloves.sql"
  "08-modifiers-belts.sql"
  "09-modifiers-shields.sql"
  "10-modifiers-jewellery.sql"
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
  SELECT 'game_domain:       ' || count(*) FROM game_domain
  UNION ALL SELECT 'game_subdomain:    ' || count(*) FROM game_subdomain
  UNION ALL SELECT 'game_category:     ' || count(*) FROM game_category
  UNION ALL SELECT 'game_subcategory:  ' || count(*) FROM game_subcategory
  UNION ALL SELECT 'modifier:          ' || count(*) FROM modifier
  UNION ALL SELECT 'modifier_tier:     ' || count(*) FROM modifier_tier;
"

echo "Done."
