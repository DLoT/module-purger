'use strict'

const fs   = require('fs');
const path = require('path');

function getDirSize(dirPath) {
  let size    = 0;
  const files = fs.readdirSync(dirPath);

  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(dirPath, files[i]);
    const stats    = fs.statSync(filePath);

    size += stats.isDirectory() ? getDirSize(filePath) : stats.size;
  }

  return size;
}

function getSizeInMb(sizeInByte) {
  return (sizeInByte / 1024 / 1024).toFixed(2);
}

module.exports = { getDirSize, getSizeInMb }
