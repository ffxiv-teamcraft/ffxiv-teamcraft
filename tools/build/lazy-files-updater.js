const path = require('path');
const colors = require('colors/safe');
const fs = require('fs');

console.log(colors.green(`Updating lazy loaded files list`));

const baseFiles = fs.readdirSync(path.join(__dirname, '../../apps/client/src/assets/data/'));
const koFiles = fs.readdirSync(path.join(__dirname, '../../apps/client/src/assets/data/ko/')).map(row => `/ko/${row}`);
const zhFiles = fs.readdirSync(path.join(__dirname, '../../apps/client/src/assets/data/zh/')).map(row => `/zh/${row}`);

fs.writeFileSync(path.join(__dirname, '../../apps/client/src/app/core/data/lazy-files-list.ts'),
  `export const lazyFilesList = ${JSON.stringify([...baseFiles, ...koFiles, ...zhFiles].filter(row => {
    return row.indexOf('.json') > -1;
  }), null, 2)};`.replace(/"/g, '\'')
);

console.log(colors.green('Lazy loaded files list updated'));
