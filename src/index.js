#!/usr/bin/env ./node_modules/.bin/babel-node

import {
  logBlock,
  logError,
  logFinished,
} from './utils';

import Posti from './classes/Posti';
import Database from './classes/database';

/**
 * Need to wrap these, so that i can use await
 *
 * @returns {void}
*/
const start = async () => {
  const posti = new Posti();
  await posti.createCacheDir();
  const files = await posti.fecthFileUrls();
  const newFiles = await posti.getNewFiles();

  if (newFiles.length > 0) {
    const database = new Database();
    global.database = database;
    await database.connect(newFiles.map(file => file.model));
    await database.createTempTables();
    await posti.setNewFiles(newFiles);
    await posti.processFiles(files);
  } else {
    logBlock('No new files to process');
  }

  logFinished('All done, reward yourself with a nice cold beer for all the hard work.');
  process.exit(0);
};

try {
  start();
} catch (error) {
  logError(error);
}
