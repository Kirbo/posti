import fs from 'fs-extra';
import _colors from 'colors';
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
  describe('logBlock("It worked")', () => {
    test('should console.info "*** It Worked"', () => {
      expect(() => logBlock('It worked')).toConsoleInfo(`${_colors.green('***')} It worked`);
    });
  });

  describe('logStep("It worked")', () => {
    test('should console.info "  * It Worked"', () => {
      expect(() => logStep('It worked')).toConsoleInfo(`${_colors.yellow('    *')} It worked`);
    });
  });

  describe('logError("It worked")', () => {
    test('should throw error', () => {
      expect(() => { logError('It worked'); }).toThrow(new Error('It worked'));
    });
  });

  describe('logFinished("It worked")', () => {
    test('should not return anything', () => {
      expect(() => logFinished('It worked')).toConsoleInfo(`-----\n🍺 ${_colors.green('It worked')}\n`);
    });
  });

  describe('sliceArrayIntoChunks()', () => {
    test('should slice array into smaller chunks', () => {
      expect(sliceArrayIntoChunks([1, 2, 3, 4, 5, 6, 7, 8, 9, 0], 5)).toHaveLength(2);
      expect(sliceArrayIntoChunks([1, 2, 3, 4, 5, 6, 7, 8, 9, 0], 3)).toHaveLength(4);
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
    test('should return correcly', () => {
      expect(millisecondsToTime(1)).toBe('00:00:00.001');
      expect(millisecondsToTime(10)).toBe('00:00:00.010');
      expect(millisecondsToTime(100)).toBe('00:00:00.100');
      expect(millisecondsToTime(1000)).toBe('00:00:01.000');
      expect(millisecondsToTime(60000)).toBe('00:01:00.000');
      expect(millisecondsToTime(3600000)).toBe('01:00:00.000');
      expect(millisecondsToTime(45296789)).toBe('12:34:56.789');
    });
  });

  describe('returnFalse()', () => {
    test('should return false', () => {
      expect(returnFalse()).toBe(false);
    });
  });
});
