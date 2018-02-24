'use strict';
const glob = require('glob');

module.exports = (moduleFolder) => {
  return glob.sync(`${moduleFolder}/LICE*`, {nocase: true})[0];
};

