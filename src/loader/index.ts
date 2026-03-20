import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline";
import { POSTI_INDEX_URL } from "../config/defaults.js";
import { getCacheDir, getStateDir } from "../config/paths.js";
import type { PostiConfig } from "../config/schema.js";
import type { DbConnection } from "../db/index.js";
import { closeConnection, createConnection } from "../db/index.js";
import { runMigrations } from "../db/migrate.js";
import { createTempTable, dropTable, insertRows, upsertFromTemp } from "../db/operations.js";
import type { PostiFile } from "../fetcher/url-parser.js";
import { parseFileUrls } from "../fetcher/url-parser.js";
import type { FieldDefinition } from "../parser/field-definitions.js";
import { fileTypeToFields, fileTypeToTable } from "../parser/field-definitions.js";
import { convertFile } from "../parser/file-converter.js";
import { parseLine } from "../parser/line-parser.js";
import { extractZip } from "../parser/unzipper.js";
import { sliceIntoChunks } from "../utils/chunks.js";
import { logger } from "../utils/logger.js";
import { createProgress } from "../utils/progress.js";
import { getNewFiles, writeLatest } from "./state.js";

export interface RunOptions {
  force?: boolean;
  silent?: boolean;
}

export async function run(config: PostiConfig, options: RunOptions = {}): Promise<void> {
  const cacheDir = getCacheDir();
  const stateDir = getStateDir();
  const stateFile = path.join(stateDir, "latest.json");

  // Ensure directories exist
  await fs.mkdir(cacheDir, { recursive: true });
  await fs.mkdir(stateDir, { recursive: true });

  // Fetch file index
  logger.info("Fetching file list from Posti...");
  const response = await fetch(POSTI_INDEX_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch file list from ${POSTI_INDEX_URL}: HTTP ${response.status}`);
  }
  const html = await response.text();
  const allFiles = parseFileUrls(html);

  logger.info(`Found ${allFiles.length} files`);

  // Filter to configured tables
  const files = allFiles.filter((f) => {
    const table = fileTypeToTable[f.fileType];
    return table && config.tables.includes(table as (typeof config.tables)[number]);
  });

  // Check for new files
  const newFiles = await getNewFiles(files, stateFile, options.force);

  if (newFiles.length === 0) {
    logger.info("No new files to process");
    return;
  }

  logger.info(`Processing ${newFiles.length} new file(s)`);

  const progress = createProgress({ silent: options.silent });

  // Connect to database
  const db = await createConnection(config);

  try {
    // Run pending migrations (unless migrations are disabled)
    if (config.migrate) {
      await runMigrations(db, config);
    }

    progress.startOverall(newFiles.length);

    // Process each file
    for (const file of newFiles) {
      await processFile(db, config, file, cacheDir, progress);
    }

    progress.stop();

    // Update state
    await writeLatest(
      stateFile,
      files.map((f) => f.filename),
    );
    logger.info("Done");
  } finally {
    await closeConnection(db);

    // Clean up cache if configured
    if (config.process.deleteOnComplete) {
      await fs.rm(cacheDir, { recursive: true, force: true });
    }
  }
}

async function processFile(
  db: DbConnection,
  config: PostiConfig,
  file: PostiFile,
  cacheDir: string,
  progress: ReturnType<typeof createProgress>,
): Promise<void> {
  const tableType = fileTypeToTable[file.fileType];
  if (!tableType) return;

  const fields = fileTypeToFields[file.fileType];
  if (!fields) return;

  progress.startFile(file.filename);

  // Download
  progress.updateFileStep("Downloading");
  const zipPath = path.join(cacheDir, file.filename);
  await downloadFile(file.url, zipPath);

  // Unzip
  progress.updateFileStep("Extracting");
  await extractZip(zipPath, cacheDir);

  // Convert encoding
  progress.updateFileStep("Converting encoding");
  const datPath = path.join(cacheDir, `${file.extensionless}.dat`);
  const utf8Path = path.join(cacheDir, `${file.extensionless}_utf8.dat`);
  await convertFile(datPath, utf8Path);

  // Parse lines
  progress.updateFileStep("Parsing");
  const rows = await parseDataFile(utf8Path, fields);

  // Load into database using temp table + upsert
  const finalTable = `${config.tablePrefix}${tableType}`;
  const tempTable = `${config.tablePrefix}temp_${tableType}`;

  await createTempTable(db, tempTable, finalTable);

  // Bulk insert into temp table in chunks
  const chunks = sliceIntoChunks(rows, config.process.chunkSize);
  let inserted = 0;
  for (const chunk of chunks) {
    await insertRows(db, tempTable, chunk);
    inserted += chunk.length;
    progress.updateFileProgress("Loading", inserted, rows.length);
  }

  // Upsert from temp to final
  progress.updateFileStep("Upserting");
  await upsertFromTemp(db, config.dialect, tempTable, finalTable, tableType);

  // Drop temp table
  await dropTable(db, tempTable);

  progress.completeFile();
}

async function downloadFile(url: string, destPath: string): Promise<void> {
  logger.info("  Downloading...");
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Download failed: ${url} (${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  await fs.writeFile(destPath, Buffer.from(arrayBuffer));
}

async function parseDataFile(
  filePath: string,
  fields: FieldDefinition[],
): Promise<Record<string, string | number | null>[]> {
  const rows: Record<string, string | number | null>[] = [];

  const rl = createInterface({
    input: createReadStream(filePath, "utf-8"),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (line.trim()) {
      // Use column names (snake_case) as keys for database insertion
      const parsed = parseLine(line, fields);
      const row: Record<string, string | number | null> = {};
      for (const field of fields) {
        if (field.start !== undefined) {
          row[field.column] = parsed[field.name] ?? null;
        }
      }
      rows.push(row);
    }
  }

  return rows;
}
