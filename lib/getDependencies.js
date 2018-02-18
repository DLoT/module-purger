'use strict';
const path  = require('path'),
      spawn = require('child_process').spawn,
      debug = require("debug")(`module-purger:${path.parse(__filename).name}`);

module.exports = (options) => {
  debug('Gather files for [%o]', options);

  const rootModulePath    = `${options.rootPath}/node_modules/`,
        entrypoint        = options.entrypoint,
        additionalModules = options.additionalModules,
        excludedModules   = options.excludedModules;

  return new Promise((resolve, reject) => {
    const command         = getCommand(entrypoint, additionalModules),
          appProcess      = spawn('node', command),
          requiredModules = [];

    appProcess.stderr.on('data', (error) => {
      console.error(error.toString())
    });

    appProcess.stdout.on('data', (stdoutData) => {
      const modulePaths = getModulePaths(rootModulePath, excludedModules, stdoutData);
      requiredModules.push(...modulePaths);
      modulePaths.forEach(path => debug('Gathered file [%o]', path.replace(rootModulePath, '')));
    });

    appProcess.on('error', (error) => {
      console.log(error);
      reject(error);
    });

    appProcess.on('exit', () => {
      const uniqueModules = [...new Set(requiredModules)];
      resolve(uniqueModules);
    });
  });
}

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

function getModulePaths(rootModulesPath, excludedModules, stdoutData) {
  let modulePaths = stdoutData.toString().split('\n');
  return modulePaths.filter((modulePath) => isRelevantModule(modulePath, rootModulesPath, excludedModules) === true);
}

function isRelevantModule(modulePath, rootModulesPath, excludedModules) {
  return isPackageDependency(modulePath, rootModulesPath) === true && isExcluded(modulePath, excludedModules) === false;
}

function isPackageDependency(modulePath, rootModulesPath) {
  return modulePath.search(rootModulesPath) > -1;
}

function isExcluded(modulePath, excludedModules) {
  if (excludedModules === undefined) {
    return false;
  }
  const excludedModulesRegEx = new RegExp(`(${excludedModules.join('|')})`);
  return excludedModulesRegEx.test(modulePath) === false;
}
