# POSTI

![pipeline status](https://posti.devaus.eu/pipeline.svg)
![coverage report](https://posti.devaus.eu/coverage.svg)

## Description

`posti` is a tool to automagically download latest basic address data from [Finnish post - Posti](https://www.posti.fi/), to parse the files and insert the contents into database.

## Posti

- Address for official Posti Postal Code Files:

  https://www.posti.fi/yritysasiakkaat/apu-ja-tuki/postinumeropalvelut/postinumerotiedostot.html

- Posti Terms Of Use (Finnish only):

  https://www.posti.fi/liitteet-yrityksille/ehdot/postinumeropalvelut-palvelukuvaus-ja-kayttoehdot.pdf

There are 3 different files:

* **BAF** (Basic Addresses File) - Updated every saturday at 13:00 (1:00 PM) GMT+0
* **PCF** (Postal Code File) -  Updated every day at 13:00 (1:00 PM) GMT+0
* **POM** (Post Office Changes) -  Updated on 2nd day of each month at 13:00 (1:00 PM) GMT+0

This tool downloads the latest files and processes only the ones that have been updated,
so you can setup the automation to be run as often as you like, but I would suggest you not to
run this more than once per day.

The files above can be found here:

  - https://www.posti.fi/webpcode/

## TIPS

While executing this tool, it will try to automatically find the config file from these paths, in this order:
- `<path to your project>/posti.config.js`
- `<path to your home dir>/.posti/config.js`

You can also specify a custom path for the config file, with either:
```
posti --config=/path/to/config
```
..or:
```
config=/path/to/config posti
```

You can also use `~` in the path, which will be converted as your home directory path automatically, so e.g.: `config=~/.posti.js` is going to be converted into e.g.: `config=/home/user/.posti.js`.

This tool uses [`Sequelize`](https://github.com/sequelize/sequelize), therefore this tool supports/should support:
- MySQL / MariaDB
- Postgres
- SQLite
- Microsoft SQL Server

I've only tested the usage with MariaDB, so please, if you try any other of the supported databases, let me know if you're having issues and/or if its working, so that I can update this readme.

## Force update

You can bypass the checks and force this tool to process each of the files, by `force=true posti`.

## Installation as a dependency for your project
1. Install the dependency
```
yarn add posti
```
or:
```
npm install posti
```

2. Create a `posti.config.js` file in your project root:
```javascript
module.exports.default = {
  DIALECT: 'mysql', // http://docs.sequelizejs.com/manual/installation/usage.html#dialects
  HOST: 'example.com',
  USER: 'POSTI',
  PASSWORD: 'user',
  DATABASE: 'password',
  OPTIONS: {}, // http://docs.sequelizejs.com/manual/installation/usage.html#options
};
```

3. Create a `npm` script in your `package.json` file:
```javascript
"scripts": {
  "update-posti": "posti"
}
```

4. Run the script:
```
yarn update-posti
```
or:
```
npm run update-posti
```

## Installation as a global command
1. Install the package
```
yarn global add posti
```
or:
```
npm install -g posti
```

2. Create a `.posti/config.js` file in your home dir:
```javascript
module.exports.default = {
  DIALECT: 'mysql', // http://docs.sequelizejs.com/manual/installation/usage.html#dialects
  HOST: 'example.com',
  USER: 'POSTI',
  PASSWORD: 'user',
  DATABASE: 'password',
  OPTIONS: {}, // http://docs.sequelizejs.com/manual/installation/usage.html#options
};
```

3. Run the script:
```
posti
```

## Screenshots

- [Screencapture](https://posti.devaus.eu/screencapture.gif)
- [Screenshot](https://posti.devaus.eu/screenshot.png)

## License

MIT License

Copyright (c) 2018 Kimmo Saari

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
