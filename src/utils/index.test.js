import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import 'jest-plugin-console-matchers/setup';

import {
  logBlock,
  logStep,
  logError,
  logFinished,
  sliceArrayIntoChunks,
  findDatabaseConfig,
  millisecondsToTime,
  returnFalse,
} from './index';

describe('utils', () => {
  describe('logBlock()', () => {
    test('should console.info()', () => {
      expect(() => logBlock('It worked')).toConsoleInfo();
    });
  });

  describe('logStep()', () => {
    test('should console.info()', () => {
      expect(() => logStep('It worked')).toConsoleInfo();
    });
  });

  describe('logError()', () => {
    test('should throw error', () => {
      expect(() => { logError('It worked'); }).toThrow(new Error('It worked'));
    });
  });

  describe('logFinished()', () => {
    test('should console.info()', () => {
      expect(() => logFinished('It worked')).toConsoleInfo();
    });
  });

  describe('sliceArrayIntoChunks()', () => {
    test('should slice array into 2 chunks', () => {
      expect(sliceArrayIntoChunks([1, 2, 3, 4, 5, 6, 7, 8, 9, 0], 5)).toHaveLength(2);
    });
    test('should slice array into 4 chunks', () => {
      expect(sliceArrayIntoChunks([1, 2, 3, 4, 5, 6, 7, 8, 9, 0], 3)).toHaveLength(4);
    });
    test('should slice array into 5 chunks', () => {
      expect(sliceArrayIntoChunks([1, 2, 3, 4, 5, 6, 7, 8, 9, 0], 2)).toHaveLength(5);
    });
  });

  describe('findDatabaseConfig()', () => {
    test('should not find any configs', () => {
      const mockProcess = {
        env: {
          PWD: process.env.PWD,
        },
        argv: [...process.argv],
        exit: () => undefined,
      };
      expect(findDatabaseConfig('test_', mockProcess)).toBe(undefined);
    });

    test('should find NODE_ENV config', () => {
      const mockProcess = {
        env: {
          PWD: process.env.PWD,
          NODE_ENV: 'example',
        },
        argv: [...process.argv],
        exit: () => {},
      };
      const testConfigFile = path.resolve(mockProcess.env.PWD, `test_posti.config.${mockProcess.env.NODE_ENV}.js`);
      fs.writeFileSync(testConfigFile, 'test', 'utf8');
      expect(findDatabaseConfig('test_', mockProcess)).toBe(testConfigFile);
      fs.removeSync(testConfigFile);
    });

    test('should not find NODE_ENV config', () => {
      const mockProcess = {
        env: {
          PWD: process.env.PWD,
          NODE_ENV: 'not_working',
        },
        argv: [...process.argv],
        exit: () => undefined,
      };
      expect(findDatabaseConfig('test_', mockProcess)).toBe(undefined);
    });

    test('should not find config from argv', () => {
      const config = '~/.posti/test_config.js';
      const mockProcess = {
        env: {
          PWD: process.env.PWD,
        },
        argv: [
          process.argv[0],
          process.argv[1],
          `--testing=${config}`,
        ],
        exit: () => undefined,
      };
      expect(findDatabaseConfig('test_', mockProcess)).toBe(undefined);
    });

    test('should find config from argv', () => {
      const config = '~/.posti/test_config.js';
      const homePath = path.resolve(os.homedir());
      const homeConfig = path.resolve(homePath, '.posti/test_config.js');
      const mockProcess = {
        env: {
          PWD: process.env.PWD,
        },
        argv: [
          process.argv[0],
          process.argv[1],
          `--config=${config}`,
        ],
        exit: () => undefined,
      };
      const testConfigFile = homeConfig;
      fs.writeFileSync(testConfigFile, 'test', 'utf8');
      expect(findDatabaseConfig('test_', mockProcess)).toBe(testConfigFile);
      fs.removeSync(testConfigFile);
    });

    test('should find config from project', () => {
      const mockProcess = {
        env: {
          PWD: process.env.PWD,
        },
        argv: [...process.argv],
        exit: () => undefined,
      };
      const testConfigFile = path.resolve(mockProcess.env.PWD, 'test_posti.config.js');
      fs.writeFileSync(testConfigFile, 'test', 'utf8');
      expect(findDatabaseConfig('test_', mockProcess)).toBe(testConfigFile);
      fs.removeSync(testConfigFile);
    });

    test('should find config from env', () => {
      const config = '~/.posti/test_config.js';
      const homePath = path.resolve(os.homedir());
      const homeConfig = path.resolve(homePath, '.posti/test_config.js');
      const mockProcess = {
        env: {
          PWD: process.env.PWD,
          config,
        },
        argv: [...process.argv],
        exit: () => undefined,
      };
      const testConfigFile = homeConfig;
      fs.writeFileSync(testConfigFile, 'test', 'utf8');
      expect(findDatabaseConfig('test_', mockProcess)).toBe(testConfigFile);
      fs.removeSync(testConfigFile);
    });

    test('should not find config from env', () => {
      const config = '~/.posti/test_config_not_found.js';
      const mockProcess = {
        env: {
          PWD: process.env.PWD,
          config,
        },
        argv: [...process.argv],
        exit: () => undefined,
      };
      expect(findDatabaseConfig('test_', mockProcess)).toBe(undefined);
    });

    test('should not find any configs', () => {
      const mockProcess = {
        env: {
          PWD: process.env.PWD,
        },
        argv: [],
        exit: () => undefined,
      };
      expect(findDatabaseConfig('test_', mockProcess)).toBe(undefined);
    });

    test('should find global config from os.homedir()', () => {
      const homePath = path.resolve(os.homedir());
      const homeConfig = path.resolve(homePath, '.posti/config.js');
      expect(findDatabaseConfig()).toBe(homeConfig);
    });
  });

  describe('millisecondsToTime()', () => {
    test('should return 00:00:00.001', () => {
      expect(millisecondsToTime(1)).toBe('00:00:00.001');
    });
    test('should return 00:00:00.010', () => {
      expect(millisecondsToTime(10)).toBe('00:00:00.010');
    });
    test('should return 00:00:00.100', () => {
      expect(millisecondsToTime(100)).toBe('00:00:00.100');
    });
    test('should return 00:00:01.000', () => {
      expect(millisecondsToTime(1000)).toBe('00:00:01.000');
    });
    test('should return 00:01:00.000', () => {
      expect(millisecondsToTime(60000)).toBe('00:01:00.000');
    });
    test('should return 01:00:00.000', () => {
      expect(millisecondsToTime(3600000)).toBe('01:00:00.000');
    });
    test('should return 12:34:56.789', () => {
      expect(millisecondsToTime(45296789)).toBe('12:34:56.789');
    });
  });

  describe('returnFalse()', () => {
    test('should return false', () => {
      expect(returnFalse()).toBe(false);
    });
  });
});
