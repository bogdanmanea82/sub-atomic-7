// src/model/universal/sub-atoms/deserialization/deserialize-integer.ts
// Passes database integer through, preserving null

export function deserializeInteger(value: number | null): number | null {
    if(value === null) return null;
    return value;
}