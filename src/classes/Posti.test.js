import 'jest-plugin-console-matchers/setup';

import Posti from './Posti';

const posti = new Posti();

describe('Posti', () => {
  test('should get model for file BAF', () => {
    expect(posti.getModel('BAF')).toBe('ADDRESSES');
  });
  test('should get model for file PCF', () => {
    expect(posti.getModel('PCF')).toBe('ZIPCODES');
  });
  test('should get model for file POM', () => {
    expect(posti.getModel('POM')).toBe('ZIPCODE_CHANGES');
  });
  test('should get null for file test', () => {
    expect(posti.getModel('test')).toBe(null);
  });

  test('should ensure cache dir', async () => {
    expect(await posti.createCacheDir()).toBe(undefined);
  });
  test('should write latest files', async () => {
    expect(posti.writeLatest('test,testing,it works')).toBe(undefined);
  });
  test('should get latest files', async () => {
    expect(await posti.getNewFiles()).toEqual([]);
  });

  test('should set new files', async () => {
    expect(await posti.setNewFiles(['teest', 'testing', 'it work3as'])).toBe(undefined);
  });
});
