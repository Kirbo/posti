# Posti
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]


## [0.1.0] - 2018-03-17

### Added
- Disclaimer in `README.md`.
- Links to Finnish, English and Swedish Postal Code Services site, Terms of use and Frequently asked questions.

### Changed
- Breaking changes to config file, check the [latest config here](./posti.config.example.js).
- Major refactoring.
- Updated dependencies.
- Run tests in parallel instead in serially.
- Coverage percentage in badge to contain `% Branch` instead of `% Funcs`.
- Table `zipcode_changes` renamed to `postalcode_changes`.
- Table `zipcodes` renamed to `postalcodes`.

### Fixed
- Bug showing incorrect number of lines being inserted.

## [0.0.6] - 2018-03-14

### Added
- Lots of more tests.
- New `test-debug` script.

### Changed
- Coverage percentage in badge back to contain `% Funcs` instead of `% Branch`.
- Run the tests serially instead in parallel.
- Fixed bug with table prefixes.
- Remove the test tables after tests.


## [0.0.5] - 2018-03-14

### Added
- Lots of more tests.
- A little more comments in the code.

### Changed
- Coverage percentage in badge to contain `% Branch` instead of `% Funcs`.
- Tests to use the actual config, with the difference that it overwrites `TABLE_PREFIX` to be `test_` when running tests.
- Renamed `this.table_names` to be `this.tables` in [src/classes/Database.js:49](./src/classes/Database.js).
- New method `this.setFile(file)` in [src/classes/Posti.js:203](./src/classes/Posti.js), to ease the tests.
- `delete_on_complete` in [src/config/index.js:7](./src/config/index.js) is set to `false` for tests.
- `findDatabaseConfig()` in [src/utils/index.js:76](./src/utils/index.js) shouldn't break anymore when using different `NODE_ENV`.
- Table names and temp table names to use `TABLE_PREFIX` in [src/classes/Database.js:52](./src/classes/Database.js).

### Removed
- `posti.config.test.js` file, as it is no longer needed.


## [0.0.4] - 2018-03-13

### Changed
- Finetuning CI/CD pipeline.


## [0.0.3] - 2018-03-13

### Changed
- Finetuning CI/CD pipeline.


## [0.0.2] - 2018-03-13

### Changed
- Finetuning CI/CD pipeline.


## [0.0.1] - 2018-03-12

### Changed
- Initial release.
