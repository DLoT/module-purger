'use strict';
/**
 * Monkeypatch the node Module._load function to write a temporary file with all the file paths
 * which are required when the app starts.
 * Use options: manualCopies (see index.js) for files oder folders which are not required at startup!
 */
const Module           = require('module'),
      fs               = require('fs'),
      path             = require('path'),
      oldLoadFunc      = Module._load,
      nodeModulesPaths = path.join(__dirname, 'nodeModulePaths.txt');


if (fs.existsSync(nodeModulesPaths)) {
  fs.unlinkSync(nodeModulesPaths);
}

Module._load = function (request, parent, isMain) {
  const filePath = Module._resolveFilename(request, parent);

  console.log('required modle', (filePath));

  fs.appendFileSync(nodeModulesPaths, `${filePath}\n`);

  return oldLoadFunc(request, parent, isMain);
};
