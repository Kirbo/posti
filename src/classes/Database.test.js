import Database from './Database';

const database = new Database();

describe('Database', () => {
  test('should not be connected', async () => {
    expect(await database.isConnected()).toBe(false);
  });
});
