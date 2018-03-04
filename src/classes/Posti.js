import fs from 'fs-extra';
import path from 'path';
import request from 'request';
import progress from 'cli-progress';
import Promise from 'bluebird';
import unzip from 'unzip';
import readline from 'readline';
import iconv from 'iconv-lite';
import os from 'os';

import {
  logBlock,
  logStep,
  logError,
  sliceArrayIntoChunks,
} from '../utils';

import config, { PARSERS } from '../config';

let latest = 'latest.json';
if (process.env.NODE_ENV === 'test') {
  latest = 'test_latest.json';
}

/**
 * Posti
 * @class
 */
class Posti {
  /**
   * Constructor
   */
  constructor() {
    // Resolved home dir.
    this.cacheDir = path.resolve(`${os.homedir()}/.posti`);
    // Resolved cache file.
    this.latestFile = path.resolve(`${this.cacheDir}/${latest}`);
    // Resolved temp dir.
    this.tempDir = path.resolve(`${this.cacheDir}/data`);

    // Download progressbar config.
    this.DOWNLOAD_PROGRESS_CONFIG = {
      format: '{bar} {percentage}% | ETA: {eta}s | {value}/{total} b',
      stopOnComplete: true,
      clearOnComplete: true,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      fps: 4,
    };

    // Insert progressbar config.
    this.INSERT_PROGRESS_CONFIG = {
      ...this.DOWNLOAD_PROGRESS_CONFIG,
      format: '{bar} {percentage}% | ETA: {eta}s | {value}/{total} rows',
    };

    this.files = [];
    this.latest = [];
    this.newFiles = [];
  }

  /**
   * Get database model name for the file being processed.
   *
   * @param {Object} file - Object file
   *
   * @returns {String|null} Model of this file
   */
  getModel = (file) => {
    switch (file) {
      case 'BAF': {
        return 'ADDRESSES';
      }
      case 'PCF': {
        return 'ZIPCODES';
      }
      case 'POM': {
        return 'ZIPCODE_CHANGES';
      }
      default: {
        return null;
      }
    }
  };

