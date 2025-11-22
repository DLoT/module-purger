'use strict';
const getDependencies = require('./getDependencies');
const copyFiles       = require('./copyFiles');
const getStats        = require('./getStats');
const getLicencePath  = require('./getLicencePath');

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
 *  <li>- <code>excludeModules</code>: An array of modules to exclude
 * </ul>
 * @return {Promise} Resolves
 */
module.exports = (options) => {
  return getDependencies(options)
    .then(addLicenceFiles)
    .then(addPackageJson)
    .then((dependencies) => copyFiles(dependencies, options.targetPath))
    .then((dependencies) => getStats(dependencies, options))
    .then((result) => {
      console.log('Total size of node_modules %o\n', `${getSizeInMb(result.allModulesSize)} MB`);

      console.log('Size was \t%o', `${getSizeInMb(result.oldSize)} MB`);
      console.log('Removed \t%o', `${getSizeInMb(result.oldSize - result.newSize)} MB`);
      console.log(`New size is \t%o\n`, `${getSizeInMb(result.newSize)} MB`);
      console.log('This saves \t%o', `${100 - (result.newSize / result.oldSize * 100).toFixed(2)}%`);
    })
    .catch(console.error);
};

function addLicenceFiles(dependencies) {
  dependencies.modulePaths.forEach((modulePath) => {
    const licenceFilePath = getLicencePath(modulePath);
    if (licenceFilePath !== undefined) {
      dependencies.filePaths.add(licenceFilePath);
    }
  });

  return dependencies;
}

function addPackageJson(dependencies) {
  dependencies.modulePaths.forEach((modulePath) => {
    const packageJsonPath = `${modulePath}/package.json`;
    dependencies.filePaths.add(packageJsonPath);
  });

  return dependencies;
}

function getSizeInMb(sizeInByte) {
  return (sizeInByte / 1024 / 1024).toFixed(2);
}