import Promise from 'bluebird';
import Sequelize from 'sequelize';

import {
  logBlock,
  logStep,
  logError,
  returnFalse,
} from '../utils';

/**
 * Database
 *
 * @class
 */
class Database {
  /**
   * Constructor.
   */
  constructor() {
    this.database = null;
    this.models = {};

    this.tables = {
      ADDRESSES: {
        nameProcessing: `${global.config.tablePrefix}temp_addresses`,
        nameFinished: `${global.config.tablePrefix}addresses`,
        deleteOnceComplete: true,
        fields: {
          id: {
            type: 'integer',
            unsigned: true,
            index: false,
            dbType: {
              primaryKey: true,
              autoIncrement: true,
              type: Sequelize.INTEGER(10),
            },
          },
          record: {
            comment: 'Record identifier',
            start: 1,
            length: 5,
            type: 'string',
            dbType: Sequelize.STRING(5),
            index: true,
          },
          updatedAt: {
            comment: 'Running date',
            start: 6,
            length: 8,
            type: 'YYYYMMDD',
            dbType: Sequelize.DATEONLY(),
            index: true,
          },
          postalCode: {
            comment: 'Postal code',
            start: 14,
            length: 5,
            type: 'string',
            dbType: Sequelize.STRING(5),
            index: true,
          },
          postOfficeName: {
            comment: 'Postal code name in Finnish ',
            start: 19,
            length: 30,
            type: 'string',
            dbType: Sequelize.STRING(30),
            index: true,
          },
          postOfficeNameSwe: {
            comment: 'Postal code name in Swedish',
            start: 49,
            length: 30,
            type: 'string',
            dbType: Sequelize.STRING(30),
            index: true,
          },
          postOfficeShortName: {
            comment: 'Postal code name abbreviation in Finnish',
            start: 79,
            length: 12,
            type: 'string',
            dbType: Sequelize.STRING(12),
            index: true,
          },
          postOfficeShortNameSwe: {
            comment: 'Postal code name abbreviation in Swedish',
            start: 91,
            length: 12,
            type: 'string',
            dbType: Sequelize.STRING(12),
            index: true,
          },
          address: {
            comment: 'Street (location) name in Finnish',
            start: 103,
            length: 30,
            type: 'string',
            dbType: Sequelize.STRING(30),
            index: true,
          },
          addressSwe: {
            comment: 'Street (location) name in Swedish',
            start: 133,
            length: 30,
            type: 'string',
            dbType: Sequelize.STRING(30),
            index: true,
          },
          empty1: {
            comment: 'Blank',
            start: 163,
            length: 12,
            type: 'string',
            dbType: Sequelize.STRING(12),
            index: false,
          },
          empty2: {
            comment: 'Blank',
            start: 175,
            length: 12,
            type: 'string',
            dbType: Sequelize.STRING(12),
            index: false,
          },
          oddEven: {
            comment: 'Building data type',
            extraComment: '1 = Odd\n2 = Even',
            start: 187,
            length: 1,
            type: 'integer',
            dbType: Sequelize.INTEGER(1),
            index: true,
          },
          smallestBuildingNumber1: {
            comment: 'Building number 1 (Smallest building number)',
            start: 188,
            length: 5,
            type: 'integer',
            dbType: Sequelize.INTEGER(5),
            index: true,
          },
          smallestDeliveryLetter1: {
            comment: 'Building delivery letter 1',
            start: 193,
            length: 1,
            type: 'string',
            dbType: Sequelize.STRING(1),
            index: true,
          },
          divider1: {
            comment: 'Punctuation mark',
            start: 194,
            length: 1,
            type: 'string',
            dbType: Sequelize.STRING(1),
            index: true,
          },
          smallestBuildingNumber2: {
            comment: 'Building number 2',
            start: 195,
            length: 5,
            type: 'integer',
            dbType: Sequelize.INTEGER(5),
            index: true,
          },
          smallestDeliveryLetter2: {
            comment: 'Building delivery letter 2',
            start: 200,
            length: 1,
            type: 'string',
            dbType: Sequelize.STRING(1),
            index: true,
          },
          highestBuildingNumber1: {
            comment: 'Building number 1 (Highest building number)',
            start: 201,
            length: 5,
            type: 'integer',
            dbType: Sequelize.INTEGER(5),
            index: true,
          },
          highestDeliveryLetter1: {
            comment: 'Building delivery letter 1',
            start: 206,
            length: 1,
            type: 'string',
            dbType: Sequelize.STRING(1),
            index: true,
          },
          divider2: {
            comment: 'Punctuation mark',
            start: 207,
            length: 1,
            type: 'string',
            dbType: Sequelize.STRING(1),
            index: true,
          },
          highestBuildingNumber2: {
            comment: 'Building number 2',
            start: 208,
            length: 5,
            type: 'integer',
            dbType: Sequelize.INTEGER(5),
            index: true,
          },
          highestDeliveryLetter2: {
            comment: 'Building delivery letter 2',
            start: 213,
            length: 1,
            type: 'string',
            dbType: Sequelize.STRING(1),
            index: true,
          },
          municipalityIdCode: {
            comment: 'Municipality code',
            start: 214,
            length: 3,
            type: 'string',
            dbType: Sequelize.STRING(3),
            index: true,
          },
          municipalityName: {
            comment: 'Municipality name in Finnish',
            start: 217,
            length: 20,
            type: 'string',
            dbType: Sequelize.STRING(20),
            index: true,
          },
          municipalityNameSwe: {
            comment: 'Municipality name in Swedish',
            start: 237,
            length: 20,
            type: 'string',
            dbType: Sequelize.STRING(20),
            index: true,
          },
        },
      },

      ZIPCODES: {
        nameProcessing: `${global.config.tablePrefix}temp_postalcodes`,
        nameFinished: `${global.config.tablePrefix}postalcodes`,
        deleteOnceComplete: true,
        fields: {
          id: {
            type: 'integer',
            unsigned: true,
            index: false,
            dbType: {
              primaryKey: true,
              autoIncrement: true,
              type: Sequelize.INTEGER(10),
            },
          },
          record: {
            comment: 'Record identifier',
            start: 1,
            length: 5,
            type: 'string',
            dbType: Sequelize.STRING(5),
            index: true,
          },
          updatedAt: {
            comment: 'Running date',
            start: 6,
            length: 8,
            type: 'YYYYMMDD',
            dbType: Sequelize.DATEONLY(),
            index: true,
          },
          postalCode: {
            comment: 'Postal code',
            start: 14,
            length: 5,
            type: 'string',
            dbType: Sequelize.STRING(5),
            index: true,
          },
          postOfficeName: {
            comment: 'Postal code name in Finnish',
            start: 19,
            length: 30,
            type: 'string',
            dbType: Sequelize.STRING(30),
            index: true,
          },
          postOfficeNameSwe: {
            comment: 'Postal code name in Swedish',
            start: 49,
            length: 30,
            type: 'string',
            dbType: Sequelize.STRING(30),
            index: true,
          },
          postOfficeShortName: {
            comment: 'Postal code name abbreviation in Finnish',
            start: 79,
            length: 12,
            type: 'string',
            dbType: Sequelize.STRING(12),
            index: true,
          },
          postOfficeShortNameSwe: {
            comment: 'Postal code name abbreviation in Swedish',
            start: 91,
            length: 12,
            type: 'string',
            dbType: Sequelize.STRING(12),
            index: true,
          },
          effectiveAt: {
            comment: 'Date of entry into force',
            start: 103,
            length: 8,
            type: 'YYYYMMDD',
            dbType: Sequelize.DATEONLY(),
            index: true,
          },
          typeCode: {
            comment: 'Type code',
            extraComment: '1 = Normal postcode\n2 = PO Box postcode\n3 = Corporate postal code\n4 = Compilation postcode\n5 = Reply Mail postcode\n6 = SmartPOST (Parcel machine)\n7 = Pick-up Point postcode\n8 = Technical postcode', // eslint-disable-line
            start: 111,
            length: 1,
            type: 'integer',
            dbType: Sequelize.INTEGER(1),
            index: true,
          },
          regionId: {
            comment: 'Administrative region code',
            start: 112,
            length: 5,
            type: 'string',
            dbType: Sequelize.STRING(5),
            index: true,
          },
          regionName: {
            comment: 'Administrative region name in Finnish',
            start: 117,
            length: 30,
            type: 'string',
            dbType: Sequelize.STRING(30),
            index: true,
          },
          regionNameSwe: {
            comment: 'Administrative region name in Swedish',
            start: 147,
            length: 30,
            type: 'string',
            dbType: Sequelize.STRING(30),
            index: true,
          },
          municipalityIdCode: {
            comment: 'Municipality code',
            start: 177,
            length: 3,
            type: 'string',
            dbType: Sequelize.STRING(3),
            index: true,
          },
          municipalityName: {
            comment: 'Municipality name in Finnish',
            start: 180,
            length: 20,
            type: 'string',
            dbType: Sequelize.STRING(20),
            index: true,
          },
          municipalityNameSwe: {
            comment: 'Municipality name in Swedish',
            start: 200,
            length: 20,
            type: 'string',
            dbType: Sequelize.STRING(20),
            index: true,
          },
          municipalityLanguage: {
            comment: 'Municipality language distribution code',
            extraComment: '1 = Finnish\n2 = Bilingual\n3 = Bilingual\n4 = Swedish',
            start: 220,
            length: 1,
            type: 'integer',
            dbType: Sequelize.INTEGER(1),
            index: true,
          },
        },
      },

      ZIPCODE_CHANGES: {
        nameProcessing: `${global.config.tablePrefix}postalcode_changes`,
        deleteOnceComplete: false,
        fields: {
          id: {
            type: 'integer',
            unsigned: true,
            index: false,
            dbType: {
              primaryKey: true,
              autoIncrement: true,
              type: Sequelize.INTEGER(10),
            },
          },
          record: {
            comment: 'Record identifier',
            start: 1,
            length: 4,
            type: 'string',
            dbType: Sequelize.STRING(4),
            index: true,
          },
          level: {
            comment: 'Level',
            start: 5,
            length: 1,
            type: 'string',
            dbType: Sequelize.STRING(1),
            index: true,
          },
          updatedAt: {
            comment: 'Running date',
            start: 6,
            length: 8,
            type: 'YYYYMMDD',
            dbType: Sequelize.DATEONLY(),
            index: true,
          },
          extractionStartAt: {
            comment: 'Extraction start date',
            start: 14,
            length: 8,
            type: 'YYYYMMDD',
            dbType: Sequelize.DATEONLY(),
            index: true,
          },
          extractionEndAt: {
            comment: 'Extraction end date',
            start: 22,
            length: 8,
            type: 'YYYYMMDD',
            dbType: Sequelize.DATEONLY(),
            index: true,
          },
          oldPostalCode: {
            comment: 'Old postal code',
            start: 30,
            length: 5,
            type: 'string',
            dbType: Sequelize.STRING(5),
            index: true,
          },
          oldPostOfficeName: {
            comment: 'Old postal code name in Finnish',
            start: 35,
            length: 30,
            type: 'string',
            dbType: Sequelize.STRING(30),
            index: true,
          },
          oldPostOfficeNameSwe: {
            comment: 'Old postal code name in Swedish',
            start: 65,
            length: 30,
            type: 'string',
            dbType: Sequelize.STRING(30),
            index: true,
          },
          oldPostOfficeShortName: {
            comment: 'Old postal code name abbreviation in Finnish',
            start: 95,
            length: 12,
            type: 'string',
            dbType: Sequelize.STRING(12),
            index: true,
          },
          oldPostOfficeShortNameSwe: {
            comment: 'Old postal code name abbreviation in Swedish',
            start: 107,
            length: 12,
            type: 'string',
            dbType: Sequelize.STRING(12),
            index: true,
          },
          reserved: {
            comment: 'Reserve',
            start: 119,
            length: 131,
            type: 'string',
            dbType: Sequelize.STRING(132),
            index: false,
          },
          postalCode: {
            comment: 'New postal code',
            start: 250,
            length: 5,
            type: 'string',
            dbType: Sequelize.STRING(5),
            index: true,
          },
          postOfficeName: {
            comment: 'New postal code name in Finnish',
            start: 255,
            length: 30,
            type: 'string',
            dbType: Sequelize.STRING(30),
            index: true,
          },
          postOfficeNameSwe: {
            comment: 'New postal code name in Swedish',
            start: 285,
            length: 30,
            type: 'string',
            dbType: Sequelize.STRING(30),
            index: true,
          },
          postOfficeShortName: {
            comment: 'New postal code name abbreviation in Finnish',
            start: 315,
            length: 12,
            type: 'string',
            dbType: Sequelize.STRING(12),
            index: true,
          },
          postOfficeShortNameSwe: {
            comment: 'New postal code name abbreviation in Swedish',
            start: 327,
            length: 12,
            type: 'string',
            dbType: Sequelize.STRING(12),
            index: true,
          },
          municipalityIdCode: {
            comment: 'Municipality code',
            start: 339,
            length: 3,
            type: 'string',
            dbType: Sequelize.STRING(3),
            index: true,
          },
          municipalityName: {
            comment: 'Municipality name in Finnish',
            start: 342,
            length: 20,
            type: 'string',
            dbType: Sequelize.STRING(20),
            index: true,
          },
          municipalityNameSwe: {
            comment: 'Municipality name in Swedish',
            start: 362,
            length: 20,
            type: 'string',
            dbType: Sequelize.STRING(20),
            index: true,
          },
          regionId: {
            comment: 'Administrative region code',
            start: 382,
            length: 2,
            type: 'string',
            dbType: Sequelize.STRING(2),
            index: true,
          },
          regionName: {
            comment: 'Administrative region name in Finnish',
            start: 384,
            length: 30,
            type: 'string',
            dbType: Sequelize.STRING(30),
            index: true,
          },
          regionNameSwe: {
            comment: 'Administrative region name in Swedish',
            start: 414,
            length: 30,
            type: 'string',
            dbType: Sequelize.STRING(30),
            index: true,
          },
          changedAt: {
            comment: 'Change date',
            start: 444,
            length: 8,
            type: 'YYYYMMDD',
            dbType: Sequelize.DATEONLY(),
            index: true,
          },
          eventCode: {
            comment: 'Event code',
            extraComment: '1 = Change of name\n2 = Postal code closed\n3 = New postal code\n4 = Postal code merged\n5 = Postal code reactivation\n6 = Postal code replaced by new postal code', // eslint-disable-line
            start: 452,
            length: 2,
            type: 'integer',
            dbType: Sequelize.INTEGER(2),
            index: true,
          },
        },
      },
    };

    this.fileToModel = {
      BAF: 'ADDRESSES',
      PCF: 'ZIPCODES',
      POM: 'ZIPCODE_CHANGES',
    };

    this.commonTableOptions = {
      freezeTableName: true,
      charset: 'utf8',
      dialectOptions: {
        collate: 'utf8_general_ci',
      },
    };
  }

