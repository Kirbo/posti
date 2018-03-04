import _colors from 'colors';
import path from 'path';
import 'jest-plugin-console-matchers/setup';

import {
  logBlock,
  logStep,
  logError,
  logFinished,
  sliceArrayIntoChunks,
  findDatabaseConfig,
} from './index';

describe('utils', () => {
  test('logBlock("It worked") should console.info "*** It Worked"', () => {
    expect(() => logBlock('It worked')).toConsoleInfo(`*** ${_colors.green('It worked')}`);
  });
  test('logStep("It worked") should console.info "     * It Worked"', () => {
    expect(() => logStep('It worked')).toConsoleInfo(`     * ${_colors.green('It worked')}`);
  });
  test('logError("It worked") should throw error', () => {
    expect(() => { logError('It worked'); }).toThrow(new Error('It worked'));
  });
  test('logFinished("It worked") should not return anything', () => {
    expect(() => logFinished('It worked')).toConsoleInfo(`-----\n🍺 ${_colors.green('It worked')}\n`);
  });
  test('sliceArrayIntoChunks() should slice array into smaller chunks', () => {
    expect(sliceArrayIntoChunks([1, 2, 3, 4, 5, 6, 7, 8, 9, 0], 5)).toHaveLength(2);
    expect(sliceArrayIntoChunks([1, 2, 3, 4, 5, 6, 7, 8, 9, 0], 3)).toHaveLength(4);
    expect(sliceArrayIntoChunks([1, 2, 3, 4, 5, 6, 7, 8, 9, 0], 2)).toHaveLength(5);
  });
  test('findDatabaseConfig() should find config', () => {
    expect(findDatabaseConfig()).toBe(path.resolve(process.env.PWD, 'posti.config.test.js'));
    const config = path.resolve(process.env.PWD, 'posti.config.test.js');
    process.env.config = config;
    expect(findDatabaseConfig()).toBe(config);
  });
});
