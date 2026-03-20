import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import iconv from "iconv-lite";

export async function convertFile(inputPath: string, outputPath: string): Promise<void> {
  await pipeline(
    createReadStream(inputPath),
    iconv.decodeStream("latin1"),
    iconv.encodeStream("utf8"),
    createWriteStream(outputPath),
  );
}