  /**
   * Get table name.
   *
   * @param {String} tableKey - Table key.
   *
   * @returns {Object} Table name.
   */
  getTableName = tableKey => (
    this.tables[tableKey]
  )

  /**
   * Get table definitions.
   *
   * @param {String} tableKey - Table key.
   *
   * @returns {Object} Table definitions.
   */
  getTableDefinitions = tableKey => (
    Object.keys(this.tables[tableKey].fields)
      .map(field => ([`${field}`, this.tables[tableKey].fields[field].dbType]))
      .reduce((columns, item) => {
        const [key, field] = item;
        columns[key] = field;
        return columns;
      }, {})
  )

  /**
   * Get database model for file.
   *
   * @param {String} filename - Filename to get model for.
   *
   * @returns {Object} Database model.
   */
  getFileModelName = filename => (
    this.fileToModel[filename]
  )

  /**
   * Get table indexes.
   *
   * @param {String} tableKey - Table key.
   *
   * @returns {Array<Object>} Indexes.
   */
  getTableIndexes = tableKey => (
    Object.keys(this.tables[tableKey].fields)
      .filter(field => this.tables[tableKey].fields[field].index)
      .map(field => ({
        name: field,
        fields: [field],
      }))
  )

  /**
   * Get table options.
   *
   * @param {String} tableKey - Table key.
   *
   * @returns {Object} Table options for Sequelize.
   */
  getTableDatabaseOptions = tableKey => ({
    ...this.commonTableOptions,
    indexes: this.getTableIndexes(tableKey),
  })

