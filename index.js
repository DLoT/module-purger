'use strict';
const fs   = require('fs'),
      path = require('path'),
      exec = require('child_process').exec,
      ncp  = require('ncp').ncp;

let targetDir, rootDir, manualCopies, exclude;

/**
 * Copy the given files/folders manually
 */
function handleManualCopies() {
  for (let source of Object.keys(manualCopies)) {
    const sourcePath      = path.join(rootDir, source),
          targetPath      = path.join(rootDir, targetDir, manualCopies[source]),
          specialFileDirs = path.join(targetDir, manualCopies[source])
            .split('/');

    if (fs.statSync(source).isFile()) {
      specialFileDirs.pop();

      mkdirTree(specialFileDirs);
      copyFile(sourcePath, targetPath);
    } else {

      mkdirTree(specialFileDirs);
      copyFolder(sourcePath, targetPath);
    }
  }
}

/**
 * Copy the given folder to the specified target.
 *
 * @param {string} source The folder to copy
 * @param {string} target Where to copy the folder to
 */
function copyFolder(source, target) {
  ncp(source, target, (err) => {
    if (err) {
      console.error(err);
    }
  });
}

/**
 * Copy the given source file to the specified target.
 *
 * @param {string} source The file to copy
 * @param {string} target Where to copy the file to
 */
function copyFile(source, target) {
  const read = fs.readFileSync(source);
  fs.writeFileSync(target, read);
}

/**
 * Copy the given node modules to the target directory.
 *
 * @param {Set} files A set of node modules to be copied
 */
function copyFiles(files) {
  for (let file of files) {
    const sourcePathArray  = file.split('/'),
          targetPathString = file.replace(rootDir, targetDir),
          targetPath       = path.join(rootDir, targetPathString),
          targetPathArray  = targetPathString.split('/');

    sourcePathArray.pop();
    targetPathArray.pop();

    mkdirTree(targetPathArray);
    copyFile(file, targetPath);

    let packageJsonFound = false;

    while (packageJsonFound === false) {
      const indexFile   = path.join(sourcePathArray.join('/'), 'index.js'),
            packageJson = path.join(sourcePathArray.join('/'), 'package.json');

      if (fs.existsSync(indexFile)) {
        const targetFile = path.join(rootDir, targetPathArray.join('/'), 'index.js');
        copyFile(indexFile, targetFile);
      }

      if (fs.existsSync(packageJson)) {
        const targetFile = path.join(rootDir, targetPathArray.join('/'), 'package.json');

        packageJsonFound = true;

        copyFile(packageJson, targetFile);
      }

      sourcePathArray.pop();
      targetPathArray.pop();
    }
  }
}

/**
 * Recursively creates the specified folder structure.
 *
 * @param {Array.string} path The path segments of the folder to create
 */
function mkdirTree(path) {
  let checkDir = rootDir;
  for (let folder of path) {
    checkDir += '/' + folder;
    if (!fs.existsSync(checkDir)) {
      fs.mkdirSync(checkDir);
    }
  }
}

/**
 * Copy the modules, that are listed in the specified file, to the target directory.
 *
 * @param {string} modulePathsFile Path of the file, containing the required modules
 * @param {Function} callback A callback which will be called when ready
 * @return {Function} A callback function wrapping the methods logic
 */
function copyNodeModuleFiles(modulePathsFile, callback) {

  return (err) => {
    if (err) {
      callback(err);
    }


    fs.readFile(modulePathsFile, (err, data) => {
      if (err) {
        callback(err);
      }

      let files = data.toString()
        .split('\n')
        .filter((filename) => {
          // only copy project node_modules!
          // symlinks or global packages have to be handled via options specialFiles
          return filename.search(`${rootDir}/node_modules`) > -1;
        });

      // exclude given paths
      if (exclude.length > 0) {
        const excludeRegEx = new RegExp(`(${exclude.join('|')})`);

        files = files.filter((filename) => {
          return excludeRegEx.test(filename) === false;
        });
      }

      files = new Set(files);

      copyFiles(files);

      handleManualCopies();

      fs.unlinkSync(modulePathsFile);

      callback();
    });
  };

}

/**
 *
 * @param {object} options Purging parameters as follows
 * <ul style='list-style-type:none'>
 *  <li>- <code>targetDir</code>: The directory where to put the result</li>
 *  <li>- <code>rootDir</code>: Root directory of the project</li>
 *  <li>- <code>manualCopies</code>:  Object Copy given files or folders manually
 *  <pre>
 *   e.g. {sourcePath: targetPath} <br>
 *   different target { 'some/path/[file.js]': 'some/target/[file.js]' }<br>
 *   same target {'some/path/[file.js]'}
 *   </pre>
 *  </li>
 *  <li>- <code>exclude</code>: Array Exclude given paths
 *  <li>- <code>startScript</code>: The script which starts your application e.g. ./src/index.js
 *  <li>- <code>additionalModules</code>: An array of modules to load before requiring the startScript
 * </ul>
 * @param {Function} callback A callback which will be called when ready
 */
function purgeNodeModules(options, callback) {

  // set the globals
  targetDir    = options.targetDir;
  rootDir      = options.rootDir;
  manualCopies = options.manualCopies;
  exclude      = options.exclude || [];

  const modulePathsFile   = path.join(__dirname, '/nodeModulePaths.txt'),
        additionalModules = options.additionalModules.length > 0 ? `-m "${options.additionalModules.join(' ')}"` : "",
        command           = `node ${__dirname}/startModule.js -e ${options.entrypoint} -m ${additionalModules}`,
        appProcess        = exec(command, copyNodeModuleFiles(modulePathsFile, callback));


  appProcess.stderr.on('data', function (err) {
    if (err) {
      console.log('STDERR:', err);
    }
  });

  appProcess.stdout.on('data', function ( data) {
    console.log('STDOUT:', data);
  });
}

module.exports = purgeNodeModules;
