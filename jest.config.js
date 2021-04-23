module.exports = {
  bail: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/?(**/)*.[jt]s'],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/src/config/',
    '/src/posti.js',
    '/src/index.js',
  ],
  coverageReporters: ['text', 'html'],
  notify: true,
  testMatch: ['**/?(*.)test.[jt]s'],
  testURL: 'http://localhost/',
  testPathIgnorePatterns: ['/node_modules/', '/src/config/', '/src/index.js'],
};
