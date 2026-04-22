// src/config/molecules/modifier/status-fields.ts
// Active / disabled toggle for all modifier domain types.
//
// A single-field molecule: is_active controls whether a modifier is live in
// the game. Kept separate from archive-fields because this field is always
// in active use, while archive fields belong to the deferred Observability
// layer and are intentionally hidden from forms.

import { IS_ACTIVE_FIELD_ATOM } from "../../universal/atoms";

export const MODIFIER_STATUS_FIELDS = [
  IS_ACTIVE_FIELD_ATOM,
] as const;
