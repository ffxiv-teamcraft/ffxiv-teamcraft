const path = require('path');
const colors = require('colors/safe');
const fs = require('fs');
const _ = require('lodash');
const hashFiles = require('hash-files');

console.log(colors.cyan(`Updating lazy loaded files list`));

const baseFiles = fs.readdirSync(path.join(__dirname, '../../apps/client/src/assets/data/'));
const koFiles = fs.readdirSync(path.join(__dirname, '../../apps/client/src/assets/data/ko/')).map(row => `/ko/${row}`);
const zhFiles = fs.readdirSync(path.join(__dirname, '../../apps/client/src/assets/data/zh/')).map(row => `/zh/${row}`);

fs.writeFileSync(path.join(__dirname, '../../apps/client/src/app/core/data/lazy-files-list.ts'),
  `export const lazyFilesList = ${JSON.stringify([...baseFiles, ...koFiles, ...zhFiles]
      .filter(row => {
        return row.indexOf('.json') > -1;
      })
      .map(row => {
        const hash = hashFiles.sync({ files: [path.join(__dirname, '../../apps/client/src/assets/data/', row)] });
        return {
          fileName: row,
          hashedFileName: `${row.replace('.json', '')}.${hash}.json`,
          propertyName: _.camelCase(row.replace('.json', '').replace(/\/\w+\//, ''))
        };
      })
    , null, 2)};`.replace(/"/g, '\'')
);

console.log(colors.green('Lazy loaded files list updated'));

console.log(colors.cyan(`Updating lazy loaded data interface`));

fs.writeFileSync(path.join(__dirname, '../../apps/client/src/app/core/data/lazy-data.ts'),
  `export interface LazyData { 
  ${
    [...baseFiles, ...koFiles, ...zhFiles]
      .filter(row => {
        return row.indexOf('.json') > -1;
      })
      .map(row => {
        return `${_.camelCase(row.replace('.json', '').replace(/\/\w+\//, ''))}`;
      })
      .join(': any;\n  ')
  }: any;
}`.replace(/"/g, '\'')
);

console.log(colors.green(`Lazy loaded data interface updated`));
