'use strict';
const fs = require('fs-extra'),
  path = require('path'),
  debug = require("debug")(`module-purger:${path.parse(__filename).name}`);

module.exports = (dependencies, targetPath) => {
  debug('Copying files to [%o]', targetPath);
  const sourcePaths = Array.from(dependencies.filePaths);
  sourcePaths.sort();

  sourcePaths.forEach((sourcePath) => {
    const destination = sourcePath.replace('node_modules', `${targetPath}/node_modules`);

    debug('Copy [%o]', sourcePath.replace(/^.+node_modules\/(.+?)\/(.+?)/, '$1/$2'));

    if (fs.pathExistsSync(sourcePath) === true) {
      fs.copySync(sourcePath, destination);
    }
  });

  return dependencies;
};
