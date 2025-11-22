'use strict';
const path          = require("path");
const getFolderSize = require('get-folder-size').default;
const debug         = require("debug")(`module-purger:${path.parse(__filename).name}`);

module.exports = async (dependencies, options) => {
  const promises = Array.from(dependencies.modulePaths)
    .map((path) => {
      const modulePath = path.replace(/^(.+?node_modules.+?)\/.+$/, '$1');

      return getFolderSize.strict(modulePath)
    });

  const results = await Promise.all(promises);

  const oldSize        = results.reduce((sum, current) => sum + current, 0);
  const newSize        = await getFolderSize.strict(options.targetPath);
  const allModulesSize = await getFolderSize.strict(options.rootPath + '/node_modules');

  debug('Calculated sizes %o', { oldSize, newSize, allModulesSize })

  return { oldSize, newSize, allModulesSize }
};
