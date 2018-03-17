import fs from 'fs-extra';
import path from 'path';
import request from 'request';
import progress from 'cli-progress';
import Promise from 'bluebird';
import unzip from 'unzip';
import readline from 'readline';
import iconv from 'iconv-lite';

import {
  logBlock,
  logStep,
  logError,
  sliceArrayIntoChunks,
} from '../utils';

/**
 * Posti
 *
 * @class
 */
class Posti {
  /**
   * Constructor
   */
  constructor() {
    this.files = [];
    this.latest = [];
    this.newFiles = [];
  }

  /**
   * Get last processed files
   *
   * @returns {Array<Object>} - Last files processed
   */
  setLatest = async () => {
    this.newFiles = await this.getLatest();
  };

  /**
   * Get last processed files
   *
   * @returns {Array<Object>} Last files processed
   */
  getLatest = async () => {
    if (fs.existsSync(global.postiConfig.cache.latestFile)) {
      const files = fs.readFileSync(global.postiConfig.cache.latestFile, 'utf8');
      return files;
    }
    return [];
  };

  /**
   * Get last processed files
   *
   * @param {Array<Object>} files - Latest files
   *
   * @returns {void}
   */
  writeLatest = (files) => {
    fs.writeFileSync(global.postiConfig.cache.latestFile, files, 'utf8');
  };

  /**
   * Check if there are any new files.
   *
   * @returns {Array<Object>} Array of new files.
   */
  getNewFiles = async () => {
    this.latest = await this.getLatest();
    if (process.env.force) {
      logBlock('Force update all');
      this.latest = [];
    }

    return this.files.filter(file => !this.latest.includes(file.filename));
  }

  /**
   * Set new files.
   *
   * @param {Array<Object>} files - New files.
   *
   * @returns {void}
   */
  setNewFiles = async (files) => {
    this.newFiles = files;
  }

  /**
   * Set file.
   *
   * @param {Object} file - File to process
   *
   * @returns {void}
   */
  setFile = (file) => {
    this.file = file;
  }

  /**
   * Create cache dir.
   *
   * @returns {void}
   */
  createCacheDir = async () => {
    logBlock(`Using temp folder: ${global.postiConfig.cache.tempDir}`);
    fs.ensureDirSync(global.postiConfig.cache.tempDir);
  };

  /**
   * Read zip file URLs from webpcode.
   *
   * @returns {Array<Object>} Array of files.
   */
  fecthFileUrls = async () => {
    logBlock('Fetching file list');
    return new Promise((resolve) => {
      request(global.postiConfig.webpcode.index, (err, res, body) => {
        if (err) {
          logError(err);
        }

        this.files = body
          .match(/href="((.*)?webpcode\/[BAF|PCF|POM](.*)\.zip)"/g)
          .map((url) => {
            const file = url.match(/href="((.*)?webpcode\/(((BAF|PCF|POM)(.*))\.zip))"/);
            console.info(`    - ${file[1]}`);
            return {
              url: file[1],
              filename: file[3],
              extensionless: file[4],
              model: global.database.getFileModelName(file[5]),
            };
          });

        resolve(this.files);
      });
    });
  }

  /**
   * Process files.
   *
   * @param {Array<Object>} files - List of files to process.
   *
   * @returns {void}
   */
  processFiles = async files => (
    Promise
      .each(files, await this.processFile)
      .then(() => {
        if (global.config.process.deleteOnComplete) {
          this.removeFiles();
        }
        this.writeLatest(files.map(file => file.filename));
      })
  )

  /**
   * Start processing file.
   *
   * @param {Object} file - File object.
   *
   * @returns {Promise} Promise
   */
  processFile = async (file) => {
    this.setFile(file);

    // This file hasn't been processed yet.
    if (this.newFiles.includes(file)) {
      logBlock(`Processing file: ${file.filename}`);
      await this.downloadFile();
      await this.unzipFile();
      await this.convertFile();
      await this.parseFile();
      return this.clean(file);
    }

    // This file has already been processed.
    logBlock(`Skipping file: ${file.filename}`);
    return this.clean(file);
  };

  /**
   * Download file from posti.
   *
   * @returns {Promise} Promise
   */
  downloadFile = async () => (
    new Promise((resolve) => {
      logStep('Downloading file');
      const FILE_PATH = path.resolve(global.postiConfig.cache.tempDir, this.file.filename);
      const PROGRESS = new progress.Bar(global.postiConfig.progressbar.downloadConfig);
      const download = request(this.file.url);
      download
        .on('response', (response) => {
          const size = parseInt(response.headers['content-length'], 10);
          PROGRESS.start(size, 0);

          response
            .on('data', (chunk) => {
              PROGRESS.increment(chunk.length);
            })
            .on('end', () => {
              resolve();
            });
        })
        .pipe(fs.createWriteStream(FILE_PATH))
        .on('error', logError);
    })
  );

