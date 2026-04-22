// src/config/molecules/modifier/lifecycle-fields.ts
// RETIRED — split into two focused molecules:
//   MODIFIER_STATUS_FIELDS  → ./status-fields.ts  (is_active — always active)
//   MODIFIER_ARCHIVE_FIELDS → ./archive-fields.ts  (archived_at/reason — deferred Observability layer)
//
// Nothing should import MODIFIER_LIFECYCLE_FIELDS. Import the two separate atoms instead.
