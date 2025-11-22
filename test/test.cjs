'use strict';
const path   = require('path');
const assert = require('assert');
const fs     = require('fs');
const purge  = require('../');

const entrypoint        = path.join(__dirname, 'test-module.cjs');
const rootPath          = path.join(__dirname, '..');
const targetPath        = 'test-dist';
const additionalModules = ['ms'];

const options = {
  entrypoint,
  targetPath,
  rootPath,
  additionalModules,
  isEsm:           false,
  excludedModules: undefined,
};

purge(options).then(() => {
  console.log('Successfully purged');
  const purgedModules  = path.join(rootPath, options.targetPath, 'node_modules');
  const modulesContent = fs.readdirSync(purgedModules);

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


