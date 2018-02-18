'use strict';
const path  = require('path'),
      glob  = require('glob-all'),
      debug = require('debug')(`module-purger:${path.parse(__filename).name}`);

module.exports = (modulePath) => {
  const checkPath = getModuleFolder(modulePath),
        metaFiles = glob.sync([`${checkPath}/**/LICE*`, `${checkPath}/package.json`], {nocase: true});
  debug('Found [%o] meta files', metaFiles.length);
  return metaFiles;
};

function getModuleFolder(modulePath) {
  const folder                     = path.dirname(modulePath).split(path.sep),
        firstNodeModuleFolderIndex = folder.reverse().findIndex((item) => {
          return item === 'node_modules';
        });

  return folder.splice(firstNodeModuleFolderIndex - 1).reverse().join('/');
}
