const path = require('path');
const colors = require('colors/safe');
const fs = require('fs');
const _ = require('lodash');
const hashFiles = require('hash-files');
const {
  quicktype,
  InputData,
  jsonInputForTargetLanguage,
  JSONSchemaInput,
  FetchingJSONSchemaStore
} = require('quicktype-core');

console.log(colors.cyan(`Updating lazy loaded files list`));

const baseFiles = fs.readdirSync(path.join(__dirname, '../../apps/client/src/assets/data/'));
const koFiles = fs.readdirSync(path.join(__dirname, '../../apps/client/src/assets/data/ko/')).map((row) => `/ko/${row}`);
const zhFiles = fs.readdirSync(path.join(__dirname, '../../apps/client/src/assets/data/zh/')).map((row) => `/zh/${row}`);

const getPropertyName = (filename) => _.camelCase(filename.replace('.json', '').replace(/\/\w+\//, ''));

fs.writeFileSync(
  path.join(__dirname, '../../apps/client/src/app/core/data/lazy-files-list.ts'),
  `export const lazyFilesList = ${JSON.stringify(
    [...baseFiles, ...koFiles, ...zhFiles]
      .filter((row) => {
        return row.indexOf('.json') > -1;
      })
      .reduce((acc, row) => {
        const hash = hashFiles.sync({ files: [path.join(__dirname, '../../apps/client/src/assets/data/', row)] });
        const propertyName = getPropertyName(row);
        return {
          ...acc,
          [propertyName]: {
            fileName: row,
            hashedFileName: `${row.replace('.json', '')}.${hash}.json`
          }
        };
      }, {}),
    null,
    2
  )};`.replace(/"/g, '\'')
);

console.log(colors.green('Lazy loaded files list updated'));

console.log(colors.blue(`Updating lazy loaded data Models`));
(async () => {
  const jsonString = fs.readFileSync(path.join(__dirname, '../../apps/client/src/assets/data/', 'items.json'));
  const jsonInput = jsonInputForTargetLanguage('typescript');
  await jsonInput.addSource({
    name: 'Items',
    samples: [jsonString]
  });

  const inputData = new InputData();
  inputData.addInput(jsonInput);

  const items = await quicktype({
    inputData,
    lang: 'typescript',
    combineClasses: true,
    rendererOptions: {
      'just-types': true
    }
  });

  console.log(items);
})();
console.log(colors.blue(`Lazy loaded data Models updated`));


console.log(colors.cyan(`Updating lazy loaded data interface`));

fs.writeFileSync(
  path.join(__dirname, '../../apps/client/src/app/core/data/lazy-data.ts'),
  `export type LazyDataKey = keyof LazyData;

export interface LazyData {
  ${[...baseFiles, ...koFiles, ...zhFiles]
    .filter((row) => {
      return row.indexOf('.json') > -1;
    })
    .map(getPropertyName)
    .join(': any;\n  ')}: any;
}`.replace(/"/g, '\'')
);

const extractsHash = hashFiles.sync({ files: [path.join(__dirname, '../../apps/client/src/assets/extracts/extracts.json')] });
fs.writeFileSync(
  path.join(__dirname + '/../../apps/client/src/environments/extracts-hash.ts'),
  `export const extractsHash = \`${extractsHash}\`;
`
);

console.log(colors.green(`Lazy loaded data interface updated`));
