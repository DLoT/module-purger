import { fileURLToPath } from 'node:url';

/**
 * Loader function for esm modules
 *
 * Write all imported files to stdout
 * NOTE: use console.error to debug to prevent stdout contamination
 */
export async function load(url, context, nextLoad) {
  if (url.startsWith('file:')) {
    process.stdout.write(`${fileURLToPath(url)}\n`);
  }

  return nextLoad(url, context);
}