  /**
   * Get last processed files
   *
   * @returns {Array<Object>} - Last files processed
   */
  getLatest = async () => {
    if (fs.existsSync(this.latestFile)) {
      const files = fs.readFileSync(this.latestFile, 'utf8');
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
    fs.writeFileSync(this.latestFile, files, 'utf8');
  };

  /**
   * Check if there are any new files.
   *
   * @returns {Array<Object>} - Array of new files.
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
   * Create cache dir.
   *
   * @returns {void}
   */
  createCacheDir = async () => {
    logBlock(`Using temp folder: ${this.tempDir}`);
    fs.ensureDirSync(this.tempDir);
  };

  /**
   * Read zip file URLs from webpcode.
   *
   * @returns {Promise<Array>} Promise
   */
  fecthFileUrls = async () => {
    logBlock('Fetching file list');
    return new Promise((resolve) => {
      request(config.webpcode.index, (err, res, body) => {
        if (err) {
          logError(err);
        }

        this.files = body
          .match(/href="((.*)?webpcode\/[BAF|PCF|POM](.*)\.zip)"/g)
          .map((url) => {
            const file = url.match(/href="((.*)?webpcode\/(((BAF|PCF|POM)(.*))\.zip))"/);
            console.info(`    - ${file[1]}`); // eslint-disable-line
            return {
              url: file[1],
              filename: file[3],
              extensionless: file[4],
              model: this.getModel(file[5]),
            };
          });

        resolve(this.files);
      });
    });
  }

  /**
   * Set new files.
   *
   * @param {Array.<Object>} files - New files.
   *
   * @returns {void}
   */
  setNewFiles = async (files) => {
    this.newFiles = files;
  }

  /**
   * Process files.
   *
   * @param {Array.<Object>} files - List of files to process.
   *
   * @returns {void}
   */
  processFiles = async files => (
    Promise
      .each(files, await this.processFile)
      .then(() => {
        if (config.delete_on_complete) {
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
    this.file = file;
    if (!this.latest.includes(file.filename)) {
      logBlock(`Processing file: ${file.filename}`);
      await this.downloadFile();
      await this.unzipFile();
      await this.convertFile();
      return this.parseFile();
    }

    // This file has already been processed.
    logBlock(`Skipping file: ${file.filename}`);
    const tableConfigs = global.database.getTableConfigs(file.model);
    if (tableConfigs.delete_processing) {
      return global.database.getDb().getQueryInterface().describeTable(tableConfigs.processing)
        .then(() => {
          logStep(`Drop temp table '${tableConfigs.processing}'`);
          return global.database.getDb().getQueryInterface().dropTable(tableConfigs.processing);
        })
        .catch((error) => {
          logError(error);
        });
    }
  };

  /**
   * Download file from posti.
   *
   * @returns {Promise} Promise
   */
  downloadFile = async () => (
    new Promise((resolve, reject) => {
      logStep('Downloading file');
      const FILE_PATH = path.resolve(this.tempDir, this.file.filename);
      const PROGRESS = new progress.Bar(this.DOWNLOAD_PROGRESS_CONFIG);
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
        .on('error', (error) => {
          logError(error.message);
          reject();
        });
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
      fs.createReadStream(path.resolve(this.tempDir, this.file.filename))
        .pipe(unzip.Extract({ path: path.resolve(this.tempDir) }))
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
      fs.createReadStream(path.resolve(this.tempDir, `${this.file.extensionless}.dat`))
        .pipe(iconv.decodeStream('latin1'))
        .pipe(iconv.encodeStream('utf8'))
        .pipe(fs.createWriteStream(path.resolve(this.tempDir, `${this.file.extensionless}_utf8.dat`)))
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
    new Promise((resolve, reject) => {
      const datFile = `${this.file.extensionless}_utf8.dat`;
      if (PARSERS[this.file.model]) {
        logStep(`Parsing file: ${datFile}`);
        const PROGRESS = new progress.Bar(this.INSERT_PROGRESS_CONFIG);
        const FILE_PATH = path.resolve(this.tempDir, datFile);
        const rows = [];
        const dbModel = global.database.getModel(this.file.model);

        /**
         * Parse line for insertChunk
         *
         * @param {String} line - Line
         *
         * @returns {Object} - Parsed line
         */
        const parseLine = (line) => {
          const row = { ...PARSERS[this.file.model] };

          Object.keys(row).forEach((key) => {
            const value = line.substr((PARSERS[this.file.model][key][0] - 1), PARSERS[this.file.model][key][1]).trim();
            row[key] = global.database.castProperties(key, value);
          });

          return row;
        };

        /**
         * Handle chunk parsing and insert into database.
         *
         * @param {Array.<Object>} chunk - Chunk
         *
         * @returns {void}
         */
        const insertChunk = chunk => (
          dbModel
            .bulkCreate(chunk)
            .then(() => PROGRESS.increment(config.chunk_size))
            .catch((error) => {
              logError(error);
              reject();
            })
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
            let oldTable = false;
            const tableConfigs = global.database.getTableConfigs(this.file.model);
            const deleteProcessing = tableConfigs.delete_processing;

            global.database.getDb().getQueryInterface().describeTable(tableConfigs.finished)
              .then(() => { oldTable = true; })
              .catch(() => { oldTable = false; });

            logStep(`Inserting into temp table '${tableConfigs.processing}'`);
            PROGRESS.start(rows.length - 1, 0);
            Promise
              .map(sliceArrayIntoChunks(rows, config.chunk_size), insertChunk, { concurrency: config.concurrency })
              .then(() => {
                if (oldTable && deleteProcessing) {
                  logStep(`Rename old table '${tableConfigs.finished}' -> '${tableConfigs.finished}_old'`);
                  return global.database.getDb().getQueryInterface().renameTable(tableConfigs.finished, `${tableConfigs.finished}_old`);
                }
              })
              .then(() => {
                if (deleteProcessing) {
                  logStep(`Rename temp table '${tableConfigs.processing}' -> '${tableConfigs.finished}'`);
                  return global.database.getDb().getQueryInterface().renameTable(tableConfigs.processing, tableConfigs.finished);
                }
              })
              .then(() => {
                if (oldTable && deleteProcessing) {
                  logStep(`Drop old table '${tableConfigs.processing}'`);
                  return global.database.getDb().getQueryInterface().dropTable(`${tableConfigs.finished}_old`);
                }
              })
              .then(() => {
                logStep('Done');
                resolve();
              });
          });
      }
    })
  );

  /**
   * Delete the temporary folder.
   *
   * @returns {void}
   */
  removeFiles = () => {
    logBlock(`Removing temp folder ${this.tempDir}`);
    fs.removeSync(this.tempDir);
  };

  /**
   * Things to do after everything is done.
   *
   * @returns {void}
   */
  allFinished = () => {
    if (config.delete_on_complete) {
      this.removeFiles();
    }
    this.writeLatest(this.files.map(file => file.filename));
  }
}

export default Posti;
