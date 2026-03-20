import fs from "node:fs/promises";
import path from "node:path";
import type { PostiFile } from "../fetcher/url-parser.js";

export async function readLatest(stateFile: string): Promise<string[]> {
  try {
    const content = await fs.readFile(stateFile, "utf-8");
    const parsed: unknown = JSON.parse(content);
    if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === "string")) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

export async function writeLatest(stateFile: string, filenames: string[]): Promise<void> {
  await fs.mkdir(path.dirname(stateFile), { recursive: true });
  await fs.writeFile(stateFile, JSON.stringify(filenames), "utf-8");
}

export async function getNewFiles(files: PostiFile[], stateFile: string, force = false): Promise<PostiFile[]> {
  if (force) return files;

  const latest = await readLatest(stateFile);
  return files.filter((file) => !latest.includes(file.filename));
}
