import type { FieldDefinition } from "./field-definitions.js";

export function castValue(value: string, type: FieldDefinition["type"]): string | number | null {
  if (value === "") {
    return null;
  }

  switch (type) {
    case "integer": {
      const num = Number.parseInt(value, 10);
      return Number.isNaN(num) ? null : num;
    }
    case "date": {
      const matches = value.match(/(\d{4})(\d{2})(\d{2})/);
      return matches ? `${matches[1]}-${matches[2]}-${matches[3]}` : null;
    }
    default:
      return value;
  }
}

export function parseLine(line: string, fields: FieldDefinition[]): Record<string, string | number | null> {
  const row: Record<string, string | number | null> = {};

  for (const field of fields) {
    if (field.start !== undefined) {
      const raw = line.substring(field.start - 1, field.start - 1 + field.length).trim();
      row[field.name] = castValue(raw, field.type);
    }
  }

  return row;
}