  /**
   * Get table configs.
   *
   * @param {String} tableKey - Table key.
   *
   * @returns {Object} Table configs.
   */
  getTableConfigs = tableKey => (
    this.tables[tableKey]
  )

  /**
   * Define table model for Sequelize.
   *
   * @param {String} tableKey - Table key.
   *
   * @returns {void}
   */
  defineTable = async (tableKey) => {
    this.models[tableKey] = this.database.define(
      this.getTableName(tableKey).nameProcessing,
      this.getTableDefinitions(tableKey),
      this.getTableDatabaseOptions(tableKey)
    );
  }

  /**
   * Return the database model.
   *
   * @param {String} tableKey - Table key.
   *
   * @returns {Sequelize<Model>} Table model for queries
   */
  getTableModel = tableKey => (
    this.models[tableKey]
  );

  /**
   * Is database connected or not.
   *
   * @returns {Boolean} Connected or not
   */
  isConnected = async () => {
    if (!this.database) {
      return false;
    }
    return this.database
      .authenticate()
      .then(() => true)
      .catch(returnFalse);
  }

  /**
   * Connect database
   *
   * @returns {Sequelize} Connected Sequelize.
   */
  connect = async () => {
    if (!await this.isConnected()) {
      logBlock('Database connecting...');
      this.database = new Sequelize(
        global.config.database,
        global.config.user,
        global.config.password,
        {
          logging: false,
          operatorsAliases: false,
          host: global.config.host,
          dialect: global.config.dialect,
          ...global.config.dialectOptions,
        }
      );

      return this.database
        .authenticate()
        .then(() => {
          logStep('Connected');
        });
    } else {
      return true;
    }
  }

