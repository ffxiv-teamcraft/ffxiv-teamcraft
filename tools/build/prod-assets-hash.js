const path = require('path');
const colors = require('colors/safe');
const fs = require('fs');
const hashFiles = require('hash-files');

console.log(colors.cyan('\nHashing game assets'));

const baseFiles = fs.readdirSync(path.join(__dirname, '../../libs/data/src/lib/json/'));
const koFiles = fs.readdirSync(path.join(__dirname, '../../libs/data/src/lib/json/ko/')).map((row) => `/ko/${row}`);
const zhFiles = fs.readdirSync(path.join(__dirname, '../../libs/data/src/lib/json/zh/')).map((row) => `/zh/${row}`);

[...baseFiles, ...koFiles, ...zhFiles]
  .filter(row => {
    return row.indexOf('.json') > -1;
  })
  .forEach(row => {
    const filePath = path.join(__dirname, '../../libs/data/src/lib/json/', row);
    const hash = hashFiles.sync({ files: [filePath] });
    if (row.indexOf(hash) > -1) {
      return;
    }
    // Stripping line breaks and other indent stuff
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    fs.writeFileSync(filePath, JSON.stringify(content));
    fs.renameSync(filePath, path.join(__dirname, '../../libs/data/src/lib/json/', `${row.replace('.json', '')}.${hash}.json`));
  });

// Extracts
const extractsPath = path.join(__dirname, '../../libs/data/src/lib/extracts/extracts.json');
const extractsHash = hashFiles.sync({ files: [extractsPath] });
fs.renameSync(extractsPath, extractsPath.replace('.json', `.${extractsHash}.json`));


console.log(colors.green('\nGame assets hashed successfully!'));


