import { pathToFileURL } from "node:url";

import { parseArgs } from 'node:util';
import { resolve } from "node:path";

const { values } = parseArgs({
  options: {
    entrypoint: {
      type:  'string',
      short: 'e',
    },
  },
});

const { entrypoint } = values;

if (!entrypoint) {
  console.error('No entrypoint provided');
  process.exit(1);
}
const entrypointPath = resolve(entrypoint.toString());
const entrypointUrl  = pathToFileURL(entrypointPath).href;

try {
  await import(entrypointUrl);

  process.exit(0);
} catch (error) {
  console.error('Unable to load entrypoint' + entrypointUrl, error)

  process.exit(1);
}


