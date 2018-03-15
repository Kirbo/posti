import os from 'os';
import path from 'path';

const baseDir = path.resolve(`${os.homedir()}/.posti`);
const tempDir = path.resolve(`${baseDir}/data`);
const latestFile = path.resolve(`${baseDir}/latest.json`);

// Download progressbar config.
const downloadConfig = {
  format: '{bar} {percentage}% | ETA: {eta}s | {value}/{total} b',
  stopOnComplete: true,
  clearOnComplete: true,
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  fps: 4,
};

// Insert progressbar config.
const insertConfig = {
  ...downloadConfig,
  format: '{bar} {percentage}% | ETA: {eta}s | {value}/{total} rows',
};

export default {
  webpcode: {
    index: 'https://www.posti.fi/webpcode/',
    files: 'http://www.posti.fi/webpcode',
  },
  cache: {
    baseDir,
    tempDir,
    latestFile,
  },
  progressbar: {
    downloadConfig,
    insertConfig,
  },
};
