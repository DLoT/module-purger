'use strict';
/**
 * Monkeypatch the node Module._load function log all required modules
 * which are required when the app starts.
 */
const Module           = require('module'),
      originalLoadFunc = Module._load;

Module._load = function (request, parent, isMain) {
  const filePath = Module._resolveFilename(request, parent);

  console.log(filePath);

  return originalLoadFunc(request, parent, isMain);
};
