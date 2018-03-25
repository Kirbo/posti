import {
  findDatabaseConfig,
} from '../utils';

import Sequelize from './Sequelize';

const configPath = findDatabaseConfig();
global.config = require(configPath).default;
const originalTablePrefix = global.config.tablePrefix;
global.config.tablePrefix = `${global.config.tablePrefix}test_sequelize_`;

const database = new Sequelize();

describe('Sequelize', () => {
  beforeAll(() => {
    // Set timeout to 10 minutes
    jest.setTimeout(10 * 60 * 1000);
  });

  describe('isConnected()', () => {
    test('should not be connected', async () => {
      expect(await database.isConnected()).toBe(false);
    });
  });

  describe('connect()', () => {
    test('should connect', async () => {
      await database.connect();
      expect(await database.isConnected()).toBe(true);
    });
  });

  describe('isConnected()', () => {
    test('should be connected', async () => {
      await database.connect();
      expect(await database.isConnected()).toBe(true);
    });
  });

  describe('getTableName()', () => {
    test('should get table names', async () => {
      expect(database.getTableName('ADDRESSES').nameProcessing)
        .toBe(`${originalTablePrefix}test_sequelize_temp_${global.config.tables.addresses.name}`);
      expect(database.getTableName('ADDRESSES').nameFinished)
        .toBe(`${originalTablePrefix}test_sequelize_${global.config.tables.addresses.name}`);
      expect(database.getTableName('ZIPCODES').nameProcessing)
        .toBe(`${originalTablePrefix}test_sequelize_temp_${global.config.tables.postalcodes.name}`);
      expect(database.getTableName('ZIPCODES').nameFinished)
        .toBe(`${originalTablePrefix}test_sequelize_${global.config.tables.postalcodes.name}`);
      expect(database.getTableName('ZIPCODE_CHANGES').nameProcessing)
        .toBe(`${originalTablePrefix}test_sequelize_temp_${global.config.tables.postalcode_changes.name}`);
      expect(database.getTableName('ZIPCODE_CHANGES').nameFinished)
        .toBe(`${originalTablePrefix}test_sequelize_${global.config.tables.postalcode_changes.name}`);
    });
  });

  describe('getTableDefinitions()', () => {
    test('should get table definitions', async () => {
      expect(typeof database.getTableDefinitions('ADDRESSES')).toBe('object');
      expect(typeof database.getTableDefinitions('ZIPCODES')).toBe('object');
      expect(typeof database.getTableDefinitions('ZIPCODE_CHANGES')).toBe('object');
    });
  });

  describe('getFileModelName()', () => {
    test('should get table model name', async () => {
      expect(database.getFileModelName('BAF')).toBe('ADDRESSES');
      expect(database.getFileModelName('PCF')).toBe('ZIPCODES');
      expect(database.getFileModelName('POM')).toBe('ZIPCODE_CHANGES');
    });
  });

  describe('getTableIndexes()', () => {
    test('should get table indexes', async () => {
      expect(typeof database.getTableIndexes('ADDRESSES')).toBe('object');
      expect(typeof database.getTableIndexes('ZIPCODES')).toBe('object');
      expect(typeof database.getTableIndexes('ZIPCODE_CHANGES')).toBe('object');
    });
  });

  describe('getTableDatabaseOptions()', () => {
    test('should get table options', async () => {
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

  describe('castProperties()', () => {
    test('should cast integer', async () => {
      expect(database.castProperties('integer', '5')).toBe(5);
    });
    test('should cast YYYYMMDD', async () => {
      expect(database.castProperties('YYYYMMDD', '20180101')).toBe('2018-01-01');
    });
    test('should cast null', async () => {
      expect(database.castProperties('test', '')).toBe(null);
    });
    test('should not cast string', async () => {
      expect(database.castProperties('other', 'hurrdurr')).toBe('hurrdurr');
    });
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
      expect(await database.tableExists(database.getTableName('ADDRESSES').nameFinished)).toBe(false);
      expect(await database.tableExists(database.getTableName('ZIPCODES').nameProcessing)).toBe(false);
      expect(await database.tableExists(database.getTableName('ZIPCODES').nameFinished)).toBe(false);
      expect(await database.tableExists(database.getTableName('ZIPCODE_CHANGES').nameProcessing)).toBe(false);
      expect(await database.tableExists(database.getTableName('ZIPCODE_CHANGES').nameFinished)).toBe(false);
    });
  });

  describe('createTempTables()', () => {
    test('should create temp tables', async () => {
      await database.createTempTables(['ADDRESSES', 'ZIPCODES']);
      expect(await database.tableExists(database.getTableName('ADDRESSES').name)).toBe(true);
      expect(await database.tableExists(database.getTableName('ZIPCODES').name)).toBe(true);
      expect(await database.tableExists(database.getTableName('ZIPCODE_CHANGES').name)).toBe(false);
      await database.createTempTables(['ADDRESSES', 'ZIPCODES', 'ZIPCODE_CHANGES']);
      expect(await database.tableExists(database.getTableName('ADDRESSES').name)).toBe(true);
      expect(await database.tableExists(database.getTableName('ZIPCODES').name)).toBe(true);
      expect(await database.tableExists(database.getTableName('ZIPCODE_CHANGES').name)).toBe(true);
    });
  });

  describe('renameTable()', () => {
    test('should rename table', async () => {
      const oldName = database.getTableName('ADDRESSES').name;
      const newName = `${oldName}_new`;
      expect(await database.tableExists(newName)).toBe(false);
      expect(await database.renameTable(oldName, newName)).toBe(true);
      expect(await database.tableExists(newName)).toBe(true);
      expect(await database.renameTable(oldName, newName)).toBe(null);
    });
  });

  describe('dropTable()', () => {
    test('should drop test tables', async () => {
      const tableName = `${database.getTableName('ADDRESSES').name}_new`;
      expect(await database.tableExists(tableName)).toBe(true);
      expect(await database.dropTable(tableName)).toBe(true);
      await database.dropTable(database.getTableName('ZIPCODES').nameProcessing);
      await database.dropTable(database.getTableName('ZIPCODES').nameFinished);
      await database.dropTable(database.getTableName('ZIPCODE_CHANGES').nameProcessing);
      await database.dropTable(database.getTableName('ZIPCODE_CHANGES').nameFinished);
      expect(await database.tableExists(tableName)).toBe(false);
      expect(await database.tableExists(database.getTableName('ADDRESSES').nameProcessing)).toBe(false);
      expect(await database.tableExists(database.getTableName('ADDRESSES').nameFinished)).toBe(false);
      expect(await database.tableExists(database.getTableName('ZIPCODES').nameProcessing)).toBe(false);
      expect(await database.tableExists(database.getTableName('ZIPCODES').nameFinished)).toBe(false);
      expect(await database.tableExists(database.getTableName('ZIPCODE_CHANGES').nameProcessing)).toBe(false);
      expect(await database.tableExists(database.getTableName('ZIPCODE_CHANGES').nameFinished)).toBe(false);
    });
  });
});
