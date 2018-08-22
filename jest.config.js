module.exports = {
  bail: true,
  collectCoverage: true,
  collectCoverageFrom: [
    '**/src/**.js',
  ],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/src/config/',
    '/src/posti.js',
    '/src/index.js',
  ],
  coverageReporters: [
    'text',
    'html',
  ],
  notify: true,
  testMatch: [
    '**/src/**.test.js',
  ],
  testURL: 'http://localhost/',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/src/config/',
    '/src/index.js',
  ],
};
