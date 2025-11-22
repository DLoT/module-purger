#!/usr/bin/env node

"use strict";

/**
 * This file will be called in index.js to start the given application.
 * It registers the loadModuleHook which writes every required filepath
 * into a temporary file, which will be processed after the process ends.
 */

const { program } = require("commander");

program.option('-e, --entrypoint []', 'Your module entry point. e.g ./lib/index.js')
  .option('-m, --additional-modules []', 'Additional modules you want to "require"')
  .usage('\n\n Usage: node startModule -e [path/to/your/start/script.js] -m "module1 module2"')
  .parse();


require('./loadModuleHook');

const { additionalModules, entrypoint } = program.opts();

// Load additional modules
if (additionalModules !== undefined) {
  for (let module of additionalModules.split(' ')) {
    require(module)
  }
}

// Load the given app entrypoint
require(entrypoint);

// If loaded just exit, we now have all required files
process.nextTick(() => {
  process.exit(0);
});


