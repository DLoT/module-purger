'use strict';
const getRequiredModules = require('./getRequiredModules'),
      copyFiles          = require('./copyFiles'),
      fs                 = require('fs-extra'),
      assert             = require('assert'),
      getMetaFiles       = require('./getMetaFiles');

function purge(options) {

  return getRequiredModules(options).then((files) => {

    files.forEach((item) => {
      const metaFiles = getMetaFiles(item);
      files.push(...metaFiles);
    });

    copyFiles(files, options.targetPath).then(() => {
      const modulesContent = fs.readdirSync(`${options.targetPath}/node_modules`);
      assert.deepEqual(modulesContent, ['commander', 'ms']);

      process.exit(0);
    });
  });
}

module.exports = purge;
