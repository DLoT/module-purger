'use strict';
const path  = require('path');
const spawn = require('child_process').spawn;
const debug = require("debug")(`module-purger:${path.parse(__filename).name}`);

module.exports = (options) => {
  debug('Gather files for [%o]', options);
  const { rootPath, entrypoint, excludedModules, additionalModules = [], isEsm = false } = options;

  const rootModulePath = `${rootPath}/node_modules/`

  return new Promise((resolve, reject) => {

    const command = isEsm ? getCommandESM(entrypoint, additionalModules) : getCommand(entrypoint, additionalModules);

    debug('Start %o', { isEsm, command })

    const appProcess = spawn('node', command);

    const filePaths   = new Set();
    const modulePaths = new Set();

    appProcess.stderr.on('data', (error) => console.error(error.toString()));

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
    '-e', entrypoint,
  ];

  if (additionalModules.length > 0) {
    command.push('-m', `${additionalModules.join(' ')}`)
  }

  return command;
}

function getCommandESM(entrypoint, additionalModules) {
  const hookPath = path.join(__dirname, 'loadModuleHook.mjs');
  return [
    '--no-warnings',
    '--loader', hookPath,
    ...additionalModules.flatMap((module) => ['--import', module]),
    entrypoint
  ];
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
