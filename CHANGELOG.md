# Posti
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]


## [0.2.0] - 2018-03-18

### Breaking changes
- Breaking changes to config file, check the [latest config here](./posti.config.example.js).
- In `postalcodes` table, renamed column `effectiveAt` to `entryIntoForceAt`.

### Changed
- Improvements in tests.


## [0.1.6] - 2018-03-18

### Added
- Couple of badges more into [README.md](./README.md).
- Lots of improvements in tests (now everything is 100% 🎉🎊🥂).

### Changed
- `no-console` eslint rule to give `error` instead of `warning`.


## [0.1.5] - 2018-03-17

### Changed
- `tablePrefix` in tests from `test_` into `${tablePrefix}test_`.


## [0.1.4] - 2018-03-17

### Changed
- CI/CD pipeline to publish with `npm` instead of `yarn`.


## [0.1.3] - 2018-03-17

### Changed
- Manually tested publishing, since `yarn` gave error "Cannot publish over previously published version".


## [0.1.2] - 2018-03-17

### Changed
- CI/CD pipeline to output the version to be published.


## [0.1.1] - 2018-03-17

### Fixed
- Bug showing incorrect number of lines inserted.


## [0.1.0] - 2018-03-17

### Breaking changes
- Breaking changes to config file, check the [latest config here](./posti.config.example.js).
- Table `zipcode_changes` renamed to `postalcode_changes`.
- Table `zipcodes` renamed to `postalcodes`.

### Added
- Disclaimer in `README.md`.
- Links to Finnish, English and Swedish Postal Code Services site, Terms of use and Frequently asked questions.
- Babel polyfill in `src/posti.js`.

### Changed
- Major refactoring.
- Updated dependencies.
- Run tests in parallel instead in serially.
- Coverage percentage in badge to contain `% Branch` instead of `% Funcs`.
- `Stage-0` into `Stage-2`.

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
