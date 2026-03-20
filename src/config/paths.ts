import os from "node:os";
import path from "node:path";

const APP_NAME = "posti";

export function getConfigDir(): string {
  const base = process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), ".config");
  return path.join(base, APP_NAME);
}

export function getCacheDir(): string {
  const base = process.env.XDG_CACHE_HOME ?? path.join(os.homedir(), ".cache");
  return path.join(base, APP_NAME);
}

export function getStateDir(): string {
  const base = process.env.XDG_STATE_HOME ?? path.join(os.homedir(), ".local", "state");
  return path.join(base, APP_NAME);
}
