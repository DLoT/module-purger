'use strict';
const path   = require('path');
const assert = require('assert');
const fs     = require('fs');
const purger = require('../');

console.log(__dirname);

const
  entrypoint        = path.join(__dirname, 'test-module.js'),
  targetDir         = './dist',
  rootDir           = path.join(__dirname, '..'),
  additionalModules = ['debug'],

  options           = {
    entrypoint,
    targetDir,
    rootDir,
    additionalModules,
    manualCopies: [],
  };

console.log(options);

process.stderr.on('data', function (err) {
  if (err) {
    console.log('DASD', err);
  }
});

process.stdout.on('data', function (data) {
  console.log(data);
});

purger(options, () => {
  console.log('purged');
  const modulesContent = fs.readdirSync(`${targetDir}/node_modules`);
  assert.deepEqual(modulesContent, ['commander','debug', 'ms']);
  process.exit(0);
});

