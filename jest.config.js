module.exports = {
  bail: true,
  collectCoverage: true,
  collectCoverageFrom: [
    '**/src/**.js',
  ],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/src/config/',
    '/src/graphql/',
    '/src/build.js',
    '/src/server.js',
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
  testPathIgnorePatterns: [
    '/node_modules/',
    '/src/config/',
    '/src/graphql/',
    '/src/build.js',
    '/src/server.js',
    '/src/index.js',
  ],
};
