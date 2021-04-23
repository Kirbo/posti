import { findDatabaseConfig } from './utils';
import postiConfig from './config';

const configPath = findDatabaseConfig();
const config = require(configPath).default;

export { postiConfig, configPath, config };
