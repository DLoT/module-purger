'use strict';
const fs    = require('fs-extra'),
      path  = require('path'),
      debug = require("debug")(`module-purger:${path.parse(__filename).name}`);

module.exports = (sourcePaths, targetPath) => {
  debug('Copying files to [%o]', targetPath);
  const promises = sourcePaths.map((sourcePath) => {
    const destination = sourcePath.replace('node_modules', `${targetPath}/node_modules`);
    debug('Copy [%o]', getModuleName(sourcePath));
    return fs.copy(sourcePath, destination);
  });

  return Promise.all(promises);
};

function getModuleName(modulePath) {
  return modulePath.replace(/^.+node_modules\/(.+?)\/(.+?)/, '$1/$2')
}