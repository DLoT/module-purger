'use strict';
const getSize = require('get-folder-size');

module.exports = (dependencies, options) => {
  const promises = Array.from(dependencies.modulePaths).map((path) => {
    const modulePath = path.replace(/^(.+?node_modules.+?)\/.+$/, '$1');
    return getFolderSize(modulePath)
  });

  return Promise.all(promises)
    .then((results) => {
      return results.reduce((size, prev) => {
        return size + prev;
      }, 0);
    })
    .then((required) => {
      return getFolderSize(options.targetPath)
        .then((purged) => {
          return {required, purged}
        });
    })
    .then((sizes) => {
      return getFolderSize(options.rootPath + '/node_modules')
        .then((allModules) => {
          sizes.allModules = allModules;
          return sizes;
        });
    });
};

function getFolderSize(targetPath) {
  return new Promise((resolve, reject) => {
    getSize(targetPath, (err, size) => {
      if (err) {
        reject(err);
      }

      resolve(size);
    });
  });
}