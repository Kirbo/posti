import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { extractZip } from "../../src/parser/unzipper.js";

describe("extractZip", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "posti-unzip-"));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("should extract a zip file to the target directory", async () => {
    // Create a real file and zip it using the system zip command
    const datFile = path.join(tmpDir, "TEST_DATA.dat");
    await fs.writeFile(datFile, "Hello from test data\nSecond line");

    const zipFile = path.join(tmpDir, "TEST_DATA.zip");
    execSync(`cd "${tmpDir}" && zip "${zipFile}" TEST_DATA.dat`);

    // Remove the original to verify extraction works
    await fs.unlink(datFile);

    const extractDir = path.join(tmpDir, "output");
    await fs.mkdir(extractDir);

    await extractZip(zipFile, extractDir);

    const extracted = await fs.readFile(path.join(extractDir, "TEST_DATA.dat"), "utf-8");
    expect(extracted).toBe("Hello from test data\nSecond line");
  });
});
