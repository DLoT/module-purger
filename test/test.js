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

  assert.deepStrictEqual(modulesContent, ['@acme', 'commander', 'ms']);

  const acmePath    = path.join(purgedModules, '@acme', 'example');
  const acmeContent = fs.readdirSync(acmePath);

  assert.deepStrictEqual(acmeContent, ['LICENSE.md', 'index.js', 'package.json']);

  const commanderPath    = path.join(purgedModules, 'commander');
  const commanderContent = fs.readdirSync(commanderPath);

  assert.deepStrictEqual(commanderContent, ['LICENSE', 'index.js', 'package.json']);

  const msPath    = path.join(purgedModules, 'ms');
  const msContent = fs.readdirSync(msPath);

  assert.deepStrictEqual(msContent, ['index.js', 'license.md', 'package.json']);
}).catch(console.error);


