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
    test('should find config', () => {
      const config = '~/.posti/config.js';
      const homePath = path.resolve(os.homedir());
      let mockProcess = {
        env: {
          PWD: process.env.PWD,
          NODE_ENV: 'example',
        },
        argv: [...process.argv],
        exit: code => logError(code),
      };

      expect(findDatabaseConfig(mockProcess)).toBe(path.resolve(process.env.PWD, `posti.config.${mockProcess.env.NODE_ENV}.js`));

      mockProcess = {
        env: {
          PWD: process.env.PWD,
        },
        argv: [
          process.argv[0],
          process.argv[1],
          `--config=${config}`,
        ],
        exit: code => logError(code),
      };
      expect(findDatabaseConfig(mockProcess)).toBe(path.resolve(homePath, '.posti/config.js'));

      mockProcess = {
        env: {
          PWD: process.env.PWD,
          config,
        },
        argv: [...process.argv],
        exit: code => logError(code),
      };
      expect(findDatabaseConfig(mockProcess)).toBe(path.resolve(homePath, '.posti/config.js'));

      mockProcess = {
        env: {
          PWD: process.env.PWD,
        },
        argv: [],
        exit: code => logError(code),
      };
      expect(findDatabaseConfig(mockProcess)).toBe(path.resolve(homePath, '.posti/config.js'));
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
