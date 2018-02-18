'use strict';
const path   = require('path'),
      assert = require('assert'),
      fs     = require('fs'),
      purge  = require('../');

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
    excludedModules: undefined,
  };

purge(options).then(() => {
  console.log('Successfully purged');
  const purgedModules  = path.join(rootPath, options.targetPath, 'node_modules'),
        modulesContent = fs.readdirSync(purgedModules);
  assert.deepEqual(modulesContent, ['commander', 'ms']);

}).catch(error => console.error(error));


