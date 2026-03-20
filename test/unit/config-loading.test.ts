import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadConfig } from "../../src/config/index.js";

describe("loadConfig", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clear all POSTI_ env vars to isolate tests
    for (const key of Object.keys(process.env)) {
      if (key.startsWith("POSTI_")) {
        delete process.env[key];
      }
    }
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("env var overrides", () => {
    it("should apply POSTI_DIALECT and POSTI_DATABASE", async () => {
      process.env.POSTI_DIALECT = "sqlite";
      process.env.POSTI_DATABASE = ":memory:";
      const config = await loadConfig();
      expect(config.dialect).toBe("sqlite");
      expect(config.database).toBe(":memory:");
    });

    it("should apply POSTI_PORT as number", async () => {
      process.env.POSTI_DIALECT = "sqlite";
      process.env.POSTI_DATABASE = ":memory:";
      process.env.POSTI_PORT = "5432";
      const config = await loadConfig();
      expect(config.port).toBe(5432);
    });

    it("should apply POSTI_TABLE_PREFIX", async () => {
      process.env.POSTI_TABLE_PREFIX = "custom_";
      const config = await loadConfig({ dialect: "sqlite", database: ":memory:" });
      expect(config.tablePrefix).toBe("custom_");
    });

    it("should apply POSTI_HOST", async () => {
      const config = await loadConfig({ dialect: "sqlite", database: ":memory:", host: undefined });
      expect(config.host).toBeUndefined();

      process.env.POSTI_HOST = "db.example.com";
      const config2 = await loadConfig({ dialect: "sqlite", database: ":memory:" });
      expect(config2.host).toBe("db.example.com");
    });
  });

  describe("CLI arg overrides", () => {
    it("CLI args should take priority over env vars", async () => {
      process.env.POSTI_DIALECT = "postgres";
      process.env.POSTI_DATABASE = "envdb";
      const config = await loadConfig({ dialect: "sqlite", database: ":memory:" });
      expect(config.dialect).toBe("sqlite");
      expect(config.database).toBe(":memory:");
    });

    it("should wire noMigrate to migrate: false", async () => {
      const config = await loadConfig({ dialect: "sqlite", database: ":memory:", noMigrate: true });
      expect(config.migrate).toBe(false);
    });

    it("should default migrate to true", async () => {
      const config = await loadConfig({ dialect: "sqlite", database: ":memory:" });
      expect(config.migrate).toBe(true);
    });
  });

  describe("explicit config file errors", () => {
    it("should throw when explicit config file does not exist", async () => {
      await expect(
        loadConfig({ config: "/nonexistent/path/posti.config.js", dialect: "sqlite", database: ":memory:" }),
      ).rejects.toThrow("Failed to load config file");
    });

    it("should throw when POSTI_CONFIG points to nonexistent file", async () => {
      process.env.POSTI_CONFIG = "/nonexistent/path/posti.config.js";
      await expect(loadConfig({ dialect: "sqlite", database: ":memory:" })).rejects.toThrow(
        "Failed to load config file",
      );
    });

    it("should throw when explicit config file does not export a valid object", async () => {
      // node:module will resolve any valid JS file — create a temp file exporting a string
      const fs = await import("node:fs/promises");
      const os = await import("node:os");
      const path = await import("node:path");
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "posti-cfg-"));
      const tmpFile = path.join(tmpDir, "bad-config.mjs");
      await fs.writeFile(tmpFile, 'export default "not an object";\n');

      try {
        await expect(loadConfig({ config: tmpFile, dialect: "sqlite", database: ":memory:" })).rejects.toThrow(
          "does not export a valid configuration object",
        );
      } finally {
        await fs.rm(tmpDir, { recursive: true, force: true });
      }
    });
  });

  describe("defaults", () => {
    it("should apply schema defaults", async () => {
      const config = await loadConfig({ dialect: "sqlite", database: ":memory:" });
      expect(config.tablePrefix).toBe("posti_");
      expect(config.migrate).toBe(true);
      expect(config.process.chunkSize).toBe(1000);
      expect(config.process.deleteOnComplete).toBe(true);
      expect(config.tables).toEqual(["addresses", "postalcodes", "postalcode_changes"]);
    });
  });
});
