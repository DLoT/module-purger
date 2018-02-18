'use strict';
const getRequiredModules = require('./getRequiredModules'),
      copyFiles          = require('./copyFiles'),
      fs                 = require('fs-extra'),
      assert             = require('assert'),
      getMetaFiles       = require('./getMetaFiles');



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
function purge(options) {

  return getRequiredModules(options).then((files) => {

    files.forEach((item) => {
      const metaFiles = getMetaFiles(item);
      files.push(...metaFiles);
    });

    return copyFiles(files, options.targetPath)
  });
}

module.exports = purge;
