'use strict';
const fs    = require('fs-extra');
const path  = require('path');
const debug = require("debug")(`module-purger:${path.parse(__filename).name}`);

module.exports = (dependencies, targetPath) => {
  debug('Copying files to [%o]', targetPath);

  const sourcePaths = Array.from(dependencies.filePaths);
  sourcePaths.sort();

  sourcePaths.forEach((sourcePath) => {
    const destination = sourcePath.replace('node_modules', `${targetPath}/node_modules`);

    debug('Copy file %o', sourcePath.replace(/^.+node_modules\/(.+?)\/(.+?)/, '$1/$2'));

    fs.copySync(sourcePath, destination);
  });

  return dependencies;
};
