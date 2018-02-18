'use strict';
const path = require('path'),
      glob = require('glob-all');

function getMetaFiles(modulePath) {
  const folder                 = path.dirname(modulePath).split(path.sep),
        firstModuleFolderIndex = folder.reverse().findIndex((item) => {
          return item === 'node_modules';
        });

  const checkPath = folder.splice(firstModuleFolderIndex - 1).reverse().join('/');
  return glob.sync([`${checkPath}/**/LICE*`, `${checkPath}/package.json`], {nocase: true});
}

module.exports = getMetaFiles;