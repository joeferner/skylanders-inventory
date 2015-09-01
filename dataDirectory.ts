/// <reference path="./lib/skylanders.d.ts" />

import path = require('path');

module.exports = process.env.DATA_DIR || path.join(__dirname, '../skylanders-inventory-data');
console.log('using data directory', module.exports);