import Sequelize from 'sequelize';


import {
  logBlock,
  logStep,
  findDatabaseConfig,
} from '../utils';

const configPath = findDatabaseConfig();
const config = require(configPath).default;

/**
 * Database
 * @class
 */
class Database {
  /**
   * Constructor.
  */
  constructor() {
    logBlock('Database');
    logStep(`Using config from: ${configPath}`);

    this.db = null;

    this.config = config;

    if (process.env.NODE_ENV === 'test') {
      this.config.TABLE_PREFIX = 'test_';
    }

    this.casts = {
      updatedAt: 'YYYYMMDD',
      effectiveAt: 'YYYYMMDD',
      pickingStartAt: 'YYYYMMDD',
      pickingEndAt: 'YYYYMMDD',
      changedAt: 'YYYYMMDD',
      oddEven: 'number',
      lowestPropertyNumber1: 'number',
      lowestPropertyNumber2: 'number',
      highestPropertyNumber1: 'number',
      highestPropertyNumber2: 'number',
      typeCode: 'number',
      municipalityLanguage: 'number',
      transactionId: 'number',
    };

    this.tables = {
      ADDRESSES: {
        delete_processing: true,
        processing: `${this.config.TABLE_PREFIX}tmp_addresses`,
        finished: `${this.config.TABLE_PREFIX}addresses`,
      },
      ZIPCODES: {
        delete_processing: true,
        processing: `${this.config.TABLE_PREFIX}tmp_zipcodes`,
        finished: `${this.config.TABLE_PREFIX}zipcodes`,
      },
      ZIPCODE_CHANGES: {
        processing: `${this.config.TABLE_PREFIX}zipcode_changes`,
      },
    };

    this.commonTableConfig = {
      freezeTableName: true,
      charset: 'utf8',
      dialectOptions: {
        collate: 'utf8_general_ci',
      },
    };

    this.models = {};
  }

  /**
   * Returns the sequelize connection
   *
   * @returns {Sequelize} - Sequelize
   */
  getDb = () => (
    this.db
  );

  /**
   * Return the database model.
   *
   * @param {String} model - Model name
   *
   * @returns {Sequelize<Model>} - Table model for queries
   */
  getModel = model => (
    this.models[model]
  );

  /**
   * Return table configs.
   *
   * @param {String} table - Table name.
   *
   * @returns {Object} - Table configs.
   */
  getTableConfigs = table => (
    this.tables[table]
  )

  /**
   * Is database connected or not
   *
   * @returns {Boolean} - Is connected or not
   */
  isConnected = async () => {
    if (!this.db) {
      return false;
    }
    return this.db
      .authenticate()
      .then(() => true)
      .catch(() => false);
  }

  /**
   * Connect database
   *
   * @returns {Promise} - Promise
   */
  connect = async () => {
    logStep('Connecting...');
    this.db = new Sequelize(
      this.config.DATABASE,
      this.config.USER,
      this.config.PASSWORD,
      {
        logging: false,
        operatorsAliases: false,
        host: this.config.HOST,
        dialect: this.config.DIALECT,
        ...this.config.OPTIONS,
      }
    );

    this.models = {
      ADDRESSES: this.addresses(),
      ZIPCODES: this.zipcodes(),
      ZIPCODE_CHANGES: this.zipcodeChanges(),
    };

    return this.db
      .authenticate()
      .then(() => {
        logStep('Connected');
      });
  }

  /**
   * Create temp tables
   *
   * @returns {void}
   */
  createTempTables = async () => {
    logStep('Creating temp tables');
    await this.db.sync({ alter: true });
    logStep('Temp tables created');
  }

  /**
   * Cast column value.
   *
   * @param {String} key - Column name.
   * @param {any} value - Value of the column.
   *
   * @returns {any} - Casted value.
   */
  castProperties = (key, value) => {
    if (value === '') {
      return null;
    } else if (this.casts[key]) {
      switch (this.casts[key]) {
        case 'number': {
          return Number(value);
        }
        case 'YYYYMMDD': {
          const matches = value.match(/(\d{4})(\d{2})(\d{2})/);
          return `${matches[1]}-${matches[2]}-${matches[3]}`;
        }
        default: {
          return value;
        }
      }
    } else {
      return value;
    }
  }

