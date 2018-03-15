#!/usr/bin/env ./node_modules/.bin/babel-node

import '@babel/polyfill';

import {
  logBlock,
  logError,
  logFinished,
  findDatabaseConfig,
  millisecondsToTime,
} from './utils';

import Posti from './classes/Posti';
import Sequelize from './classes/Sequelize';
import postiConfig from './config';

const started = new Date();

const configPath = findDatabaseConfig();
global.config = require(configPath).default;
global.postiConfig = postiConfig;

(async () => {
  try {
    logBlock(`Using config from: ${configPath}`);

    const posti = new Posti();
    const database = new Sequelize();
    global.database = database;

    await posti.createCacheDir();
    const files = await posti.fecthFileUrls();
    const newFiles = await posti.getNewFiles();

    if (newFiles.length) {
      await database.connect();
      await database.createTempTables(newFiles.map(file => file.model));
      await posti.setNewFiles(newFiles);
      await posti.processFiles(files);
    } else {
      logBlock('No new files to process');
    }

    logFinished(millisecondsToTime(new Date() - started));
    process.exit(0);
  } catch (error) {
    logError(error);
  }
})();
