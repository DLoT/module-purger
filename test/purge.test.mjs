import { after, before, describe, it } from 'node:test';
import path from 'node:path';
import assert from 'node:assert';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import purge from '../index.mjs';

const filename = fileURLToPath(import.meta.url);
const dirname  = path.dirname(filename);

const targetPath    = 'test-dist';
const rootPath      = path.join(dirname, '..');
const purgedModules = path.join(rootPath, targetPath, 'node_modules');

const additionalModules = ['ms'];


describe('ESM', () => {
  const entrypoint = path.join(dirname, 'entrypoint.mjs');

  const options = {
    entrypoint,
    targetPath,
    rootPath,
    additionalModules,
    isEsm:           true,
    excludedModules: undefined,
  };

  before(async () => {
    await purge(options);
  });

  after(async () => {
    await fs.rm(path.join(rootPath, targetPath), { recursive: true, force: true })
  });

  it('should copy imported module and the additionalModules', async () => {
    const modulesContent = await fs.readdir(purgedModules);

    assert.deepStrictEqual(modulesContent.sort(), ['@acme', 'ms']);
  });

  describe('imported in module', () => {
    const acmePath = path.join(purgedModules, '@acme', 'example');

    it('should include all relevant files of the module', async () => {
      const acmeContent = await fs.readdir(acmePath);

      assert.deepStrictEqual(acmeContent, ['LICENSE.md', 'index.mjs', 'lib', 'package.json']);
    });

    it('should include the children', async () => {
      const acmeLibPath    = path.join(acmePath, 'lib');
      const acmeLibContent = await fs.readdir(acmeLibPath);

      assert.deepStrictEqual(acmeLibContent, ['required-file.js']);
    });
  });

  describe('additionalModules', () => {
    it('should include all relevant files of the module', async () => {
      const msPath    = path.join(purgedModules, 'ms');
      const msContent = await fs.readdir(msPath);

      assert.deepStrictEqual(msContent, ['index.js', 'license.md', 'package.json']);
    });
  });
});

describe('CJS', () => {
  const entrypoint = path.join(dirname, 'entrypoint.cjs');

  const options = {
    entrypoint,
    targetPath,
    rootPath,
    additionalModules,
    isEsm:           false,
    excludedModules: undefined,
  };

  before(async () => {
    await purge(options);
  });

  after(async () => {
    await fs.rm(path.join(rootPath, targetPath), { recursive: true, force: true })
  });

  it('should copy required modules and the additionalModules', async () => {
    const modulesContent = await fs.readdir(purgedModules);

    assert.deepStrictEqual(modulesContent.sort(), ['@acme', 'ms']);
  });

  describe('required', () => {
    const acmePath = path.join(purgedModules, '@acme', 'example');

    it('should include all relevant files of the module', async () => {
      const acmeContent = await fs.readdir(acmePath);

      assert.deepStrictEqual(acmeContent, ['LICENSE.md', 'index.cjs', 'lib', 'package.json']);
    });

    it('should include the children', async () => {
      const acmeLibPath    = path.join(acmePath, 'lib');
      const acmeLibContent = await fs.readdir(acmeLibPath);

      assert.deepStrictEqual(acmeLibContent, ['required-file.js']);
    });
  });

  describe('additionalModules', () => {
    it('should include all relevant files of the module', async () => {
      const msPath    = path.join(purgedModules, 'ms');
      const msContent = await fs.readdir(msPath);

      assert.deepStrictEqual(msContent, ['index.js', 'license.md', 'package.json']);
    });
  });
});
