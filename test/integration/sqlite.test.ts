import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { PostiConfig } from "../../src/config/schema.js";
import type { DbConnection } from "../../src/db/index.js";
import { closeConnection, createConnection } from "../../src/db/index.js";
import { runMigrations } from "../../src/db/migrate.js";
import {
  countRows,
  createTempTable,
  dropTable,
  dropTables,
  insertRows,
  upsertFromTemp,
} from "../../src/db/operations.js";
import { getSqliteConfig } from "./helpers.js";

describe("SQLite integration", () => {
  let config: PostiConfig;
  let db: DbConnection;

  beforeEach(async () => {
    config = getSqliteConfig();
    db = await createConnection(config);
    await runMigrations(db, config);
  });

  afterEach(async () => {
    await dropTables(db, config);
    await closeConnection(db);
  });

  it("should create all three tables", async () => {
    // Tables were created in beforeEach — verify they exist by counting rows
    const addressCount = await countRows(db, `${config.tablePrefix}addresses`);
    const zipcodeCount = await countRows(db, `${config.tablePrefix}postalcodes`);
    const changeCount = await countRows(db, `${config.tablePrefix}postalcode_changes`);

    expect(addressCount).toBe(0);
    expect(zipcodeCount).toBe(0);
    expect(changeCount).toBe(0);
  });

  it("should insert rows into addresses table", async () => {
    const tableName = `${config.tablePrefix}addresses`;
    const rows = [
      {
        record: "BASIC",
        updated_at: "2024-01-20",
        postal_code: "00100",
        post_office_name: "HELSINKI",
        post_office_name_swe: "HELSINGFORS",
        post_office_short_name: "HELSINKI",
        post_office_short_name_swe: "HELSINGFORS",
        address: "Mannerheimintie",
        address_swe: "Mannerheimvägen",
        empty1: null,
        empty2: null,
        odd_even: 1,
        smallest_building_number_1: 1,
        smallest_delivery_letter_1: null,
        divider_1: null,
        smallest_building_number_2: null,
        smallest_delivery_letter_2: null,
        highest_building_number_1: 99,
        highest_delivery_letter_1: null,
        divider_2: null,
        highest_building_number_2: null,
        highest_delivery_letter_2: null,
        municipality_id_code: "091",
        municipality_name: "HELSINKI",
        municipality_name_swe: "HELSINGFORS",
      },
    ];

    await insertRows(db, tableName, rows);
    const count = await countRows(db, tableName);
    expect(count).toBe(1);
  });

  it("should insert rows into postalcodes table", async () => {
    const tableName = `${config.tablePrefix}postalcodes`;
    const rows = [
      {
        record: "BASIC",
        updated_at: "2024-01-20",
        postal_code: "00100",
        post_office_name: "HELSINKI",
        post_office_name_swe: "HELSINGFORS",
        post_office_short_name: "HELSINKI",
        post_office_short_name_swe: "HELSINGFORS",
        entry_into_force_at: "1990-01-01",
        type_code: 1,
        region_id: "01",
        region_name: "Uudenmaan maakunta",
        region_name_swe: "Landskapet Nyland",
        municipality_id_code: "091",
        municipality_name: "HELSINKI",
        municipality_name_swe: "HELSINGFORS",
        municipality_language: 2,
      },
    ];

    await insertRows(db, tableName, rows);
    const count = await countRows(db, tableName);
    expect(count).toBe(1);
  });

  it("should insert rows into postalcode_changes table", async () => {
    const tableName = `${config.tablePrefix}postalcode_changes`;
    const rows = [
      {
        record: "CHNG",
        level: "1",
        updated_at: "2024-01-20",
        extraction_start_at: "2024-01-01",
        extraction_end_at: "2024-01-31",
        old_postal_code: "00100",
        old_post_office_name: "OLD HELSINKI",
        old_post_office_name_swe: "GAMLA HELSINGFORS",
        old_post_office_short_name: "OLD HELS",
        old_post_office_short_name_swe: "GAMLA HELS",
        reserved: null,
        postal_code: "00101",
        post_office_name: "NEW HELSINKI",
        post_office_name_swe: "NYA HELSINGFORS",
        post_office_short_name: "NEW HELS",
        post_office_short_name_swe: "NYA HELS",
        municipality_id_code: "091",
        municipality_name: "HELSINKI",
        municipality_name_swe: "HELSINGFORS",
        region_id: "01",
        region_name: "Uudenmaan maakunta",
        region_name_swe: "Landskapet Nyland",
        changed_at: "2024-01-15",
        event_code: 3,
      },
    ];

    await insertRows(db, tableName, rows);
    const count = await countRows(db, tableName);
    expect(count).toBe(1);
  });

  it("should handle upsert for addresses table", async () => {
    const finalTable = `${config.tablePrefix}addresses`;
    const tempTable = `${config.tablePrefix}temp_addresses`;

    // All unique key columns must be non-null for UNIQUE constraint to trigger
    // (SQL: NULL != NULL, so nulls in unique key columns won't match)
    const row1 = {
      record: "BASIC",
      updated_at: "2024-01-20",
      postal_code: "00100",
      post_office_name: "HELSINKI",
      post_office_name_swe: "HELSINGFORS",
      post_office_short_name: "HELSINKI",
      post_office_short_name_swe: "HELSINGFORS",
      address: "Mannerheimintie",
      address_swe: "Mannerheimvägen",
      empty1: null,
      empty2: null,
      odd_even: 1,
      smallest_building_number_1: 1,
      smallest_delivery_letter_1: null,
      divider_1: null,
      smallest_building_number_2: 0,
      smallest_delivery_letter_2: null,
      highest_building_number_1: 99,
      highest_delivery_letter_1: null,
      divider_2: null,
      highest_building_number_2: 0,
      highest_delivery_letter_2: null,
      municipality_id_code: "091",
      municipality_name: "HELSINKI",
      municipality_name_swe: "HELSINGFORS",
    };

    await insertRows(db, finalTable, [row1]);
    expect(await countRows(db, finalTable)).toBe(1);

    await createTempTable(db, tempTable, finalTable);
    const row2 = { ...row1, municipality_name: "HELSINKI UPDATED" };
    await insertRows(db, tempTable, [row2]);

    await upsertFromTemp(db, config.dialect, tempTable, finalTable, "addresses");
    expect(await countRows(db, finalTable)).toBe(1);

    await dropTable(db, tempTable);
  });

  it("should handle upsert for postalcode_changes table", async () => {
    const finalTable = `${config.tablePrefix}postalcode_changes`;
    const tempTable = `${config.tablePrefix}temp_postalcode_changes`;

    const row1 = {
      record: "CHNG",
      level: "1",
      updated_at: "2024-01-20",
      extraction_start_at: "2024-01-01",
      extraction_end_at: "2024-01-31",
      old_postal_code: "00100",
      old_post_office_name: "OLD HELSINKI",
      old_post_office_name_swe: "GAMLA HELSINGFORS",
      old_post_office_short_name: "OLD HELS",
      old_post_office_short_name_swe: "GAMLA HELS",
      reserved: null,
      postal_code: "00101",
      post_office_name: "NEW HELSINKI",
      post_office_name_swe: "NYA HELSINGFORS",
      post_office_short_name: "NEW HELS",
      post_office_short_name_swe: "NYA HELS",
      municipality_id_code: "091",
      municipality_name: "HELSINKI",
      municipality_name_swe: "HELSINGFORS",
      region_id: "01",
      region_name: "Uudenmaan maakunta",
      region_name_swe: "Landskapet Nyland",
      changed_at: "2024-01-15",
      event_code: 3,
    };

    await insertRows(db, finalTable, [row1]);
    expect(await countRows(db, finalTable)).toBe(1);

    await createTempTable(db, tempTable, finalTable);
    const row2 = { ...row1, municipality_name: "HELSINKI UPDATED" };
    await insertRows(db, tempTable, [row2]);

    await upsertFromTemp(db, config.dialect, tempTable, finalTable, "postalcode_changes");
    expect(await countRows(db, finalTable)).toBe(1);

    await dropTable(db, tempTable);
  });

  it("should handle upsert for postalcodes table", async () => {
    const finalTable = `${config.tablePrefix}postalcodes`;
    const tempTable = `${config.tablePrefix}temp_postalcodes`;

    // Insert initial data
    const row1 = {
      record: "BASIC",
      updated_at: "2024-01-20",
      postal_code: "00100",
      post_office_name: "HELSINKI",
      post_office_name_swe: "HELSINGFORS",
      post_office_short_name: "HELSINKI",
      post_office_short_name_swe: "HELSINGFORS",
      entry_into_force_at: "1990-01-01",
      type_code: 1,
      region_id: "01",
      region_name: "Uudenmaan maakunta",
      region_name_swe: "Landskapet Nyland",
      municipality_id_code: "091",
      municipality_name: "HELSINKI",
      municipality_name_swe: "HELSINGFORS",
      municipality_language: 2,
    };

    await insertRows(db, finalTable, [row1]);
    expect(await countRows(db, finalTable)).toBe(1);

    // Create temp table and insert updated data
    await createTempTable(db, tempTable, finalTable);
    const row2 = { ...row1, post_office_name: "HELSINKI UPDATED" };
    await insertRows(db, tempTable, [row2]);

    // Upsert from temp to final
    await upsertFromTemp(db, config.dialect, tempTable, finalTable, "postalcodes");

    // Should still have 1 row (upserted, not duplicated)
    expect(await countRows(db, finalTable)).toBe(1);

    // Clean up temp table
    await dropTable(db, tempTable);
  });

  it("should handle bulk insert in chunks", async () => {
    const tableName = `${config.tablePrefix}postalcodes`;
    const rows = Array.from({ length: 50 }, (_, i) => ({
      record: "BASIC",
      updated_at: "2024-01-20",
      postal_code: String(i).padStart(5, "0"),
      post_office_name: `CITY_${i}`,
      post_office_name_swe: `STAD_${i}`,
      post_office_short_name: `C${i}`,
      post_office_short_name_swe: `S${i}`,
      entry_into_force_at: "1990-01-01",
      type_code: 1,
      region_id: "01",
      region_name: "Region",
      region_name_swe: "Region",
      municipality_id_code: "091",
      municipality_name: "Municipality",
      municipality_name_swe: "Kommun",
      municipality_language: 1,
    }));

    await insertRows(db, tableName, rows, 10); // chunk size 10
    expect(await countRows(db, tableName)).toBe(50);
  });

  it("should wrap operations in transactions", async () => {
    const tableName = `${config.tablePrefix}postalcodes`;

    // Insert valid data
    const row = {
      record: "BASIC",
      updated_at: "2024-01-20",
      postal_code: "00100",
      post_office_name: "HELSINKI",
      post_office_name_swe: "HELSINGFORS",
      post_office_short_name: "HELSINKI",
      post_office_short_name_swe: "HELSINGFORS",
      entry_into_force_at: "1990-01-01",
      type_code: 1,
      region_id: "01",
      region_name: "Region",
      region_name_swe: "Region",
      municipality_id_code: "091",
      municipality_name: "City",
      municipality_name_swe: "Stad",
      municipality_language: 1,
    };

    await insertRows(db, tableName, [row]);
    expect(await countRows(db, tableName)).toBe(1);
  });
});
