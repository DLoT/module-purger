import path from 'node:path';
import assert from 'node:assert';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import purge from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const entrypoint        = path.join(__dirname, 'test-module.mjs');
const rootPath          = path.join(__dirname, '..');
const targetPath        = 'test-dist';
const additionalModules = ['ms'];

const options = {
  entrypoint,
  targetPath,
  rootPath,
  additionalModules,
  isEsm:           true,
  excludedModules: undefined,
};

try {
  await purge(options);
  console.log('Successfully purged');

  const purgedModules  = path.join(rootPath, options.targetPath, 'node_modules');
  const modulesContent = fs.readdirSync(purgedModules);

  assert.deepStrictEqual(modulesContent.sort(), ['@acme', 'commander', 'ms']);

  const acmePath    = path.join(purgedModules, '@acme', 'example');
  const acmeContent = fs.readdirSync(acmePath);

  assert.deepStrictEqual(acmeContent, ['LICENSE.md', 'index.js', 'package.json']);

  const commanderPath    = path.join(purgedModules, 'commander');
  const commanderContent = fs.readdirSync(commanderPath);

  assert.deepStrictEqual(commanderContent, ['LICENSE', 'esm.mjs', 'index.js', 'package.json']);

  const msPath    = path.join(purgedModules, 'ms');
  const msContent = fs.readdirSync(msPath);

  assert.deepStrictEqual(msContent, ['index.js', 'license.md', 'package.json']);

} catch (error) {
  console.error(error);
  process.exit(1);
}