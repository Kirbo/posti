export interface ParsedArgs {
  command: "run" | "migrate";
  help: boolean;
  version: boolean;
  force: boolean;
  noMigrate: boolean;
  config?: string;
  dialect?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  tables?: string[];
}

const COMMANDS = new Set(["run", "migrate"]);
const BOOLEAN_FLAGS = new Set(["help", "version", "force", "no-migrate"]);
const VALUE_FLAGS = new Set(["config", "dialect", "host", "port", "database", "user", "password", "tables"]);

export function parseArgs(argv: string[]): ParsedArgs {
  const result: ParsedArgs = {
    command: "run",
    help: false,
    version: false,
    force: false,
    noMigrate: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg && !arg.startsWith("--") && COMMANDS.has(arg)) {
      result.command = arg as "run" | "migrate";
      continue;
    }
    if (!arg?.startsWith("--")) continue;

    if (arg.includes("=")) {
      const eqIndex = arg.indexOf("=");
      const name = arg.slice(2, eqIndex);
      const value = arg.slice(eqIndex + 1);
      applyFlag(result, name, value);
      continue;
    }

    const name = arg.slice(2);

    if (BOOLEAN_FLAGS.has(name)) {
      applyFlag(result, name);
      continue;
    }

    const nextArg = argv[i + 1];
    if (VALUE_FLAGS.has(name) && nextArg !== undefined) {
      i++;
      applyFlag(result, name, nextArg);
    }
  }

  return result;
}

function applyFlag(result: ParsedArgs, name: string, value?: string): void {
  switch (name) {
    case "help":
      result.help = true;
      break;
    case "version":
      result.version = true;
      break;
    case "force":
      result.force = true;
      break;
    case "no-migrate":
      result.noMigrate = true;
      break;
    case "config":
      result.config = value;
      break;
    case "dialect":
      result.dialect = value;
      break;
    case "host":
      result.host = value;
      break;
    case "port":
      result.port = value ? Number.parseInt(value, 10) : undefined;
      break;
    case "database":
      result.database = value;
      break;
    case "user":
      result.user = value;
      break;
    case "password":
      result.password = value;
      break;
    case "tables":
      result.tables = value?.split(",");
      break;
  }
}
