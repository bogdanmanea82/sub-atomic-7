#!/usr/bin/env bash
# seeds/seed-modifiers-only.sh
# Wipes item_modifier data and reseeds with 4-tier modifiers + auto-bindings.
# Hierarchy, stats, characters, formulas are NOT touched.
# Usage: ./seeds/seed-modifiers-only.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load .env if DATABASE_URL is not already set
if [ -z "${DATABASE_URL:-}" ]; then
  ENV_FILE="$(dirname "$SCRIPT_DIR")/.env"
  if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | grep DATABASE_URL | xargs)
  fi
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL not set and .env not found."
  exit 1
fi

echo "Clearing modifier tables..."
psql "$DATABASE_URL" --quiet -c "
  DELETE FROM item_modifier_history;
  DELETE FROM item_modifier_binding;
  DELETE FROM item_modifier_tier;
  DELETE FROM item_modifier;
"

FILES=(
  "01-helpers.sql"
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

echo "Reseeding modifiers..."
for file in "${FILES[@]}"; do
  echo "  Running $file..."
  psql "$DATABASE_URL" -f "$SCRIPT_DIR/$file" --quiet --set ON_ERROR_STOP=on
done

echo ""
echo "Verifying counts..."
psql "$DATABASE_URL" --quiet --tuples-only -c "
  SELECT 'item_modifier:        ' || count(*) FROM item_modifier
  UNION ALL SELECT 'item_modifier_tier:   ' || count(*) FROM item_modifier_tier
  UNION ALL SELECT 'item_modifier_binding:' || count(*) FROM item_modifier_binding;
"

echo "Done."
