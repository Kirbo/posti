import type { PostiConfig } from "../config/schema.js";
import { quoteIdentifier } from "./operations.js";

interface TableColumn {
  name: string;
  type: string;
}

const addressColumns: TableColumn[] = [
  { name: "id", type: "INTEGER PRIMARY KEY AUTOINCREMENT" },
  { name: "record", type: "VARCHAR(5)" },
  { name: "updated_at", type: "DATE" },
  { name: "postal_code", type: "VARCHAR(5)" },
  { name: "post_office_name", type: "VARCHAR(30)" },
  { name: "post_office_name_swe", type: "VARCHAR(30)" },
  { name: "post_office_short_name", type: "VARCHAR(12)" },
  { name: "post_office_short_name_swe", type: "VARCHAR(12)" },
  { name: "address", type: "VARCHAR(30)" },
  { name: "address_swe", type: "VARCHAR(30)" },
  { name: "empty1", type: "VARCHAR(12)" },
  { name: "empty2", type: "VARCHAR(12)" },
  { name: "odd_even", type: "INTEGER" },
  { name: "smallest_building_number_1", type: "INTEGER" },
  { name: "smallest_delivery_letter_1", type: "VARCHAR(1)" },
  { name: "divider_1", type: "VARCHAR(1)" },
  { name: "smallest_building_number_2", type: "INTEGER" },
  { name: "smallest_delivery_letter_2", type: "VARCHAR(1)" },
  { name: "highest_building_number_1", type: "INTEGER" },
  { name: "highest_delivery_letter_1", type: "VARCHAR(1)" },
  { name: "divider_2", type: "VARCHAR(1)" },
  { name: "highest_building_number_2", type: "INTEGER" },
  { name: "highest_delivery_letter_2", type: "VARCHAR(1)" },
  { name: "municipality_id_code", type: "VARCHAR(3)" },
  { name: "municipality_name", type: "VARCHAR(20)" },
  { name: "municipality_name_swe", type: "VARCHAR(20)" },
  { name: "created_at", type: "TIMESTAMP" },
  { name: "updated_at_row", type: "TIMESTAMP" },
];

const zipcodeColumns: TableColumn[] = [
  { name: "id", type: "INTEGER PRIMARY KEY AUTOINCREMENT" },
  { name: "record", type: "VARCHAR(5)" },
  { name: "updated_at", type: "DATE" },
  { name: "postal_code", type: "VARCHAR(5)" },
  { name: "post_office_name", type: "VARCHAR(30)" },
  { name: "post_office_name_swe", type: "VARCHAR(30)" },
  { name: "post_office_short_name", type: "VARCHAR(12)" },
  { name: "post_office_short_name_swe", type: "VARCHAR(12)" },
  { name: "entry_into_force_at", type: "DATE" },
  { name: "type_code", type: "INTEGER" },
  { name: "region_id", type: "VARCHAR(5)" },
  { name: "region_name", type: "VARCHAR(30)" },
  { name: "region_name_swe", type: "VARCHAR(30)" },
  { name: "municipality_id_code", type: "VARCHAR(3)" },
  { name: "municipality_name", type: "VARCHAR(20)" },
  { name: "municipality_name_swe", type: "VARCHAR(20)" },
  { name: "municipality_language", type: "INTEGER" },
  { name: "created_at", type: "TIMESTAMP" },
  { name: "updated_at_row", type: "TIMESTAMP" },
];

const zipcodeChangeColumns: TableColumn[] = [
  { name: "id", type: "INTEGER PRIMARY KEY AUTOINCREMENT" },
  { name: "record", type: "VARCHAR(4)" },
  { name: "level", type: "VARCHAR(1)" },
  { name: "updated_at", type: "DATE" },
  { name: "extraction_start_at", type: "DATE" },
  { name: "extraction_end_at", type: "DATE" },
  { name: "old_postal_code", type: "VARCHAR(5)" },
  { name: "old_post_office_name", type: "VARCHAR(30)" },
  { name: "old_post_office_name_swe", type: "VARCHAR(30)" },
  { name: "old_post_office_short_name", type: "VARCHAR(12)" },
  { name: "old_post_office_short_name_swe", type: "VARCHAR(12)" },
  { name: "reserved", type: "VARCHAR(131)" },
  { name: "postal_code", type: "VARCHAR(5)" },
  { name: "post_office_name", type: "VARCHAR(30)" },
  { name: "post_office_name_swe", type: "VARCHAR(30)" },
  { name: "post_office_short_name", type: "VARCHAR(12)" },
  { name: "post_office_short_name_swe", type: "VARCHAR(12)" },
  { name: "municipality_id_code", type: "VARCHAR(3)" },
  { name: "municipality_name", type: "VARCHAR(20)" },
  { name: "municipality_name_swe", type: "VARCHAR(20)" },
  { name: "region_id", type: "VARCHAR(2)" },
  { name: "region_name", type: "VARCHAR(30)" },
  { name: "region_name_swe", type: "VARCHAR(30)" },
  { name: "changed_at", type: "DATE" },
  { name: "event_code", type: "INTEGER" },
  { name: "created_at", type: "TIMESTAMP" },
  { name: "updated_at_row", type: "TIMESTAMP" },
];

