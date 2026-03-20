import { createReadStream } from "node:fs";
import unzip from "unzipper";

export async function extractZip(zipPath: string, targetDir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    createReadStream(zipPath)
      .pipe(unzip.Extract({ path: targetDir }))
      .on("close", resolve)
      .on("error", reject);
  });
}
