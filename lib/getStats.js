'use strict';
const getFolderSize = require('get-folder-size').default;

module.exports = (dependencies, options) => {
  const promises = Array.from(dependencies.modulePaths).map((path) => {
    const modulePath = path.replace(/^(.+?node_modules.+?)\/.+$/, '$1');
    return getFolderSize.loose(modulePath)
  });

  return Promise.all(promises)
    .then((results) => {
      return results.reduce((size, prev) => size + prev, 0);
    })
    .then((required) => {
      return getFolderSize.loose(options.targetPath)
        .then((purged) => ({ required, purged }));
    })
    .then((sizes) => {
      return getFolderSize.loose(options.rootPath + '/node_modules')
        .then((allModules) => {
          sizes.allModules = allModules;
          return sizes;
        });
    });
};
