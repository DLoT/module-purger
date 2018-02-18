'use strict';
const path               = require('path'),
      assert             = require('assert'),
      fs                 = require('fs'),
      purge = require('../');

const
  entrypoint        = path.join(__dirname, 'test-module.js'),
  rootPath          = path.join(__dirname, '..'),
  targetPath        = 'test-dist',
  additionalModules = ['ms'],

  options           = {
    entrypoint,
    targetPath,
    rootPath,
    additionalModules,
    manualCopies: [],
  };

purge(options).then(() => {
  console.log('purged');
//   const modulesContent = fs.readdirSync(`${targetDir}/node_modules`);
//   assert.deepEqual(modulesContent, ['commander', 'ms']);
//
//   process.exit(0);
 });

