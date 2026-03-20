import { describe, expect, it } from "vitest";
import { getCreateTableSQL, getInsertSQL, getUpsertSQL } from "../../src/db/dialects.js";
import { quoteIdentifier } from "../../src/db/operations.js";

describe("quoteIdentifier", () => {
  it("should wrap name in backticks for mysql", () => {
    expect(quoteIdentifier("mysql", "table_name")).toBe("`table_name`");
  });

  it("should wrap name in backticks for mariadb", () => {
    expect(quoteIdentifier("mariadb", "table_name")).toBe("`table_name`");
  });

  it("should wrap name in double quotes for postgres", () => {
    expect(quoteIdentifier("postgres", "table_name")).toBe('"table_name"');
  });

  it("should wrap name in double quotes for sqlite", () => {
    expect(quoteIdentifier("sqlite", "table_name")).toBe('"table_name"');
  });

  it("should escape backticks in mysql identifiers", () => {
    expect(quoteIdentifier("mysql", "table`name")).toBe("`table``name`");
  });

  it("should escape double quotes in postgres identifiers", () => {
    expect(quoteIdentifier("postgres", 'table"name')).toBe('"table""name"');
  });

  it("should escape double quotes in sqlite identifiers", () => {
    expect(quoteIdentifier("sqlite", 'table"name')).toBe('"table""name"');
  });
});

describe("getInsertSQL", () => {
  it("should generate parameterized INSERT with ? for mysql", () => {
    const { sql, values } = getInsertSQL("mysql", "test_table", [{ col1: "val1", col2: 42 }]);
    expect(sql).toContain("INSERT INTO `test_table`");
    expect(sql).toContain("`col1`");
    expect(sql).toContain("`col2`");
    expect(sql).toContain("?");
    expect(sql).not.toContain("$");
    expect(values).toEqual(["val1", 42]);
  });

  it("should generate parameterized INSERT with $N for postgres", () => {
    const { sql, values } = getInsertSQL("postgres", "test_table", [{ col1: "val1", col2: 42 }]);
    expect(sql).toContain('INSERT INTO "test_table"');
    expect(sql).toContain('"col1"');
    expect(sql).toContain('"col2"');
    expect(sql).toContain("$1");
    expect(sql).toContain("$2");
    expect(values).toEqual(["val1", 42]);
  });

  it("should generate parameterized INSERT with ? for sqlite", () => {
    const { sql, values } = getInsertSQL("sqlite", "test_table", [{ col1: "val1" }]);
    expect(sql).toContain('"test_table"');
    expect(sql).toContain('"col1"');
    expect(sql).toContain("?");
    expect(values).toEqual(["val1"]);
  });

  it("should return empty sql for empty rows", () => {
    const { sql, values } = getInsertSQL("sqlite", "test_table", []);
    expect(sql).toBe("");
    expect(values).toEqual([]);
  });

  it("should handle null values", () => {
    const { sql, values } = getInsertSQL("sqlite", "test_table", [{ col1: null, col2: "val" }]);
    expect(values).toEqual([null, "val"]);
    expect(sql).toContain("?");
  });

  it("should handle multiple rows", () => {
    const rows = [
      { col1: "a", col2: 1 },
      { col1: "b", col2: 2 },
    ];
    const { sql, values } = getInsertSQL("mysql", "test_table", rows);
    expect(values).toEqual(["a", 1, "b", 2]);
    // Should have two sets of placeholders
    const placeholderSets = sql.match(/\([\s\S]*?\)/g);
    // Column list + 2 value sets
    expect(placeholderSets?.length).toBe(3);
  });

  it("should handle multiple rows with postgres $N placeholders", () => {
    const rows = [
      { col1: "a", col2: 1 },
      { col1: "b", col2: 2 },
    ];
    const { sql, values } = getInsertSQL("postgres", "test_table", rows);
    expect(sql).toContain("$1");
    expect(sql).toContain("$4");
    expect(values).toEqual(["a", 1, "b", 2]);
  });
});

