const path = require('path');
const colors = require('colors/safe');
const fs = require('fs');
const hashFiles = require('hash-files');

console.log(colors.cyan('\nHashing game assets'));

const baseFiles = fs.readdirSync(path.join(__dirname, '../../dist/apps/client/assets/data/'));
const koFiles = fs.readdirSync(path.join(__dirname, '../../dist/apps/client/assets/data/ko/')).map(row => `/ko/${row}`);
const zhFiles = fs.readdirSync(path.join(__dirname, '../../dist/apps/client/assets/data/zh/')).map(row => `/zh/${row}`);
const twFiles = fs.readdirSync(path.join(__dirname, '../../dist/apps/client/assets/data/tw/')).map(row => `/tw/${row}`);

[...baseFiles, ...koFiles, ...zhFiles, ...twFiles]
  .filter(row => {
    return row.indexOf('.json') > -1;
  })
  .forEach(row => {
    const contentPath = path.join(__dirname, '../../libs/data/src/lib/json/', row);
    const filePath = path.join(__dirname, '../../dist/apps/client/assets/data/', row);
    const hash = hashFiles.sync({ files: [contentPath] });
    if (row.indexOf(hash) > -1) {
      return;
    }
    // Stripping line breaks and other indent stuff
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    fs.writeFileSync(filePath, JSON.stringify(content));
    fs.renameSync(filePath, path.join(__dirname, '../../dist/apps/client/assets/data/', `${row.replace('.json', '')}.${hash}.json`));
  });

// Extracts
const extractsPath = path.join(__dirname, '../../dist/apps/client/assets/extracts/extracts.json');
const extractsContentPath = path.join(__dirname, '../../libs/data/src/lib/extracts/extracts.json');
const extractsHash = hashFiles.sync({ files: [extractsContentPath] });
const hashedExtractsPath = extractsPath.replace('.json', `.${extractsHash}.json`);
// Idempotent: a re-run over a cached client build (e.g. build:dmg:dir) leaves the
// already-hashed file in place and no plain extracts.json to rename.
if (fs.existsSync(extractsPath)) {
  fs.renameSync(extractsPath, hashedExtractsPath);
} else if (!fs.existsSync(hashedExtractsPath)) {
  throw new Error(`extracts.json missing and no hashed copy found at ${hashedExtractsPath}`);
}


console.log(colors.green('\nGame assets hashed successfully!'));


