// src/config/universal/atoms/sort-order-field-atom.ts
// Sort order field atom — shared by all hierarchy entities (domain, subdomain, category, subcategory)

import type { IntegerFieldConfig } from "../../types";

export const SORT_ORDER_FIELD_ATOM: IntegerFieldConfig = {
  type: "integer",
  name: "sort_order",
  label: "Sort Order",
  min: 0,
  max: 99999,
  defaultValue: 1000,
  required: true,
  displayFormat: "number",
  listOrder: 10,
};
