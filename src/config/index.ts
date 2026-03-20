import fs from "node:fs/promises";
import path from "node:path";
import type { ParsedArgs } from "../cli/args.js";
import { getConfigDir } from "./paths.js";
import type { PostiConfig } from "./schema.js";
import { configSchema } from "./schema.js";

export type { PostiConfig } from "./schema.js";

export async function loadConfig(args?: Partial<ParsedArgs>): Promise<PostiConfig> {
  const fileConfig = await loadFileConfig(args);
  const envOverrides = loadEnvOverrides();
  const cliOverrides = loadCliOverrides(args);

  // Merge: file < env < cli
  const merged = { ...fileConfig, ...envOverrides, ...cliOverrides };
  return configSchema.parse(merged);
}

async function loadFileConfig(args?: Partial<ParsedArgs>): Promise<Record<string, unknown>> {
  const explicitConfig = args?.config ?? process.env.POSTI_CONFIG;
  const configPath = explicitConfig ?? (await findConfigFile());

  if (!configPath) return {};

  try {
    const resolved = path.resolve(configPath);
    const mod: unknown = await import(resolved);
    if (typeof mod === "object" && mod !== null && "default" in mod) {
      const defaultExport = (mod as Record<string, unknown>).default;
      if (typeof defaultExport === "object" && defaultExport !== null) {
        return defaultExport as Record<string, unknown>;
      }
    }
    if (explicitConfig) {
      throw new Error(`Config file '${configPath}' does not export a valid configuration object`);
    }
    return {};
  } catch (error) {
    if (explicitConfig) {
      throw new Error(
        `Failed to load config file '${configPath}': ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    return {};
  }
}

function loadEnvOverrides(): Record<string, unknown> {
  const overrides: Record<string, unknown> = {};
  if (process.env.POSTI_DIALECT) overrides.dialect = process.env.POSTI_DIALECT;
  if (process.env.POSTI_HOST) overrides.host = process.env.POSTI_HOST;
  if (process.env.POSTI_PORT) overrides.port = Number.parseInt(process.env.POSTI_PORT, 10);
  if (process.env.POSTI_USER) overrides.user = process.env.POSTI_USER;
  if (process.env.POSTI_PASSWORD) overrides.password = process.env.POSTI_PASSWORD;
  if (process.env.POSTI_DATABASE) overrides.database = process.env.POSTI_DATABASE;
  if (process.env.POSTI_TABLE_PREFIX) overrides.tablePrefix = process.env.POSTI_TABLE_PREFIX;
  return overrides;
}

function loadCliOverrides(args?: Partial<ParsedArgs>): Record<string, unknown> {
  const overrides: Record<string, unknown> = {};
  if (args?.dialect) overrides.dialect = args.dialect;
  if (args?.host) overrides.host = args.host;
  if (args?.port) overrides.port = args.port;
  if (args?.user) overrides.user = args.user;
  if (args?.password) overrides.password = args.password;
  if (args?.database) overrides.database = args.database;
  if (args?.tables) overrides.tables = args.tables;
  if (args?.noMigrate) overrides.migrate = false;
  return overrides;
}

async function findConfigFile(): Promise<string | undefined> {
  // Check XDG config dir
  const xdgConfig = path.join(getConfigDir(), "config.js");
  if (await fileExists(xdgConfig)) return xdgConfig;

  // Check CWD
  const cwdConfig = path.resolve("posti.config.js");
  if (await fileExists(cwdConfig)) return cwdConfig;

  return undefined;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
