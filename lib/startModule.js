"use strict";

/**
 * This file will be called in index.js to start the given application.
 * It registers the loadModuleHook which writes every required filepath
 * into a temporary file, which will be processed after the process ends.
 */

const { parseArgs } = require('node:util');

const { values } = parseArgs({
  options: {
    entrypoint:        {
      type:  'string',
      short: 'e',
    },
    additionalModules: {
      type:  'string',
      short: 'm',
    },
  },
});

require('./loadModuleHook');

const { additionalModules, entrypoint } = values;

// Load additional modules
if (additionalModules !== undefined) {
  for (let module of additionalModules.split(' ')) {
    require(module)
  }
}

// Load the given app entrypoint
require(entrypoint);

// If loaded just exit, we now have all required files
process.nextTick(() => process.exit(0));


