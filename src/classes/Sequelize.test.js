import {
  findDatabaseConfig,
} from '../utils';

import Sequelize from './Sequelize';

const configPath = findDatabaseConfig();
global.config = require(configPath).default;
global.config.tablePrefix = 'test_sequelize_';

const database = new Sequelize();

describe('Sequelize', () => {
  beforeAll(() => {
    // Set timeout to 10 minutes
    jest.setTimeout(10 * 60 * 1000);
  });

  test('should not be connected', async () => {
    expect(await database.isConnected()).toBe(false);
  });

  test('should connect', async () => {
    await database.connect();
    expect(await database.isConnected()).toBe(true);
  });

  test('should already be connected', async () => {
    await database.connect();
    expect(await database.isConnected()).toBe(true);
  });

  describe('getTableName()', () => {
    test('should get nameProcessing for tables', async () => {
      expect(database.getTableName('ADDRESSES').nameProcessing).toBe('test_sequelize_temp_addresses');
      expect(database.getTableName('ZIPCODES').nameProcessing).toBe('test_sequelize_temp_postalcodes');
      expect(database.getTableName('ZIPCODE_CHANGES').nameProcessing).toBe('test_sequelize_postalcode_changes');
    });
  });

  describe('getTableDefinitions()', () => {
    test('should get definitions for tables', async () => {
      expect(typeof database.getTableDefinitions('ADDRESSES')).toBe('object');
      expect(typeof database.getTableDefinitions('ZIPCODES')).toBe('object');
      expect(typeof database.getTableDefinitions('ZIPCODE_CHANGES')).toBe('object');
    });
  });

  describe('getFileModelName()', () => {
    test('should get model name for tables', async () => {
      expect(database.getFileModelName('BAF')).toBe('ADDRESSES');
      expect(database.getFileModelName('PCF')).toBe('ZIPCODES');
      expect(database.getFileModelName('POM')).toBe('ZIPCODE_CHANGES');
    });
  });

  describe('getTableIndexes()', () => {
    test('should get indexes for tables', async () => {
      expect(typeof database.getTableIndexes('ADDRESSES')).toBe('object');
      expect(typeof database.getTableIndexes('ZIPCODES')).toBe('object');
      expect(typeof database.getTableIndexes('ZIPCODE_CHANGES')).toBe('object');
    });
  });

  describe('getTableDatabaseOptions()', () => {
    test('should get options for table definitions', async () => {
      expect(typeof database.getTableDatabaseOptions('ADDRESSES')).toBe('object');
      expect(typeof database.getTableDatabaseOptions('ZIPCODES')).toBe('object');
      expect(typeof database.getTableDatabaseOptions('ZIPCODE_CHANGES')).toBe('object');
    });
  });

  describe('getTableConfigs()', () => {
    test('should get table configs', async () => {
      expect(typeof database.getTableConfigs('ADDRESSES')).toBe('object');
      expect(typeof database.getTableConfigs('ZIPCODES')).toBe('object');
      expect(typeof database.getTableConfigs('ZIPCODE_CHANGES')).toBe('object');
    });
  });

  describe('getTableModel()', () => {
    test('should not get table model', async () => {
      expect(typeof database.getTableModel('ADDRESSES')).toBe('undefined');
      expect(typeof database.getTableModel('ZIPCODES')).toBe('undefined');
      expect(typeof database.getTableModel('ZIPCODE_CHANGES')).toBe('undefined');
    });
  });

  test('should cast correctly', async () => {
    expect(database.castProperties({ type: 'number' }, '5')).toBe(5);
    expect(database.castProperties({ type: 'YYYYMMDD' }, '20180101')).toBe('2018-01-01');
    expect(database.castProperties({ type: 'test' }, '')).toBe(null);
    expect(database.castProperties({ type: 'other' }, 'hurrdurr')).toBe('hurrdurr');
  });

  describe('defineTable()', () => {
    test('should define table model', async () => {
      await database.defineTable('ADDRESSES');
      await database.defineTable('ZIPCODES');
      await database.defineTable('ZIPCODE_CHANGES');

      expect(typeof database.getTableModel('ADDRESSES')).toBe('function');
      expect(typeof database.getTableModel('ZIPCODES')).toBe('function');
      expect(typeof database.getTableModel('ZIPCODE_CHANGES')).toBe('function');
    });
  });

  describe('tableExists()', () => {
    test('should not have tables', async () => {
      expect(await database.tableExists(database.getTableName('ADDRESSES').nameProcessing)).toBe(false);
      expect(await database.tableExists(database.getTableName('ZIPCODES').nameProcessing)).toBe(false);
      expect(await database.tableExists(database.getTableName('ZIPCODE_CHANGES').nameProcessing)).toBe(false);
    });
  });

  describe('createTempTables()', () => {
    test('should create temp tables', async () => {
      await database.createTempTables(['ADDRESSES', 'ZIPCODES']);
      expect(await database.tableExists(database.getTableName('ADDRESSES').nameProcessing)).toBe(true);
      expect(await database.tableExists(database.getTableName('ZIPCODES').nameProcessing)).toBe(true);
      expect(await database.tableExists(database.getTableName('ZIPCODE_CHANGES').nameProcessing)).toBe(false);
      await database.createTempTables(['ADDRESSES', 'ZIPCODES', 'ZIPCODE_CHANGES']);
      expect(await database.tableExists(database.getTableName('ADDRESSES').nameProcessing)).toBe(true);
      expect(await database.tableExists(database.getTableName('ZIPCODES').nameProcessing)).toBe(true);
      expect(await database.tableExists(database.getTableName('ZIPCODE_CHANGES').nameProcessing)).toBe(true);
      await database.createTempTables(['ADDRESSES', 'ZIPCODES', 'ZIPCODE_CHANGES']);
    });
  });

  describe('renameTable()', () => {
    test('should rename table', async () => {
      const oldName = database.getTableName('ADDRESSES').nameProcessing;
      const newName = `${oldName}_new`;
      expect(await database.tableExists(newName)).toBe(false);
      expect(await database.renameTable(oldName, newName)).toBe(true);
      expect(await database.tableExists(newName)).toBe(true);
      expect(await database.renameTable(oldName, newName)).toBe(null);
    });
  });

  describe('dropTable()', () => {
    test('should drop test tables', async () => {
      const tableName = `${database.getTableName('ADDRESSES').nameProcessing}_new`;
      expect(await database.tableExists(tableName)).toBe(true);
      expect(await database.tableExists(database.getTableName('ZIPCODES').nameProcessing)).toBe(true);
      expect(await database.tableExists(database.getTableName('ZIPCODE_CHANGES').nameProcessing)).toBe(true);
      expect(await database.dropTable(tableName)).toBe(true);
      expect(await database.dropTable(database.getTableName('ZIPCODES').nameProcessing)).toBe(true);
      expect(await database.dropTable(database.getTableName('ZIPCODE_CHANGES').nameProcessing)).toBe(true);
      expect(await database.tableExists(tableName)).toBe(false);
      expect(await database.tableExists(database.getTableName('ADDRESSES').nameProcessing)).toBe(false);
      expect(await database.tableExists(database.getTableName('ZIPCODES').nameProcessing)).toBe(false);
      expect(await database.tableExists(database.getTableName('ZIPCODE_CHANGES').nameProcessing)).toBe(false);
      expect(await database.dropTable(database.getTableName('ZIPCODE_CHANGES').nameProcessing)).toBe(null);
    });
  });
});
