type PurgeOptions = {
  /** The directory where to put the result */
  targetPath: string;
  /** Root directory of the project */
  rootPath: string;
  /** The script which starts your application e.g. ./src/index.js */
  entrypoint: string;
  /** Array of paths to exclude */
  exclude?: string[];
  /** An array of modules to load before requiring the startScript */
  additionalModules?: string[];
  /** An array of modules to exclude */
  excludeModules?: string[];
}

/**
 * Purges superfluous files from node_modules
 */
declare function purge(options: PurgeOptions): Promise<void>;

export = purge;