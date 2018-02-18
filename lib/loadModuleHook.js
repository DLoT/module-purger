'use strict';
/**
 * Monkeypatch the node Module._load function to write a temporary file with all the file paths
 * which are required when the app starts.
 * Use options: manualCopies (see index.js) for files oder folders which are not required at startup!
 */
const Module           = require('module'),
      originalLoadFunc = Module._load;

Module._load = function (request, parent, isMain) {
  const filePath = Module._resolveFilename(request, parent);

  console.log(filePath);

  return originalLoadFunc(request, parent, isMain);
};