  /**
   * Define ADDRESSES database model
   *
   * @returns {void}
   */
  addresses = () => (
    this.db.define(
      `${this.config.TABLE_PREFIX}${this.tables.ADDRESSES.processing}`,
      {
        id: {
          type: Sequelize.INTEGER(10),
          primaryKey: true,
          autoIncrement: true,
        },
        record: Sequelize.STRING(5),
        updatedAt: Sequelize.DATEONLY,
        zipcode: Sequelize.STRING(5),
        postOfficeName: Sequelize.STRING(30),
        postOfficeNameSwe: Sequelize.STRING(30),
        postOfficeShortName: Sequelize.STRING(12),
        postOfficeShortNameSwe: Sequelize.STRING(12),
        address: Sequelize.STRING(30),
        addressSwe: Sequelize.STRING(30),
        empty1: Sequelize.STRING(12),
        empty2: Sequelize.STRING(12),
        oddEven: Sequelize.INTEGER(1).UNSIGNED,
        lowestPropertyNumber1: Sequelize.INTEGER(5).UNSIGNED,
        lowestDistributionLetter1: Sequelize.STRING(1),
        divider1: Sequelize.STRING(1),
        lowestPropertyNumber2: Sequelize.INTEGER(5).UNSIGNED,
        lowestDistributionLetter2: Sequelize.STRING(1),
        highestPropertyNumber1: Sequelize.INTEGER(5).UNSIGNED,
        highestDistributionLetter1: Sequelize.STRING(1),
        divider2: Sequelize.STRING(1),
        highestPropertyNumber2: Sequelize.INTEGER(5).UNSIGNED,
        highestDistributionLetter2: Sequelize.STRING(1),
        municipalityIdCode: Sequelize.STRING(3),
        municipalityName: Sequelize.STRING(20),
        municipalityNameSwe: Sequelize.STRING(20),
      },
      {
        ...this.commonTableConfig,
        indexes: [
          { name: 'record', fields: ['record'] },
          { name: 'updatedAt', fields: ['updatedAt'] },
          { name: 'zipcode', fields: ['zipcode'] },
          { name: 'postOfficeName', fields: ['postOfficeName'] },
          { name: 'postOfficeNameSwe', fields: ['postOfficeNameSwe'] },
          { name: 'postOfficeShortName', fields: ['postOfficeShortName'] },
          { name: 'postOfficeShortNameSwe', fields: ['postOfficeShortNameSwe'] },
          { name: 'address', fields: ['address'] },
          { name: 'addressSwe', fields: ['addressSwe'] },
          { name: 'empty1', fields: ['empty1'] },
          { name: 'empty2', fields: ['empty2'] },
          { name: 'oddEven', fields: ['oddEven'] },
          { name: 'lowestPropertyNumber1', fields: ['lowestPropertyNumber1'] },
          { name: 'lowestDistributionLetter1', fields: ['lowestDistributionLetter1'] },
          { name: 'divider1', fields: ['divider1'] },
          { name: 'lowestPropertyNumber2', fields: ['lowestPropertyNumber2'] },
          { name: 'lowestDistributionLetter2', fields: ['lowestDistributionLetter2'] },
          { name: 'highestPropertyNumber1', fields: ['highestPropertyNumber1'] },
          { name: 'highestDistributionLetter1', fields: ['highestDistributionLetter1'] },
          { name: 'divider2', fields: ['divider2'] },
          { name: 'highestPropertyNumber2', fields: ['highestPropertyNumber2'] },
          { name: 'highestDistributionLetter2', fields: ['highestDistributionLetter2'] },
          { name: 'municipalityIdCode', fields: ['municipalityIdCode'] },
          { name: 'municipalityName', fields: ['municipalityName'] },
          { name: 'municipalityNameSwe', fields: ['municipalityNameSwe'] },
          { name: 'createdAt', fields: ['createdAt'] },
        ],
      }
    )
  );

  /**
   * Define ZIPCODES database model
   *
   * @returns {void}
   */
  zipcodes = () => (
    this.db.define(
      `${this.config.TABLE_PREFIX}${this.tables.ZIPCODES.processing}`,
      {
        id: {
          type: Sequelize.INTEGER(10),
          primaryKey: true,
          autoIncrement: true,
        },
        record: Sequelize.STRING(5),
        updatedAt: Sequelize.DATEONLY,
        zipcode: Sequelize.STRING(5),
        postOfficeName: Sequelize.STRING(30),
        postOfficeNameSwe: Sequelize.STRING(30),
        postOfficeShortName: Sequelize.STRING(12),
        postOfficeShortNameSwe: Sequelize.STRING(12),
        effectiveAt: Sequelize.DATEONLY,
        typeCode: Sequelize.INTEGER(1).UNSIGNED,
        regionId: Sequelize.STRING(12),
        regionName: Sequelize.STRING(30),
        regionNameSwe: Sequelize.STRING(30),
        municipalityIdCode: Sequelize.STRING(3),
        municipalityName: Sequelize.STRING(20),
        municipalityNameSwe: Sequelize.STRING(20),
        municipalityLanguage: Sequelize.INTEGER(1).UNSIGNED,
      },
      {
        ...this.commonTableConfig,
        indexes: [
          { name: 'record', fields: ['record'] },
          { name: 'updatedAt', fields: ['updatedAt'] },
          { name: 'zipcode', fields: ['zipcode'] },
          { name: 'postOfficeName', fields: ['postOfficeName'] },
          { name: 'postOfficeNameSwe', fields: ['postOfficeNameSwe'] },
          { name: 'postOfficeShortName', fields: ['postOfficeShortName'] },
          { name: 'postOfficeShortNameSwe', fields: ['postOfficeShortNameSwe'] },
          { name: 'effectiveAt', fields: ['effectiveAt'] },
          { name: 'typeCode', fields: ['typeCode'] },
          { name: 'regionId', fields: ['regionId'] },
          { name: 'regionName', fields: ['regionName'] },
          { name: 'regionNameSwe', fields: ['regionNameSwe'] },
          { name: 'municipalityIdCode', fields: ['municipalityIdCode'] },
          { name: 'municipalityName', fields: ['municipalityName'] },
          { name: 'municipalityNameSwe', fields: ['municipalityNameSwe'] },
          { name: 'municipalityLanguage', fields: ['municipalityLanguage'] },
          { name: 'createdAt', fields: ['createdAt'] },
        ],
      }
    )
  );

