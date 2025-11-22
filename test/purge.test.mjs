import { after, before, describe, it } from 'node:test';
import { dirname, join } from 'node:path';
import assert from 'node:assert';
import { readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import purge from '../index.mjs';

const filename = fileURLToPath(import.meta.url);

const currentDir = dirname(filename);

const targetPath    = 'test-dist';
const rootPath      = join(currentDir, '..');
const purgedModules = join(rootPath, targetPath, 'node_modules');

const additionalModules = ['@acme/additional'];


describe('ESM', () => {
  const entrypoint = join(currentDir, 'entrypoint.mjs');

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
    await rm(join(rootPath, targetPath), { recursive: true })
  });

  describe('loaded in app', () => {
    const modulePath = join(purgedModules, '@acme', 'loaded');

    it('should include all relevant files of the module', async () => {
      const fileList = await readdir(modulePath);

      assert.deepStrictEqual(fileList, ['LICENSE.md', 'index.mjs', 'lib', 'package.json']);
    });

    it('should include the children', async () => {
      const libPath  = join(modulePath, 'lib');
      const fileList = await readdir(libPath);

      assert.deepStrictEqual(fileList, ['required-file.js']);
    });
  });

  describe('additionalModules', () => {
    const modulePath = join(purgedModules, '@acme', 'additional');

    it('should include all relevant files of the module', async () => {
      const fileList = await readdir(modulePath);

      assert.deepStrictEqual(fileList, ['LICENSE.md', 'index.mjs', 'lib', 'package.json']);
    });

    it('should include the children', async () => {
      const libPath  = join(modulePath, 'lib');
      const fileList = await readdir(libPath);

      assert.deepStrictEqual(fileList, ['required-file.js']);
    });

  });
});

describe('CJS', () => {
  const entrypoint = join(currentDir, 'entrypoint.cjs');

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
    await rm(join(rootPath, targetPath), { recursive: true })
  });

  describe('loaded in app', () => {
    const modulePath = join(purgedModules, '@acme', 'loaded');

    it('should include all relevant files of the module', async () => {
      const fileList = await readdir(modulePath);

      assert.deepStrictEqual(fileList, ['LICENSE.md', 'index.cjs', 'lib', 'package.json']);
    });

    it('should include the children', async () => {
      const libPath  = join(modulePath, 'lib');
      const fileList = await readdir(libPath);

      assert.deepStrictEqual(fileList, ['required-file.js']);
    });
  });

  describe('additionalModules', () => {
    const path = join(purgedModules, '@acme', 'additional');

    it('should include all relevant files of the module', async () => {
      const fileList = await readdir(path);

      assert.deepStrictEqual(fileList, ['LICENSE.md', 'index.cjs', 'lib', 'package.json']);
    });

    it('should include the children', async () => {
      const libPath  = join(path, 'lib');
      const fileList = await readdir(libPath);

      assert.deepStrictEqual(fileList, ['required-file.js']);
    });
  });
});
