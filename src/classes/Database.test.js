import Promise from 'bluebird';

import Database from './Database';

const database = new Database();

describe('Database', () => {
  beforeAll(() => {
    jest.setTimeout(10 * 60 * 1000); // Set timeout to 10 minutes
  });

  afterAll(async () => {
    const tables = [
      'ADDRESSES',
      'ZIPCODES',
      'ZIPCODE_CHANGES',
    ];

    return Promise
      .each(tables, async (table) => {
        const tableConfigs = database.getTableConfigs(table);
        return new Promise(async (resolve) => {
          await database.getDb().getQueryInterface().dropTable(tableConfigs.processing)
            .then(() => true)
            .catch(() => false);
          if (tableConfigs.finished) {
            await database.getDb().getQueryInterface().dropTable(tableConfigs.finished)
              .then(() => true)
              .catch(() => false);
          }
          resolve();
        });
      });
  });

  test('should not be connected', async () => {
    expect(await database.isConnected()).toBe(false);
  });

  test('should connect', async () => {
    await database.connect();
    expect(await database.isConnected()).toBe(true);
  });

  test('should return db', async () => {
    const db = await database.getDb();
    expect(typeof db).toBe('object');
  });

  test('should return model', async () => {
    const model = await database.getModel('ADDRESSES');
    expect(typeof model).toBe('function');
  });

  test('should create temp tables', async () => {
    await database.createTempTables();
  });

  test('should cast correctly', async () => {
    expect(database.castProperties('updatedAt', '20180101')).toBe('2018-01-01');
    expect(database.castProperties('effectiveAt', '20180101')).toBe('2018-01-01');
    expect(database.castProperties('pickingStartAt', '20180101')).toBe('2018-01-01');
    expect(database.castProperties('pickingEndAt', '20180101')).toBe('2018-01-01');
    expect(database.castProperties('changedAt', '20180101')).toBe('2018-01-01');
    expect(database.castProperties('oddEven', '5')).toBe(5);
    expect(database.castProperties('lowestPropertyNumber1', '5')).toBe(5);
    expect(database.castProperties('lowestPropertyNumber2', '5')).toBe(5);
    expect(database.castProperties('highestPropertyNumber1', '5')).toBe(5);
    expect(database.castProperties('highestPropertyNumber2', '5')).toBe(5);
    expect(database.castProperties('typeCode', '5')).toBe(5);
    expect(database.castProperties('municipalityLanguage', '5')).toBe(5);
    expect(database.castProperties('transactionId', '5')).toBe(5);
    expect(database.castProperties('test', '')).toBe(null);
    expect(database.castProperties('other', 'hurrdurr')).toBe('hurrdurr');
    expect(database.castProperties('default', 'default')).toBe('default');
  });

  test('should get table configs', async () => {
    const addressConfigs = database.getTableConfigs('ADDRESSES');
    const zipcodesConfigs = database.getTableConfigs('ZIPCODES');
    const zipcodeChangesConfigs = database.getTableConfigs('ZIPCODE_CHANGES');

    expect(addressConfigs.delete_processing).toBe(true);
    expect(addressConfigs.processing).toBe('test_tmp_addresses');
    expect(addressConfigs.finished).toBe('test_addresses');

    expect(zipcodesConfigs.delete_processing).toBe(true);
    expect(zipcodesConfigs.processing).toBe('test_tmp_zipcodes');
    expect(zipcodesConfigs.finished).toBe('test_zipcodes');

    expect(zipcodeChangesConfigs.processing).toBe('test_zipcode_changes');
  });
});
