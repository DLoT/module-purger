import { fileURLToPath } from 'node:url';

export async function load(url, context, nextLoad) {
  if (url.startsWith('file:')) {
    process.stdout.write(`${fileURLToPath(url)}\n`);
  }

  return nextLoad(url, context);
}