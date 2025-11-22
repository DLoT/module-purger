'use strict';
const path  = require('path');
const spawn = require('child_process').spawn;
const debug = require("debug")(`module-purger:${path.parse(__filename).name}`);

module.exports = (options) => {
  debug('Gather files for [%o]', options);

  const rootModulePath    = `${options.rootPath}/node_modules/`
  const entrypoint        = options.entrypoint
  const excludedModules   = options.excludedModules
  const additionalModules = options.additionalModules;

  return new Promise((resolve, reject) => {
    const command     = getCommand(entrypoint, additionalModules);
    const appProcess  = spawn('node', command);
    const filePaths   = new Set();
    const modulePaths = new Set();

    appProcess.stderr.on('data', (error) => {
      console.error(error.toString())
    });

    appProcess.stdout.on('data', (stdoutData) => {
      const files = getFiles(rootModulePath, excludedModules, stdoutData);

      files.forEach((filePath) => {
        filePaths.add(filePath);

        const modulePath = filePath.replace(/^(.*node_modules(\/@.+?\/)?.+?)\/.*$/, '$1');
        modulePaths.add(modulePath);

        debug('Gathered file [%o]', filePath.replace(rootModulePath, ''))
      });
    });

    appProcess.on('error', (error) => {
      console.log(error);
      reject(error);
    });

    appProcess.on('exit', () => {
      resolve({ modulePaths, filePaths });
    });
  });
};

function getCommand(entrypoint, additionalModules) {
  const command = [
    path.join(__dirname, 'startModule.js'),
    '-e',
    entrypoint,
  ];

  if (additionalModules.length > 0) {
    command.push('-m', `${additionalModules.join(' ')}`)
  }

  return command;
}

function getFiles(rootModulesPath, excludedModules, stdoutData) {
  let modulePaths = stdoutData.toString().split('\n');
  return modulePaths.filter((modulePath) => isRelevantModule(modulePath, rootModulesPath, excludedModules) === true);
}

function isRelevantModule(modulePath, rootModulesPath, excludedModules) {
  return isPackageDependency(modulePath, rootModulesPath) === true && isExcluded(modulePath, excludedModules) === false;
}

function isPackageDependency(modulePath, rootModulesPath) {
  return modulePath.indexOf(rootModulesPath) > -1;
}

function isExcluded(modulePath, excludedModules) {
  if (excludedModules === undefined) {
    return false;
  }
  const excludedModulesRegEx = new RegExp(`(${excludedModules.join('|')})`);
  return excludedModulesRegEx.test(modulePath);
}
