import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { PostiFile } from "../../src/fetcher/url-parser.js";
import { getNewFiles, readLatest, writeLatest } from "../../src/loader/state.js";

describe("state management", () => {
  let tmpDir: string;
  let stateFile: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "posti-test-"));
    stateFile = path.join(tmpDir, "latest.json");
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  describe("readLatest", () => {
    it("should return empty array if state file does not exist", async () => {
      const result = await readLatest(stateFile);
      expect(result).toEqual([]);
    });

    it("should return empty array for corrupted JSON", async () => {
      await fs.writeFile(stateFile, "{not valid json!!!");
      const result = await readLatest(stateFile);
      expect(result).toEqual([]);
    });

    it("should return empty array for non-array JSON", async () => {
      await fs.writeFile(stateFile, JSON.stringify({ files: ["a.zip"] }));
      const result = await readLatest(stateFile);
      expect(result).toEqual([]);
    });

    it("should return empty array for array with non-string elements", async () => {
      await fs.writeFile(stateFile, JSON.stringify([1, null, "a.zip"]));
      const result = await readLatest(stateFile);
      expect(result).toEqual([]);
    });

    it("should return filenames from existing state file", async () => {
      await fs.writeFile(stateFile, JSON.stringify(["BAF_20240120.zip", "PCF_20240120.zip"]));
      const result = await readLatest(stateFile);
      expect(result).toEqual(["BAF_20240120.zip", "PCF_20240120.zip"]);
    });
  });

  describe("writeLatest", () => {
    it("should write filenames to state file", async () => {
      await writeLatest(stateFile, ["BAF_20240120.zip", "PCF_20240120.zip"]);
      const content = JSON.parse(await fs.readFile(stateFile, "utf-8"));
      expect(content).toEqual(["BAF_20240120.zip", "PCF_20240120.zip"]);
    });

    it("should create parent directory if it does not exist", async () => {
      const nestedFile = path.join(tmpDir, "nested", "deep", "latest.json");
      await writeLatest(nestedFile, ["BAF_20240120.zip"]);
      const content = JSON.parse(await fs.readFile(nestedFile, "utf-8"));
      expect(content).toEqual(["BAF_20240120.zip"]);
    });
  });

  describe("getNewFiles", () => {
    const mockFiles: PostiFile[] = [
      {
        url: "https://example.com/BAF_20240120.zip",
        filename: "BAF_20240120.zip",
        extensionless: "BAF_20240120",
        fileType: "BAF",
      },
      {
        url: "https://example.com/PCF_20240120.zip",
        filename: "PCF_20240120.zip",
        extensionless: "PCF_20240120",
        fileType: "PCF",
      },
      {
        url: "https://example.com/POM_20240120.zip",
        filename: "POM_20240120.zip",
        extensionless: "POM_20240120",
        fileType: "POM",
      },
    ];

    it("should return all files when state file does not exist", async () => {
      const result = await getNewFiles(mockFiles, stateFile);
      expect(result).toHaveLength(3);
    });

    it("should return only new files", async () => {
      await writeLatest(stateFile, ["BAF_20240120.zip", "PCF_20240120.zip"]);
      const result = await getNewFiles(mockFiles, stateFile);
      expect(result).toHaveLength(1);
      expect(result[0]?.fileType).toBe("POM");
    });

    it("should return empty array when all files are already processed", async () => {
      await writeLatest(stateFile, ["BAF_20240120.zip", "PCF_20240120.zip", "POM_20240120.zip"]);
      const result = await getNewFiles(mockFiles, stateFile);
      expect(result).toHaveLength(0);
    });

    it("should return all files when force is true", async () => {
      await writeLatest(stateFile, ["BAF_20240120.zip", "PCF_20240120.zip", "POM_20240120.zip"]);
      const result = await getNewFiles(mockFiles, stateFile, true);
      expect(result).toHaveLength(3);
    });
  });
});
