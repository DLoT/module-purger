'use strict';
const getDependencies = require('./getDependencies'),
      copyFiles       = require('./copyFiles'),
      getMetaFiles    = require('./getMetaFiles'),
      debug           = require("debug")('module-purger:purge');

/**
 * Purges superfluous files from node_modules
 *
 * @param {object} options Purging parameters as follows
 * <ul style='list-style-type:none'>
 *  <li>- <code>targetPath</code>: The directory where to put the result</li>
 *  <li>- <code>rootPath</code>: Root directory of the project</li>
 *  <li>- <code>exclude</code>: Array exclude given paths
 *  <li>- <code>entrypoint</code>: The script which starts your application e.g. ./src/index.js
 *  <li>- <code>additionalModules</code>: An array of modules to load before requiring the startScript
 * </ul>
 * @return {Promise} Resolves
 */
module.exports = (options) => {
  return getDependencies(options)
    .then(addMetaFiles)
    .then((filePaths) => {
      filePaths.sort();
      return copyFiles(filePaths, options.targetPath)
    });
};

function addMetaFiles(filePaths) {
  filePaths.forEach((filePath) => {
    const metaFilePaths = getMetaFiles(filePath);
    filePaths.push(...metaFilePaths);
  });

  return filePaths;
}