  /**
   * Create temp tables.
   *
   * @param {Array<String>} tableKeys - Which tables should be created.
   *
   * @returns {void}
   */
  createTempTables = async tableKeys => (
    Promise
      .map(
        tableKeys,
        async (tableKey) => {
          const tableConfigs = this.getTableConfigs(tableKey);
          await this.defineTable(tableKey);

          if (tableConfigs.nameFinished) {
            if (!await this.tableExists(tableConfigs.nameProcessing)) {
              logStep(`Creating temp table: ${tableConfigs.nameProcessing}`);
              await this.getTableModel(tableKey).sync();
            } else {
              logStep(`Temp table '${tableConfigs.nameProcessing}' already exists`);
            }
          } else if (!await this.tableExists(tableConfigs.nameProcessing)) {
            logStep(`Creating table for: ${tableConfigs.nameProcessing}`);
            await this.getTableModel(tableKey).sync();
          } else {
            logStep(`Table '${tableConfigs.nameProcessing}' already exists`);
          }
        },
        { concurrency: 10 }
      )
      .catch(logError)
  )

  /**
   * Does table exist.
   *
   * @param {String} table - Table name.
   *
   * @returns {Boolean} Exists or not.
   */
  tableExists = async table => (
    this.database.getQueryInterface().describeTable(table)
      .then(() => true)
      .catch(returnFalse)
  )

  /**
   * Rename table.
   *
   * @param {String} oldTableName - Old table name.
   * @param {String} newTableName - New table name.
   *
   * @returns {Boolean} Renamed or not.
   */
  renameTable = async (oldTableName, newTableName) => {
    if (await this.tableExists(oldTableName)) {
      logStep(`Renaming table '${oldTableName}' -> '${newTableName}'`);

      return this.database.getQueryInterface().renameTable(oldTableName, newTableName)
        .then(() => true)
        .catch(returnFalse);
    }

    return null;
  }

  /**
   * Drops table.
   *
   * @param {String} tableName - Table name.
   *
   * @returns {Boolean} Dropped or not.
   */
  dropTable = async (tableName) => {
    if (await this.tableExists(tableName)) {
      logStep(`Drop table '${tableName}'`);

      return this.database.getQueryInterface().dropTable(tableName)
        .then(() => true)
        .catch(returnFalse);
    }

    return null;
  }

  /**
   * Cast values for database.
   *
   * @param {Object} column - Column name.
   * @param {String} value - Value.
   *
   * @returns {any} Processed value.
   */
  castProperties = (column, value) => {
    if (value === '') {
      return null;
    }

    switch (column.type) {
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
  }
}

export default Database;
