import { getCreateTableSQL } from "../dialects.js";
import type { Migration } from "../migrate.js";
import { execSQL } from "../operations.js";

export const initialSchema: Migration = {
  name: "001_initial_schema",
  up: async (db, config) => {
    for (const table of config.tables) {
      const tableName = `${config.tablePrefix}${table}`;
      const sql = getCreateTableSQL(db.dialect, tableName, table);
      for (const statement of sql.split(";\n")) {
        const trimmed = statement.trim();
        if (trimmed) await execSQL(db, trimmed);
      }
    }
  },
};
