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
  console.info(`${_colors.green('***')} ${block}`); // eslint-disable-line
};

/**
 * Output step for the block.
 *
 * @param {String} step - Name of the step.
 *
 * @returns {void}
 */
const logStep = (step) => {
  console.info(`${_colors.yellow('    *')} ${step}`); // eslint-disable-line
};

/**
 * Output error.
 *
 * @param {String} error - Error.
 *
 * @returns {void}
 */
const logError = (error) => {
  console.error(`${_colors.red('!!!')} ${error} ${_colors.red('!!!')}`); // eslint-disable-line
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
  console.info(`-----\n🍺 ${_colors.green(text)}\n`); // eslint-disable-line
};


/**
 * Slice the array ingo smaller chunks.
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
 * @returns {String} - Path to configs.
*/
const findDatabaseConfig = () => {
  let dbConfigFile;
  let customPath;
  const args = process.argv.slice(2);

  const BINARY_NAME = Object.keys(packageJSON.bin)[0];

  // If user defined config with env.
  if (process.env.config) {
    customPath = process.env.config;
    // If user defined config with arguments.
  } else if (args.length > 0) {
    const regex = /--config="?(.*)"?/;
    const configArg = args.find(a => a.match(regex));
    // If "--config" argument was found.
    if (configArg) {
      customPath = configArg.match(regex)[1].replace('~', os.homedir());
    }
  }

  // Default config path.
  dbConfigFile = path.resolve(process.env.PWD, 'posti.config.js');
  // Config in user homedir.
  const homeDbConfigFile = path.resolve(os.homedir(), '.posti/config.js');

  // Check default config file is not found and config is found in homedir.
  if (!fs.existsSync(dbConfigFile) && fs.existsSync(homeDbConfigFile)) {
    dbConfigFile = homeDbConfigFile;
  }

  if (!customPath && process.env.NODE_ENV) {
    dbConfigFile = path.resolve(process.env.PWD, `posti.config.${process.env.NODE_ENV}.js`);
  }

  // If user didn't define config with either env or argument and config wasn't found.
  if (!customPath && !fs.existsSync(dbConfigFile)) {
    /* eslint-disable */
    console.error(`
${_colors.red('Config not found.')}
${_colors.grey('Define config in one of the following paths:')}
  ${dbConfigFile}
  ${homeDbConfigFile}

${_colors.grey('..or define the path with one of the following ways:')}
    ${BINARY_NAME} --config=/path/to/config.js
    config=/path/to/config.js ${BINARY_NAME}
`);
    /* eslint-enable */
    process.exit(1);
  }

  // If user defined the custom config path with either arg or env.
  if (customPath) {
    dbConfigFile = customPath;
  }

  // If the config file is not found.
  if (!fs.existsSync(dbConfigFile)) {
    /* eslint-disable */
    console.error(`
${_colors.red('Config not found from:')}
  ${dbConfigFile}
  `);
    /* eslint-enable */
    process.exit(1);
  }

  return dbConfigFile;
};

export {
  logBlock,
  logStep,
  logError,
  logFinished,
  sliceArrayIntoChunks,
  findDatabaseConfig,
};