  /**
   * Unzip the downloaded file.
   *
   * @returns {Promise} Promise
   */
  unzipFile = async () => (
    new Promise((resolve) => {
      logStep(`Unziping file: ${this.file.filename}`);
      fs.createReadStream(path.resolve(global.postiConfig.cache.tempDir, this.file.filename))
        .pipe(unzip.Extract({ path: path.resolve(global.postiConfig.cache.tempDir) }))
        .on('close', () => {
          resolve();
        });
    })
  );

  /**
   * Convert the file from ISO-8859-1 into UTF-8.
   *
   * @returns {Promise} Promise
   */
  convertFile = async () => (
    new Promise((resolve) => {
      logStep('Converting file from ISO-8859-1 -> UTF-8');
      fs.createReadStream(path.resolve(global.postiConfig.cache.tempDir, `${this.file.extensionless}.dat`))
        .pipe(iconv.decodeStream('latin1'))
        .pipe(iconv.encodeStream('utf8'))
        .pipe(fs.createWriteStream(path.resolve(global.postiConfig.cache.tempDir, `${this.file.extensionless}_utf8.dat`)))
        .on('close', () => {
          resolve();
        });
    })
  );

  /**
   * Parse the file and insert its contents into database.
   *
   * @returns {Promise} Promise
   */
  parseFile = async () => (
    new Promise(async (resolve) => {
      const datFile = `${this.file.extensionless}_utf8.dat`;
      const tableConfigs = global.database.getTableConfigs(this.file.model);
      if (tableConfigs) {
        logStep(`Parsing file: ${datFile}`);
        const PROGRESS = new progress.Bar(global.postiConfig.progressbar.insertConfig);
        const FILE_PATH = path.resolve(global.postiConfig.cache.tempDir, datFile);
        const databaseModel = global.database.getTableModel(this.file.model);
        const oldTable = await global.database.tableExists(tableConfigs.nameFinished);
        const rows = [];

        const emptyRow = Object.keys(tableConfigs.fields);

        /**
         * Parse line for insertChunk
         *
         * @param {String} line - Line
         *
         * @returns {Object} - Parsed line
         */
        const parseLine = (line) => {
          const row = {};

          emptyRow.forEach((key) => {
            const column = tableConfigs.fields[key];
            row[key] = null;
            if (column.start) {
              const value = line.substr((column.start - 1), column.length).trim();
              row[key] = global.database.castProperties(column, value);
            }
          });

          return row;
        };

        /**
         * Handle chunk parsing and insert into database.
         *
         * @param {Array<Object>} chunk - Chunk
         *
         * @returns {void}
         */
        const insertChunk = chunk => (
          databaseModel
            .bulkCreate(chunk)
            .then(() => PROGRESS.increment(chunk.length))
            .catch(logError)
        );

        readline
          .createInterface({
            input: fs.createReadStream(FILE_PATH),
            output: false,
            console: false,
          })
          .on('line', (line) => {
            rows.push(parseLine(line));
          })
          .on('close', () => {
            logStep(`Inserting into temp table '${tableConfigs.nameProcessing}'`);
            PROGRESS.start(rows.length, 0);
            Promise
              .map(sliceArrayIntoChunks(rows, global.config.process.chunkSize), insertChunk, { concurrency: global.config.process.concurrency })
              .then(() => {
                if (oldTable && tableConfigs.deleteOnceComplete) {
                  return global.database.renameTable(tableConfigs.nameFinished, `${tableConfigs.nameFinished}_old`);
                }
              })
              .then(() => {
                if (tableConfigs.deleteOnceComplete) {
                  return global.database.renameTable(tableConfigs.nameProcessing, tableConfigs.nameFinished);
                }
              })
              .then(() => {
                resolve();
              });
          });
      }
    })
  );

  /**
   * Clean after processing file.
   *
   * @param {Object} file - File being processed.
   *
   * @returns {void}
   */
  clean = async (file) => {
    logStep('Cleaning up');
    const tableConfigs = global.database.getTableConfigs(file.model);
    const oldTable = await global.database.tableExists(`${tableConfigs.nameFinished}_old`);

    if (oldTable && tableConfigs.deleteOnceComplete) {
      return global.database.dropTable(`${tableConfigs.nameFinished}_old`);
    }
  }

  /**
   * Delete the temporary folder.
   *
   * @returns {void}
   */
  removeFiles = () => {
    logBlock(`Removing temp folder ${global.postiConfig.cache.tempDir}`);
    fs.removeSync(global.postiConfig.cache.tempDir);
  };

  /**
   * Things to do after everything is done.
   *
   * @returns {void}
   */
  allFinished = () => {
    if (global.config.process.deleteOnComplete) {
      this.removeFiles();
    }
    this.writeLatest(this.files.map(file => file.filename));
  }
}

export default Posti;
