import fs from 'fs';
import path from 'path';
import os from 'os';
import _colors from 'colors';

import packageJSON from '../../package.json';

/**
 * Output block.
 *
 * @param {String} block - Name of the block.
 *
 * @returns {void}
 */
const logBlock = (block) => {
  console.info(`${_colors.green('***')} ${block}`);
};

/**
 * Output step for the block.
 *
 * @param {String} step - Name of the step.
 *
 * @returns {void}
 */
const logStep = (step) => {
  console.info(`${_colors.yellow('    *')} ${step}`);
};

/**
 * Output error.
 *
 * @param {String} error - Error.
 *
 * @returns {void}
 */
const logError = (error) => {
  console.error(`${_colors.red('!!!')} ${error} ${_colors.red('!!!')}`);
  throw new Error(error);
};

/**
 * Output 'all done'.
 *
 * @param {String} text - Text for output.
 *
 * @returns {void}
 */
const logFinished = (text) => {
  console.info(`-----\n${_colors.green(`Finished in: ${text}`)}\n`);
};

/**
 * Slice the array into smaller chunks.
 *
 * @param {Array} array - Array.
 * @param {Integer} size - Size of the chunk.
 *
 * @returns {Array} Array of chunks
 */
const sliceArrayIntoChunks = (array, size) => {
  const result = [];

  while (array.length > 0) {
    result.push(array.splice(0, size));
  }

  return result;
};

/**
 * Find Database configs.
 *
 * @param {Object} proc - proc.
 *
 * @returns {String} Path to configs.
 */
const findDatabaseConfig = (proc = process) => {
  let dbConfigFile;
  let customPath;
  const args = proc.argv.slice(2);

  const BINARY_NAME = Object.keys(packageJSON.bin)[0];

  // If user defined config with env.
  if (proc.env.config) {
    customPath = proc.env.config;
    // If user defined config with proc.
  } else if (args.length > 0) {
    const regex = /--config="?(.*)"?/;
    const configArg = args.find(a => a.match(regex));
    // If "--config" argument was found.
    if (configArg) {
      customPath = configArg.match(regex)[1].toString();
    }
  }

  // Default config path.
  dbConfigFile = path.resolve(proc.env.PWD, 'posti.config.js');
  // Config in user homedir.
  const homeDbConfigFile = path.resolve(os.homedir(), '.posti/config.js');

  // Check default config file is not found and config is found in homedir.
  if (!fs.existsSync(dbConfigFile) && fs.existsSync(homeDbConfigFile)) {
    dbConfigFile = homeDbConfigFile;
  }

  if (!customPath && proc.env.NODE_ENV) {
    const envFile = path.resolve(proc.env.PWD, `posti.config.${proc.env.NODE_ENV}.js`);
    if (fs.existsSync(envFile)) {
      dbConfigFile = envFile;
    }
  }

  // If user didn't define config with either env or argument and config wasn't found.
  if (!customPath && !fs.existsSync(dbConfigFile)) {
    console.error(_colors.red('Config not found.'));
    console.error(_colors.grey('Define config in one of the following paths:'));
    console.error(`  ${dbConfigFile}`);
    console.error(`  ${homeDbConfigFile}`);
    console.error();
    console.error(_colors.grey('..or define the path with one of the following ways:'));
    console.error(`    ${BINARY_NAME} --config=/path/to/config.js`);
    console.error(`    config=/path/to/config.js ${BINARY_NAME}`);

    proc.exit(1);
  }

  // If user defined the custom config path with either arg or env.
  if (customPath) {
    dbConfigFile = customPath.replace('~', os.homedir());
  }

  // If the config file is not found.
  if (!fs.existsSync(dbConfigFile)) {
    console.error(_colors.red('Config not found from:'));
    console.error(`  ${dbConfigFile}`);

    proc.exit(1);
  }

  return dbConfigFile;
};

/**
 * Convert milliseconds to time duration.
 *
 * @param {Integer} duration - Duration.
 *
 * @returns {String} - Human readable duration.
 */
const millisecondsToTime = (duration) => {
  let milliseconds = parseInt(duration % 1000, 10);
  let seconds = 0;
  let minutes = 0;
  let hours = 0;

  if (duration >= 1000) {
    seconds = parseInt((duration / 1000) % 60, 10);
  }
  if (duration >= (60 * 1000)) {
    minutes = parseInt((duration / (1000 * 60)) % 60, 10);
  }
  if (duration >= (60 * 60 * 1000)) {
    hours = parseInt((duration / (1000 * 60 * 60)) % 24, 10);
  }

  hours = (hours < 10) ? `0${hours}` : hours;
  minutes = (minutes < 10) ? `0${minutes}` : minutes;
  seconds = (seconds < 10) ? `0${seconds}` : seconds;
  if (milliseconds < 10) {
    milliseconds = `00${milliseconds}`;
  } else if (milliseconds < 100) {
    milliseconds = `0${milliseconds}`;
  }

  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
};

/**
 * Return false.
 *
 * @returns {false} False.
 */
const returnFalse = () => (
  false
);

export {
  logBlock,
  logStep,
  logError,
  logFinished,
  sliceArrayIntoChunks,
  findDatabaseConfig,
  millisecondsToTime,
  returnFalse,
};
