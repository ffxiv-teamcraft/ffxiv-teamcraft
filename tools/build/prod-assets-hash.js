const path = require('path');
const colors = require('colors/safe');
const fs = require('fs');
const hashFiles = require('hash-files');

console.log(colors.cyan('\nHashing game assets'));

const baseFiles = fs.readdirSync(path.join(__dirname, '../../dist/apps/client/assets/data/'));
const koFiles = fs.readdirSync(path.join(__dirname, '../../dist/apps/client/assets/data/ko/')).map(row => `/ko/${row}`);
const zhFiles = fs.readdirSync(path.join(__dirname, '../../dist/apps/client/assets/data/zh/')).map(row => `/zh/${row}`);

[...baseFiles, ...koFiles, ...zhFiles]
  .filter(row => {
    return row.indexOf('.json') > -1;
  })
  .forEach(row => {
    const filePath = path.join(__dirname, '../../dist/apps/client/assets/data/', row);
    const hash = hashFiles.sync({ files: [filePath] });
    if (row.indexOf(hash) > -1) {
      return;
    }
    fs.renameSync(filePath, path.join(__dirname, '../../dist/apps/client/assets/data/', `${row.replace('.json', '')}.${hash}.json`));
  });

console.log(colors.green('\nGame assets hashed successfully!'));


