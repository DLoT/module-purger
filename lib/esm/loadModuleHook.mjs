import { fileURLToPath } from 'node:url';

/**
 * Loader function for esm modules
 *
 * Write all required files to stdout
 */
export async function load(url, context, nextLoad) {
  if (url.startsWith('file:')) {
    process.stdout.write(`${fileURLToPath(url)}\n`);
  }

  return nextLoad(url, context);
}