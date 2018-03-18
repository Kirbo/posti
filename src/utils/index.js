import fs from 'fs-extra';
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
 * @param {String} prefix - Prefix.
 * @param {Object} proc - Process.
 *
 * @returns {String} Path to configs.
 */
const findDatabaseConfig = (prefix = '', proc = process) => {
  let returnConfigFile;
  let customPath;
  const args = proc.argv.slice(2);

  const BINARY_NAME = Object.keys(packageJSON.bin)[0];

  const projectNodeEnvConfig = path.resolve(proc.env.PWD, `${prefix}posti.config.${proc.env.NODE_ENV}.js`);
  const projectConfig = path.resolve(proc.env.PWD, `${prefix}posti.config.js`);
  const homeConfig = path.resolve(os.homedir(), `.posti/${prefix}config.js`);

  if (proc.env.config) {
    customPath = proc.env.config;
    returnConfigFile = customPath;
  } else if (args.length > 0) {
    const regex = /--config="?(.*)"?/;
    const configArg = args.find(a => a.match(regex));
    if (configArg) {
      customPath = configArg.match(regex)[1].toString();
      returnConfigFile = customPath;
    }
  }

  if (fs.existsSync(projectNodeEnvConfig)) {
    returnConfigFile = projectNodeEnvConfig;
  } else if (fs.existsSync(projectConfig)) {
    returnConfigFile = projectConfig;
  } else if (fs.existsSync(homeConfig)) {
    returnConfigFile = homeConfig;
  }

  if (returnConfigFile) {
    returnConfigFile = returnConfigFile.replace('~', os.homedir());
  }

  if (fs.existsSync(returnConfigFile)) {
    return returnConfigFile;
  } else {
    if (customPath) {
      console.error(_colors.red('Config not found from:'));
      console.error(`  ${customPath}`);
    } else {
      console.error(_colors.red('Config not found.'));
    }
    console.error(_colors.grey('Define config in one of the following paths:'));
    console.error(`  ${projectNodeEnvConfig}`);
    console.error(`  ${projectConfig}`);
    console.error(`  ${homeConfig}`);
    console.error();
    console.error(_colors.grey('..or define the path with one of the following ways:'));
    console.error(`    ${BINARY_NAME} --config=/path/to/config.js`);
    console.error(`    config=/path/to/config.js ${BINARY_NAME}`);

    proc.exit(1);
  }
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
