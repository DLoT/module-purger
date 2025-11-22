'use strict';
const path  = require('path');
const spawn = require('child_process').spawn;
const debug = require("debug")(`module-purger:${path.parse(__filename).name}`);

module.exports = (options) => {
  const { rootPath, entrypoint, excludedModules, additionalModules = [], isEsm = false } = options;

  const rootModulePath = path.join(rootPath, 'node_modules');

  return new Promise((resolve, reject) => {
    const command = isEsm ? getCommandEsm(entrypoint, additionalModules)
                          : getCommandCjs(entrypoint, additionalModules);

    debug('Start %o', { isEsm, command: `node ${command.join(' ')}` })

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

        debug('Found file %o', filePath)
      });
    });

    appProcess.on('error', (error) => {
      console.error(error);
      reject(error);
    });

    appProcess.on('exit', () => {
      resolve({ modulePaths, filePaths });
    });
  });
};


function getCommandCjs(entrypoint, additionalModules) {
  const command = [
    path.join(__dirname, 'cjs/startModule.js'),
    '-e', entrypoint,
  ];

  if (additionalModules.length > 0) {
    command.push('-m', `${additionalModules.join(' ')}`)
  }

  return command;
}

function getCommandEsm(entrypoint, additionalModules) {
  const hookPath    = path.join(__dirname, 'esm/loader.mjs');
  const startScript = path.join(__dirname, 'esm/startModule.mjs');
  const imports     = additionalModules.flatMap((module) => ['--import', module]);

  return [
    '--import', hookPath,
    ...imports,
    startScript,
    '-e', entrypoint,
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
