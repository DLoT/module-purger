import { fileURLToPath } from 'node:url';
import { writeSync } from 'node:fs';

/**
 * Loader function for esm modules
 *
 * Write all imported files to stdout
 * NOTE: use console.error to debug to prevent stdout contamination
 *
 * Must use synchronous writeSync(1): this hook runs on the off-thread
 * ESM loader and the entrypoint exits via process.exit(0), which drops
 * any still-buffered async process.stdout.write() before it reaches the
 * parent that reads the file list.
 */
export async function load(url, context, nextLoad) {
  if (url.startsWith('file:')) {
    writeSync(1, `${fileURLToPath(url)}\n`);
  }

  return nextLoad(url, context);
}
