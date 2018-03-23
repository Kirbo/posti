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

const started = new Date();

const configPath = findDatabaseConfig();
global.config = require(configPath).default;

(async () => {
  try {
    logBlock('Creating GraphQL schemas:');

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