  /**
   * Define ZIPCODE_CHANGES database model
   *
   * @returns {void}
   */
  zipcodeChanges = () => (
    this.db.define(
      `${this.config.TABLE_PREFIX}${this.tables.ZIPCODE_CHANGES.processing}`,
      {
        id: {
          type: Sequelize.INTEGER(10),
          primaryKey: true,
          autoIncrement: true,
        },
        record: Sequelize.STRING(4),
        level: Sequelize.STRING(1),
        updatedAt: Sequelize.DATEONLY,
        pickingStartAt: Sequelize.DATEONLY,
        pickingEndAt: Sequelize.DATEONLY,
        oldZipcode: Sequelize.STRING(5),
        oldPostOfficeName: Sequelize.STRING(30),
        oldPostOfficeNameSwe: Sequelize.STRING(30),
        oldPostOfficeShortName: Sequelize.STRING(12),
        oldPostOfficeShortNameSwe: Sequelize.STRING(12),
        reserved: Sequelize.STRING(131),
        zipcode: Sequelize.STRING(5),
        postOfficeName: Sequelize.STRING(30),
        postOfficeNameSwe: Sequelize.STRING(30),
        postOfficeShortName: Sequelize.STRING(12),
        postOfficeShortNameSwe: Sequelize.STRING(12),
        municipalityIdCode: Sequelize.STRING(3),
        municipalityName: Sequelize.STRING(20),
        municipalityNameSwe: Sequelize.STRING(20),
        regionId: Sequelize.STRING(12),
        regionName: Sequelize.STRING(30),
        regionNameSwe: Sequelize.STRING(30),
        changedAt: Sequelize.DATEONLY,
        transactionId: Sequelize.INTEGER(1).UNSIGNED,
      },
      {
        ...this.commonTableConfig,
        indexes: [
          { name: 'record', fields: ['record'] },
          { name: 'level', fields: ['level'] },
          { name: 'updatedAt', fields: ['updatedAt'] },
          { name: 'pickingStartAt', fields: ['pickingStartAt'] },
          { name: 'pickingEndAt', fields: ['pickingEndAt'] },
          { name: 'oldZipcode', fields: ['oldZipcode'] },
          { name: 'oldPostOfficeName', fields: ['oldPostOfficeName'] },
          { name: 'oldPostOfficeNameSwe', fields: ['oldPostOfficeNameSwe'] },
          { name: 'oldPostOfficeShortName', fields: ['oldPostOfficeShortName'] },
          { name: 'oldPostOfficeShortNameSwe', fields: ['oldPostOfficeShortNameSwe'] },
          { name: 'reserved', fields: ['reserved'] },
          { name: 'zipcode', fields: ['zipcode'] },
          { name: 'postOfficeName', fields: ['postOfficeName'] },
          { name: 'postOfficeNameSwe', fields: ['postOfficeNameSwe'] },
          { name: 'postOfficeShortName', fields: ['postOfficeShortName'] },
          { name: 'postOfficeShortNameSwe', fields: ['postOfficeShortNameSwe'] },
          { name: 'municipalityIdCode', fields: ['municipalityIdCode'] },
          { name: 'municipalityName', fields: ['municipalityName'] },
          { name: 'municipalityNameSwe', fields: ['municipalityNameSwe'] },
          { name: 'regionId', fields: ['regionId'] },
          { name: 'regionName', fields: ['regionName'] },
          { name: 'regionNameSwe', fields: ['regionNameSwe'] },
          { name: 'changedAt', fields: ['changedAt'] },
          { name: 'transactionId', fields: ['transactionId'] },
          { name: 'createdAt', fields: ['createdAt'] },
        ],
      }
    )
  )
}

export default Database;