const tableColumns: Record<string, TableColumn[]> = {
  addresses: addressColumns,
  postalcodes: zipcodeColumns,
  postalcode_changes: zipcodeChangeColumns,
};

interface IndexDefinition {
  name: string;
  columns: string[];
}

// Meaningful indexes for realistic query patterns.
// The UNIQUE constraint (defined separately) already covers upsert conflict detection.
// These indexes target lookup, filtering, and join patterns:
//   - Single-column indexes for common WHERE/JOIN columns
//   - Composite indexes for queries that filter on multiple columns together
const tableIndexes: Record<string, IndexDefinition[]> = {
  addresses: [
    // Lookup by postal code (most common query)
    { name: "postal_code", columns: ["postal_code"] },
    // Address lookup: postal code + street name together
    { name: "postal_code_address", columns: ["postal_code", "address"] },
    // Filter/join by municipality
    { name: "municipality_id_code", columns: ["municipality_id_code"] },
    // Search by post office name (Finnish)
    { name: "post_office_name", columns: ["post_office_name"] },
    // Search by post office name (Swedish)
    { name: "post_office_name_swe", columns: ["post_office_name_swe"] },
    // Search by street name
    { name: "address", columns: ["address"] },
    { name: "address_swe", columns: ["address_swe"] },
  ],
  postalcodes: [
    // postal_code is already UNIQUE — no separate index needed
    // Filter by type (normal, PO box, corporate, etc.)
    { name: "type_code", columns: ["type_code"] },
    // Filter/join by municipality
    { name: "municipality_id_code", columns: ["municipality_id_code"] },
    // Filter by region
    { name: "region_id", columns: ["region_id"] },
    // Search by post office name
    { name: "post_office_name", columns: ["post_office_name"] },
    { name: "post_office_name_swe", columns: ["post_office_name_swe"] },
    // Filter by municipality language distribution
    { name: "municipality_language", columns: ["municipality_language"] },
  ],
  postalcode_changes: [
    // Lookup changes for a specific new postal code
    { name: "postal_code", columns: ["postal_code"] },
    // Lookup changes for a specific old postal code
    { name: "old_postal_code", columns: ["old_postal_code"] },
    // Date range queries on when changes happened
    { name: "changed_at", columns: ["changed_at"] },
    // Filter by type of change event
    { name: "event_code", columns: ["event_code"] },
    // Filter/join by municipality
    { name: "municipality_id_code", columns: ["municipality_id_code"] },
  ],
};

const uniqueKeys: Record<string, string[]> = {
  addresses: [
    "postal_code",
    "address",
    "odd_even",
    "smallest_building_number_1",
    "smallest_building_number_2",
    "highest_building_number_1",
    "highest_building_number_2",
  ],
  postalcodes: ["postal_code"],
  postalcode_changes: ["old_postal_code", "postal_code", "changed_at", "event_code"],
};

function getAutoIncrementType(dialect: PostiConfig["dialect"]): string {
  switch (dialect) {
    case "sqlite":
      return "INTEGER PRIMARY KEY AUTOINCREMENT";
    case "mysql":
    case "mariadb":
      return "INTEGER PRIMARY KEY AUTO_INCREMENT";
    case "postgres":
      return "SERIAL PRIMARY KEY";
  }
}

function getTimestampDefault(dialect: PostiConfig["dialect"]): string {
  switch (dialect) {
    case "sqlite":
      return "TIMESTAMP DEFAULT (datetime('now'))";
    case "mysql":
    case "mariadb":
      return "TIMESTAMP DEFAULT CURRENT_TIMESTAMP";
    case "postgres":
      return "TIMESTAMP DEFAULT NOW()";
  }
}

