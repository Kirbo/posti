import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { convertFile } from "../../src/parser/file-converter.js";

describe("file-converter", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "posti-conv-"));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("should convert ISO-8859-1 file to UTF-8", async () => {
    const inputFile = path.join(tmpDir, "input.dat");
    const outputFile = path.join(tmpDir, "output.dat");

    // "Ääkkönen" in ISO-8859-1 encoding
    const latin1Buffer = Buffer.from([0xc4, 0xe4, 0x6b, 0x6b, 0xf6, 0x6e, 0x65, 0x6e]);
    await fs.writeFile(inputFile, latin1Buffer);

    await convertFile(inputFile, outputFile);

    const result = await fs.readFile(outputFile, "utf-8");
    expect(result).toBe("Ääkkönen");
  });

  it("should handle ASCII content without issues", async () => {
    const inputFile = path.join(tmpDir, "ascii.dat");
    const outputFile = path.join(tmpDir, "ascii_utf8.dat");

    await fs.writeFile(inputFile, "Hello World\nSecond Line");

    await convertFile(inputFile, outputFile);

    const result = await fs.readFile(outputFile, "utf-8");
    expect(result).toBe("Hello World\nSecond Line");
  });
});
