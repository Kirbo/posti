import Database from './Database';

const database = new Database();

describe('Database', () => {
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

  test.skip('should return model', async () => {
    const model = await database.getModel('ADDRESS');
    console.log('model', model);
    expect(model).toBe(null);
  });

  test.skip('should create temp tables', async () => {
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
  });
});
