import 'jest-plugin-console-matchers/setup';

import path from 'path';
import os from 'os';
import fs from 'fs-extra';

import Posti from './Posti';

const posti = new Posti();

const tempDir = path.resolve(`${os.homedir()}/.posti/data`);
let files;

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

  test('should download ZIPCODES file', async () => {
    jest.setTimeout(10 * 60 * 1000); // Set timeout to 10 minutes
    const file = files.find(f => f.model === 'ZIPCODES');
    await posti.setFile(file);
    await posti.downloadFile();
    const dataDir = fs.readdirSync(tempDir);
    expect(dataDir).toContain(file.filename);
  });

  test('should unzip ZIPCODES file', async () => {
    jest.setTimeout(10 * 60 * 1000); // Set timeout to 10 minutes
    const file = files.find(f => f.model === 'ZIPCODES');
    await posti.setFile(file);
    await posti.unzipFile();
    const dataDir = fs.readdirSync(tempDir);
    expect(dataDir).toContain(`${file.extensionless}.dat`);
  });

  test('should convert ZIPCODES file', async () => {
    jest.setTimeout(10 * 60 * 1000); // Set timeout to 10 minutes
    const file = files.find(f => f.model === 'ZIPCODES');
    await posti.setFile(file);
    await posti.convertFile();
    const dataDir = fs.readdirSync(tempDir);
    expect(dataDir).toContain(`${file.extensionless}_utf8.dat`);
  });

  test.skip('should parse ZIPCODES file', async () => {
    jest.setTimeout(10 * 60 * 1000); // Set timeout to 10 minutes
    const file = files.find(f => f.model === 'ZIPCODES');
    await posti.setFile(file);
    await posti.parseFile();
    const dataDir = fs.readdirSync(tempDir);
    expect(dataDir).toContain(`${file.extensionless}_utf8.dat`);
  });

  test('should remove temp files', async () => {
    await posti.removeFiles();
    expect(fs.existsSync(tempDir)).toBe(false);
  });

  test('should write latest files', async () => {
    await posti.allFinished();
    expect(fs.existsSync(tempDir)).toBe(false);
  });
});
