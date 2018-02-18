'use strict';
const fs           = require('fs-extra'),
      getMetaFiles = require('./getMetaFiles');

function copyFiles(files, targetPath) {
  const promises = files.map((source) => {
    const destination = source.replace('node_modules', `${targetPath}/node_modules`);
    return fs.copy(source, destination)
  });

  return Promise.all(promises);
}

module.exports = copyFiles;