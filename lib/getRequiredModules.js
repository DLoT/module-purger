'use strict';
const path  = require('path'),
      spawn = require('child_process').spawn,
      debug = require("debug")('module-purger:');

function getRequiredModules(options) {

  const rootModules       = `${options.rootPath}/node_modules/`,
        entrypoint        = options.entrypoint,
        additionalModules = options.additionalModules;

  return new Promise((resolve, reject) => {
    const command         = getCommand(entrypoint, additionalModules),
          appProcess      = spawn('node', command),
          requiredModules = [];

    appProcess.stderr.on('data', console.error);

    appProcess.stdout.on('data', (stdoutData) => {
      const modulePaths = getModulePaths(rootModules, stdoutData);

      requiredModules.push(...modulePaths);
      modulePaths.forEach(path => debug('Add file [%o]', path.replace(rootModules, '')));
    });

    appProcess.on('error', (error) => {
      reject(error);
    });

    appProcess.on('exit', () => {
      const uniqueModules = Array.from(new Set(requiredModules));
      resolve(uniqueModules);
    });
  });
}

function getCommand(entrypoint, additionalModules) {
  const command = [
    path.join(__dirname, 'executeEntrypoint.js'),
    '-e',
    entrypoint,
  ];

  if (additionalModules.length > 0) {
    command.push('-m', `${additionalModules.join(' ')}`)
  }

  return command;
}

function getModulePaths(rootModules, stdoutData) {
  let modulePaths = stdoutData.toString().split('\n');

  return modulePaths.filter((path) => path.search(rootModules) > -1);
}

module.exports = getRequiredModules;