describe("getCreateTableSQL", () => {
  it("should throw for unknown table type", () => {
    expect(() => getCreateTableSQL("sqlite", "test", "nonexistent")).toThrow("Unknown table type");
  });

  it("should use AUTOINCREMENT for sqlite", () => {
    const sql = getCreateTableSQL("sqlite", "test", "postalcodes");
    expect(sql).toContain("AUTOINCREMENT");
  });

  it("should use AUTO_INCREMENT for mysql", () => {
    const sql = getCreateTableSQL("mysql", "test", "postalcodes");
    expect(sql).toContain("AUTO_INCREMENT");
  });

  it("should use SERIAL for postgres", () => {
    const sql = getCreateTableSQL("postgres", "test", "postalcodes");
    expect(sql).toContain("SERIAL PRIMARY KEY");
  });

  it("should include UNIQUE constraint with quoted columns", () => {
    const sql = getCreateTableSQL("sqlite", "test", "postalcodes");
    expect(sql).toContain('UNIQUE ("postal_code")');
  });

  it("should quote table name and all column names", () => {
    const sql = getCreateTableSQL("mysql", "test", "postalcodes");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS `test`");
    expect(sql).toContain("`postal_code`");
    expect(sql).toContain("`post_office_name`");
    expect(sql).toContain("`id`");
  });

  it("should include CREATE INDEX IF NOT EXISTS for sqlite", () => {
    const sql = getCreateTableSQL("sqlite", "test", "addresses");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS");
  });

  it("should include CREATE INDEX IF NOT EXISTS for postgres", () => {
    const sql = getCreateTableSQL("postgres", "test", "addresses");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS");
  });

  it("should omit IF NOT EXISTS from CREATE INDEX for mysql", () => {
    const sql = getCreateTableSQL("mysql", "test", "addresses");
    expect(sql).toContain("CREATE INDEX ");
    expect(sql).not.toContain("CREATE INDEX IF NOT EXISTS");
  });

  it("should omit IF NOT EXISTS from CREATE INDEX for mariadb", () => {
    const sql = getCreateTableSQL("mariadb", "test", "addresses");
    expect(sql).toContain("CREATE INDEX ");
    expect(sql).not.toContain("CREATE INDEX IF NOT EXISTS");
  });
});

describe("getUpsertSQL", () => {
  it("should throw for unknown table type", () => {
    expect(() => getUpsertSQL("sqlite", "temp", "final", "nonexistent")).toThrow("Unknown table type");
  });

  it("should use INSERT OR REPLACE for sqlite with quoted identifiers", () => {
    const sql = getUpsertSQL("sqlite", "temp_table", "final_table", "postalcodes");
    expect(sql).toContain('INSERT OR REPLACE INTO "final_table"');
    expect(sql).toContain('FROM "temp_table"');
    expect(sql).toContain('"postal_code"');
    expect(sql).toContain('"post_office_name"');
  });

  it("should use ON DUPLICATE KEY UPDATE for mysql with quoted identifiers", () => {
    const sql = getUpsertSQL("mysql", "temp_table", "final_table", "postalcodes");
    expect(sql).toContain("ON DUPLICATE KEY UPDATE");
    expect(sql).toContain("INTO `final_table`");
    expect(sql).toContain("FROM `temp_table`");
    expect(sql).toContain("`post_office_name` = VALUES(`post_office_name`)");
    expect(sql).toContain("`updated_at_row`");
  });

  it("should use ON CONFLICT DO UPDATE for postgres with quoted identifiers", () => {
    const sql = getUpsertSQL("postgres", "temp_table", "final_table", "postalcodes");
    expect(sql).toContain('ON CONFLICT ("postal_code")');
    expect(sql).toContain("DO UPDATE SET");
    expect(sql).toContain('"post_office_name" = EXCLUDED."post_office_name"');
    expect(sql).toContain('"updated_at_row"');
  });
});
