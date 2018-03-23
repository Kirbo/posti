#!/usr/bin/env ./node_modules/.bin/babel-node

import 'babel-polyfill';

import {
  logBlock,
  logError,
  logFinished,
  findDatabaseConfig,
  millisecondsToTime,
} from './utils';

import Sequelize from './classes/Sequelize';
import postiConfig from './config';

const started = new Date();

const configPath = findDatabaseConfig();
global.config = require(configPath).default;
global.postiConfig = postiConfig;

(async () => {
  try {
    logBlock(`Using config from: ${configPath}`);
    logBlock('Creating GraphlQL schemas:');

    const database = new Sequelize();
    [
      'ADDRESSES',
      'ZIPCODES',
      'ZIPCODE_CHANGES',
    ].forEach(async (model) => {
      await database.createTableSchema(model);
    });

    logFinished(millisecondsToTime(new Date() - started));
    process.exit(0);
  } catch (error) {
    logError(error);
  }
})();
