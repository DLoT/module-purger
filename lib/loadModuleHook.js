'use strict';
/**
 * Monkeypatch the node Module._load function
 * Write all required files to stdout
 */
const Module              = require('module'),
      originalLoadFunction = Module._load;

Module._load = (request, parent, isMain) => {
  const filePath = Module._resolveFilename(request, parent);

  process.stdout.write(`${filePath}\n`);

  return originalLoadFunction(request, parent, isMain);
};
