import 'jest-plugin-console-matchers/setup';

import path from 'path';
import os from 'os';
import fs from 'fs-extra';

import {
  logError,
  findDatabaseConfig,
} from '../utils';

import Posti from './Posti';
import Sequelize from './Sequelize';
import postiConfig from '../config';

const configPath = findDatabaseConfig();
global.config = require(configPath).default;
global.config.tablePrefix = `${global.config.tablePrefix}test_posti_`;
global.postiConfig = postiConfig;

const posti = new Posti();
global.database = new Sequelize();

const latest = 'test_latest.json';
const cacheDir = path.resolve(`${os.homedir()}/.posti`);
const latestFile = path.resolve(`${cacheDir}/${latest}`);
const tempDir = path.resolve(`${cacheDir}/data`);

global.postiConfig.cache.latestFile = latestFile;

const randomFile = {
  url: 'https://google.com',
  filename: 'index.html',
  extensionless: 'index',
  model: undefined,
};

let files;

describe('Posti', () => {
  beforeAll(async () => {
    jest.setTimeout(10 * 60 * 1000); // Set timeout to 10 minutes
    await global.database.connect();
  });

  describe('createCacheDir()', () => {
    test('should ensure cache dir', async () => {
      expect(await posti.createCacheDir()).toBe(undefined);
    });
  });

  describe('getNewFiles()', () => {
    test('should not get latest files', async () => {
      fs.removeSync(latestFile);
      expect(await posti.getNewFiles()).toEqual([]);
    });
  });

  describe('writeLatest()', () => {
    test('should write latest files', async () => {
      expect(await posti.writeLatest('test,testing,it works')).toBe(undefined);
    });
  });

  describe('getLatest()', () => {
    test('should get latest files', async () => {
      expect(await posti.getLatest()).toBe('test,testing,it works');
    });
  });

  describe('setNewFiles()', () => {
    test('should set new files', async () => {
      expect(await posti.setNewFiles(['test', 'testing', 'it works'])).toBe(undefined);
    });
  });

  describe('fecthFileUrls()', () => {
    test('should fetch file data', async () => {
      files = await posti.fecthFileUrls();
      expect(files.length).toBe(3);
      files.forEach((file) => {
        const keys = Object.keys(file);
        expect(keys).toContain('extensionless');
        expect(keys).toContain('filename');
        expect(keys).toContain('model');
        expect(keys).toContain('url');
      });
      expect(files[0].model).toBe('ADDRESSES');
      expect(files[1].model).toBe('ZIPCODES');
      expect(files[2].model).toBe('ZIPCODE_CHANGES');
    });
  });

  describe('writeLatest()', () => {
    test('should write latest files', async () => {
      expect(await posti.writeLatest(files.filter(f => f.model !== 'ZIPCODES').map(file => file.filename))).toBe(undefined);
    });
  });

  describe('getNewFiles()', () => {
    test('should get new files', async () => {
      const newFiles = await posti.getNewFiles();
      expect(newFiles.length).toBe(1);
    });
    test('should force get process all files', async () => {
      const mockProcess = {
        env: {
          PWD: process.env.PWD,
          force: true,
        },
        argv: [],
        exit: code => logError(code),
      };

      const newFiles = await posti.getNewFiles(mockProcess);
      expect(newFiles.length).toEqual(3);
    });
  });

  describe('processFiles()', () => {
    test('should process all files and clean after', async () => {
      await posti.createCacheDir();
      await global.database.createTempTables(['ZIPCODES']);

      const file = files.find(f => f.model === 'ZIPCODES');

      await posti.setNewFiles([file]);
      global.config.process.deleteOnComplete = true;
      await posti.processFiles(files);
      expect(fs.existsSync(tempDir)).toBe(false);
    });

    test('should process all files and not to clean after', async () => {
      await posti.createCacheDir();
      await global.database.createTempTables(['ZIPCODES']);

      const file = files.find(f => f.model === 'ZIPCODES');

      await posti.setNewFiles([file]);
      global.config.process.deleteOnComplete = false;
      await posti.processFiles(files);
      expect(fs.existsSync(tempDir)).toBe(true);
    });
  });

  describe('processFile()', async () => {
    test('should process ZIPCODE_CHANGES file', async () => {
      await posti.createCacheDir();
      await global.database.createTempTables(['ZIPCODE_CHANGES']);

      const file = files.find(f => f.model === 'ZIPCODE_CHANGES');

      await posti.setNewFiles([file]);
      global.config.process.deleteOnComplete = false;
      await posti.processFile(file);
      expect(fs.existsSync(tempDir)).toBe(true);
      expect(fs.readdirSync(tempDir)).toContain(file.filename);
    });

    test('should skip processing ZIPCODE_CHANGES file', async () => {
      await posti.createCacheDir();
      await global.database.createTempTables(['ZIPCODE_CHANGES']);

      const file = files.find(f => f.model === 'ZIPCODE_CHANGES');

      await posti.setLatest();
      expect(await posti.processFile(file)).toBe(undefined);
    });
  });

  describe('parseFile()', () => {
    test('should not parse random file', async () => {
      posti.setFile(randomFile);
      expect(await posti.parseFile()).toBe(undefined);
    });
  });

  describe('clean()', () => {
    test('should clean up', async () => {
      const file = files.find(f => f.model === 'ZIPCODES');

      posti.setFile(file);
      await posti.clean();

      const tableConfigs = global.database.getTableConfigs(file.model);
      const oldTable = await global.database.dropTable(`${tableConfigs.nameFinished}_old`);

      expect(await global.database.tableExists(oldTable)).toBe(false);
    });

    test('should not clean up random file', async () => {
      posti.setFile(randomFile);
      expect(await posti.clean()).toBe(undefined);
    });
  });

  describe('removeFiles()', () => {
    test('should remove temp files', async () => {
      await posti.removeFiles();
      expect(fs.existsSync(tempDir)).toBe(false);
    });
  });

  describe('allFinished()', () => {
    test('should write latest files', async () => {
      await global.database.dropTable(global.database.getTableName('ADDRESSES').nameProcessing);
      await global.database.dropTable(global.database.getTableName('ADDRESSES').nameFinished);
      await global.database.dropTable(global.database.getTableName('ZIPCODES').nameProcessing);
      await global.database.dropTable(global.database.getTableName('ZIPCODES').nameFinished);
      await global.database.dropTable(global.database.getTableName('ZIPCODE_CHANGES').nameProcessing);

      await posti.allFinished();
      global.config.process.deleteOnComplete = true;
      await posti.allFinished();
      expect(fs.existsSync(tempDir)).toBe(false);
    });
  });
});