export function getCreateTableSQL(dialect: PostiConfig["dialect"], tableName: string, tableType: string): string {
  const columns = tableColumns[tableType];
  if (!columns) throw new Error(`Unknown table type: ${tableType}`);

  const quoted = quoteIdentifier(dialect, tableName);
  const uniqs = uniqueKeys[tableType] ?? [];

  const colDefs = columns.map((col) => {
    const qName = quoteIdentifier(dialect, col.name);
    if (col.name === "id") {
      return `  ${qName} ${getAutoIncrementType(dialect)}`;
    }
    if (col.name === "created_at" || col.name === "updated_at_row") {
      return `  ${qName} ${getTimestampDefault(dialect)}`;
    }
    return `  ${qName} ${col.type}`;
  });

  if (uniqs.length > 0) {
    const uniqCols = uniqs.map((c) => quoteIdentifier(dialect, c)).join(", ");
    colDefs.push(`  UNIQUE (${uniqCols})`);
  }

  const createTable = `CREATE TABLE IF NOT EXISTS ${quoted} (\n${colDefs.join(",\n")}\n)`;

  // Generate CREATE INDEX statements
  const indexes = tableIndexes[tableType] ?? [];
  const indexStatements = indexes.map((idx) => {
    const idxName = quoteIdentifier(dialect, `idx_${tableName}_${idx.name}`);
    const idxCols = idx.columns.map((c) => quoteIdentifier(dialect, c)).join(", ");
    // MySQL/MariaDB do not support CREATE INDEX IF NOT EXISTS
    const ifNotExists = dialect === "mysql" || dialect === "mariadb" ? "" : "IF NOT EXISTS ";
    return `CREATE INDEX ${ifNotExists}${idxName} ON ${quoted} (${idxCols})`;
  });

  return [createTable, ...indexStatements].join(";\n");
}

export type SqlValue = string | number | null;

export function getInsertSQL(
  dialect: PostiConfig["dialect"],
  tableName: string,
  rows: Record<string, SqlValue>[],
): { sql: string; values: SqlValue[] } {
  if (rows.length === 0) return { sql: "", values: [] };

  const firstRow = rows[0];
  if (!firstRow) return { sql: "", values: [] };
  const columnNames = Object.keys(firstRow);
  const quoted = quoteIdentifier(dialect, tableName);
  const quotedCols = columnNames.map((c) => quoteIdentifier(dialect, c)).join(", ");

  const values: SqlValue[] = [];
  const rowPlaceholders: string[] = [];

  for (const row of rows) {
    const placeholders: string[] = [];
    for (const col of columnNames) {
      values.push(row[col] ?? null);
      if (dialect === "postgres") {
        placeholders.push(`$${values.length}`);
      } else {
        placeholders.push("?");
      }
    }
    rowPlaceholders.push(`(${placeholders.join(", ")})`);
  }

  const sql = `INSERT INTO ${quoted} (${quotedCols}) VALUES ${rowPlaceholders.join(", ")}`;
  return { sql, values };
}

export function getUpsertSQL(
  dialect: PostiConfig["dialect"],
  tempTableName: string,
  finalTableName: string,
  tableType: string,
): string {
  const columns = tableColumns[tableType];
  if (!columns) throw new Error(`Unknown table type: ${tableType}`);

  const uniqs = uniqueKeys[tableType] ?? [];
  const dataColumns = columns.filter((c) => c.name !== "id" && c.name !== "created_at" && c.name !== "updated_at_row");
  const quotedFinal = quoteIdentifier(dialect, finalTableName);
  const quotedTemp = quoteIdentifier(dialect, tempTableName);

  const colNames = dataColumns.map((c) => quoteIdentifier(dialect, c.name));
  const selectCols = colNames.join(", ");

  switch (dialect) {
    case "sqlite": {
      // SQLite doesn't support INSERT...SELECT...ON CONFLICT
      // Use INSERT OR REPLACE which handles the upsert behavior
      return `INSERT OR REPLACE INTO ${quotedFinal} (${selectCols})
SELECT ${selectCols} FROM ${quotedTemp}`;
    }
    case "mysql":
    case "mariadb": {
      const updateSet = dataColumns
        .filter((c) => !uniqs.includes(c.name))
        .map((c) => `${quoteIdentifier(dialect, c.name)} = VALUES(${quoteIdentifier(dialect, c.name)})`)
        .join(", ");

      return `INSERT INTO ${quotedFinal} (${selectCols})
SELECT ${selectCols} FROM ${quotedTemp}
ON DUPLICATE KEY UPDATE ${updateSet}, ${quoteIdentifier(dialect, "updated_at_row")} = CURRENT_TIMESTAMP`;
    }
    case "postgres": {
      const conflictCols = uniqs.map((c) => quoteIdentifier(dialect, c)).join(", ");
      const updateSet = dataColumns
        .filter((c) => !uniqs.includes(c.name))
        .map((c) => `${quoteIdentifier(dialect, c.name)} = EXCLUDED.${quoteIdentifier(dialect, c.name)}`)
        .join(", ");

      return `INSERT INTO ${quotedFinal} (${selectCols})
SELECT ${selectCols} FROM ${quotedTemp}
ON CONFLICT (${conflictCols})
DO UPDATE SET ${updateSet}, ${quoteIdentifier(dialect, "updated_at_row")} = NOW()`;
    }
  }
}

export { tableIndexes };
