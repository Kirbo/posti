import { describe, expect, it } from "vitest";
import { getCreateTableSQL, tableIndexes } from "../../src/db/dialects.js";

function getIndexes(table: string) {
  const indexes = tableIndexes[table];
  if (!indexes) throw new Error(`No indexes for table: ${table}`);
  return indexes;
}

describe("table indexes", () => {
  describe("addresses indexes", () => {
    it("should have index on postal_code for lookups by zip", () => {
      const indexes = getIndexes("addresses");
      const idx = indexes.find((i) => i.columns.includes("postal_code") && i.columns.length === 1);
      expect(idx).toBeDefined();
    });

    it("should have composite index on postal_code + address for address lookups", () => {
      const indexes = getIndexes("addresses");
      const idx = indexes.find((i) => i.columns.includes("postal_code") && i.columns.includes("address"));
      expect(idx).toBeDefined();
    });

    it("should have index on municipality_id_code for municipality filtering", () => {
      const indexes = getIndexes("addresses");
      const idx = indexes.find((i) => i.columns.includes("municipality_id_code"));
      expect(idx).toBeDefined();
    });

    it("should have index on post_office_name for name searches", () => {
      const indexes = getIndexes("addresses");
      const idx = indexes.find((i) => i.columns.includes("post_office_name"));
      expect(idx).toBeDefined();
    });
  });

  describe("postalcodes indexes", () => {
    it("should have index on type_code for filtering by type", () => {
      const indexes = getIndexes("postalcodes");
      const idx = indexes.find((i) => i.columns.includes("type_code"));
      expect(idx).toBeDefined();
    });

    it("should have index on municipality_id_code for municipality lookups", () => {
      const indexes = getIndexes("postalcodes");
      const idx = indexes.find((i) => i.columns.includes("municipality_id_code"));
      expect(idx).toBeDefined();
    });

    it("should have index on region_id for region filtering", () => {
      const indexes = getIndexes("postalcodes");
      const idx = indexes.find((i) => i.columns.includes("region_id"));
      expect(idx).toBeDefined();
    });

    it("should have index on post_office_name for name searches", () => {
      const indexes = getIndexes("postalcodes");
      const idx = indexes.find((i) => i.columns.includes("post_office_name"));
      expect(idx).toBeDefined();
    });
  });

  describe("postalcode_changes indexes", () => {
    it("should have index on postal_code for new code lookups", () => {
      const indexes = getIndexes("postalcode_changes");
      const idx = indexes.find((i) => i.columns.includes("postal_code") && !i.columns.includes("old_postal_code"));
      expect(idx).toBeDefined();
    });

    it("should have index on old_postal_code for old code lookups", () => {
      const indexes = getIndexes("postalcode_changes");
      const idx = indexes.find((i) => i.columns.includes("old_postal_code") && !i.columns.includes("postal_code"));
      expect(idx).toBeDefined();
    });

    it("should have index on changed_at for date range queries", () => {
      const indexes = getIndexes("postalcode_changes");
      const idx = indexes.find((i) => i.columns.includes("changed_at"));
      expect(idx).toBeDefined();
    });

    it("should have index on event_code for filtering by event type", () => {
      const indexes = getIndexes("postalcode_changes");
      const idx = indexes.find((i) => i.columns.includes("event_code"));
      expect(idx).toBeDefined();
    });
  });

  describe("CREATE TABLE SQL includes indexes", () => {
    it("should generate CREATE INDEX statements for sqlite", () => {
      const sql = getCreateTableSQL("sqlite", "posti_addresses", "addresses");
      expect(sql).toContain("CREATE INDEX");
      expect(sql).toContain("idx_posti_addresses_postal_code");
    });

    it("should generate CREATE INDEX statements for postgres", () => {
      const sql = getCreateTableSQL("postgres", "posti_postalcodes", "postalcodes");
      expect(sql).toContain("CREATE INDEX");
      expect(sql).toContain("idx_posti_postalcodes_type_code");
    });

    it("should generate CREATE INDEX statements for mysql", () => {
      const sql = getCreateTableSQL("mysql", "posti_postalcode_changes", "postalcode_changes");
      expect(sql).toContain("CREATE INDEX");
      expect(sql).toContain("idx_posti_postalcode_changes_changed_at");
    });

    it("should not create indexes on empty or reserved columns", () => {
      const sql = getCreateTableSQL("sqlite", "posti_addresses", "addresses");
      const indexLines = sql.split("\n").filter((l) => l.includes("CREATE INDEX"));
      const indexText = indexLines.join("\n");
      expect(indexText).not.toContain("empty1");
      expect(indexText).not.toContain("empty2");

      const sqlChanges = getCreateTableSQL("sqlite", "posti_postalcode_changes", "postalcode_changes");
      const changeIndexLines = sqlChanges.split("\n").filter((l) => l.includes("CREATE INDEX"));
      const changeIndexText = changeIndexLines.join("\n");
      expect(changeIndexText).not.toContain("reserved");
    });
  });
});
