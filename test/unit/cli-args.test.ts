import { describe, expect, it } from "vitest";
import { parseArgs } from "../../src/cli/args.js";

describe("parseArgs", () => {
  it("should parse --help flag", () => {
    const result = parseArgs(["--help"]);
    expect(result.help).toBe(true);
  });

  it("should parse --version flag", () => {
    const result = parseArgs(["--version"]);
    expect(result.version).toBe(true);
  });

  it("should parse --force flag", () => {
    const result = parseArgs(["--force"]);
    expect(result.force).toBe(true);
  });

  it("should parse --config with value", () => {
    const result = parseArgs(["--config", "/path/to/config.js"]);
    expect(result.config).toBe("/path/to/config.js");
  });

  it("should parse --config=value format", () => {
    const result = parseArgs(["--config=/path/to/config.js"]);
    expect(result.config).toBe("/path/to/config.js");
  });

  it("should parse --dialect", () => {
    const result = parseArgs(["--dialect", "postgres"]);
    expect(result.dialect).toBe("postgres");
  });

  it("should parse --host", () => {
    const result = parseArgs(["--host", "localhost"]);
    expect(result.host).toBe("localhost");
  });

  it("should parse --port as number", () => {
    const result = parseArgs(["--port", "5432"]);
    expect(result.port).toBe(5432);
  });

  it("should parse --database", () => {
    const result = parseArgs(["--database", "mydb"]);
    expect(result.database).toBe("mydb");
  });

  it("should parse --user", () => {
    const result = parseArgs(["--user", "admin"]);
    expect(result.user).toBe("admin");
  });

  it("should parse --password", () => {
    const result = parseArgs(["--password", "secret"]);
    expect(result.password).toBe("secret");
  });

  it("should parse --tables as comma-separated list", () => {
    const result = parseArgs(["--tables", "addresses,postalcodes"]);
    expect(result.tables).toEqual(["addresses", "postalcodes"]);
  });

  it("should handle multiple flags together", () => {
    const result = parseArgs([
      "--force",
      "--dialect",
      "mysql",
      "--host",
      "db.example.com",
      "--port",
      "3306",
      "--database",
      "posti",
      "--user",
      "root",
      "--password",
      "pass",
      "--tables",
      "postalcodes",
    ]);

    expect(result.force).toBe(true);
    expect(result.dialect).toBe("mysql");
    expect(result.host).toBe("db.example.com");
    expect(result.port).toBe(3306);
    expect(result.database).toBe("posti");
    expect(result.user).toBe("root");
    expect(result.password).toBe("pass");
    expect(result.tables).toEqual(["postalcodes"]);
  });

  it("should parse migrate command", () => {
    const result = parseArgs(["migrate"]);
    expect(result.command).toBe("migrate");
  });

  it("should default to run command", () => {
    const result = parseArgs([]);
    expect(result.command).toBe("run");
  });

  it("should parse run command explicitly", () => {
    const result = parseArgs(["run", "--force"]);
    expect(result.command).toBe("run");
    expect(result.force).toBe(true);
  });

  it("should parse --no-migrate flag", () => {
    const result = parseArgs(["--no-migrate"]);
    expect(result.noMigrate).toBe(true);
  });

  it("should return NaN for non-numeric --port", () => {
    const result = parseArgs(["--port", "invalid"]);
    expect(Number.isNaN(result.port)).toBe(true);
  });

  it("should return defaults for unspecified flags", () => {
    const result = parseArgs([]);
    expect(result.command).toBe("run");
    expect(result.help).toBe(false);
    expect(result.version).toBe(false);
    expect(result.force).toBe(false);
    expect(result.noMigrate).toBe(false);
    expect(result.config).toBeUndefined();
    expect(result.dialect).toBeUndefined();
    expect(result.tables).toBeUndefined();
  });
});
