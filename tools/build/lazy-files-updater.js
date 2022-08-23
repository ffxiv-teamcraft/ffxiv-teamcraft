const path = require('path');
const colors = require('colors/safe');
const fs = require('fs');
const _ = require('lodash');
const hashFiles = require('hash-files');
const {
  quicktype,
  InputData,
  jsonInputForTargetLanguage
} = require('quicktype-core');

const baseFiles = fs.readdirSync(path.join(__dirname, '../../apps/client/src/assets/data/'));
const koFiles = fs.readdirSync(path.join(__dirname, '../../apps/client/src/assets/data/ko/')).map((row) => `/ko/${row}`);
const zhFiles = fs.readdirSync(path.join(__dirname, '../../apps/client/src/assets/data/zh/')).map((row) => `/zh/${row}`);

const getPropertyName = (filename) => _.camelCase(filename.replace('.json', '').replace(/\/\w+\//, ''));

function getClassName(file) {
  const baseName = file
    .replace('/ko/', '')
    .replace('/zh/', '')
    .replace('ies.json', 'y')
    .replace(/s?\.json/, '')
    .replace(/bonuse$/, 'bonus')
    .replace(/statuse$/, 'status')
    .replace(/sery$/, 'series');
  return 'Lazy' + _.startCase(_.camelCase(baseName)).replace(/\s/g, '');
}

function getType(file) {
  const className = getClassName(file);
  const data = fs.readFileSync(path.join(__dirname, '../../apps/client/src/assets/data/', file), 'utf8');
  const dataObj = JSON.parse(data);
  let indexType = Array.isArray(dataObj) ? 'Array<T>' : 'Record<number, T>';
  if (Object.keys(dataObj).filter(k => !isNaN(k)).length === 0) {
    return {
      type: className,
      importStr: `import {${className}} from './model/${_.kebabCase(className)}';`
    };
  }
  const valuesAreArrays = Array.isArray(dataObj[0] || dataObj[Object.keys(dataObj)[0]]);
  if (valuesAreArrays) {
    indexType = indexType.replace('T', 'T[]');
  }
  if (fs.existsSync(path.join(__dirname, '../../apps/client/src/app/lazy-data/model/', `${_.kebabCase(className)}.ts`))) {
    return {
      type: indexType.replace('T', className),
      importStr: `import {${className}} from './model/${_.kebabCase(className)}';`
    };
  }
  // If it's not a class index, let's get the data type
  let inferredType;
  if (indexType.startsWith('Array')) {
    inferredType = typeof (valuesAreArrays ? dataObj[0][0] : dataObj[0]);
  } else {
    const firstElement = valuesAreArrays ? dataObj[Object.keys(dataObj)[0]][0] : dataObj[Object.keys(dataObj)[0]];
    if (typeof firstElement === 'object') {
      if (firstElement.ko !== undefined) {
        inferredType = '{ko: string}';
      } else if (firstElement.zh !== undefined) {
        inferredType = '{zh: string}';
      } else {
        inferredType = typeof firstElement;
      }
    } else {
      inferredType = typeof firstElement;
    }
  }
  return { type: indexType.replace('T', inferredType) };
}

function validateLines(lines) {
  if (lines.length === 0) {
    return false;
  }
  const props = lines.slice(1, -2);
  if (props.length === 1) {
    return !/(ko|zh):/i.test(props[0]);
  }
  return true;
}

(async () => {

  console.log(colors.cyan(`Updating lazy loaded files list`));
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

  console.log(colors.cyan(`Updating lazy loaded data Models`));

  for (const file of [...baseFiles, ...koFiles, ...zhFiles]) {
    if (file.indexOf('.json') === -1) {
      continue;
    }
    const className = getClassName(file);
    const jsonString = fs.readFileSync(path.join(__dirname, '../../apps/client/src/assets/data/', file));
    const jsonInput = jsonInputForTargetLanguage('typescript');
    await jsonInput.addSource({
      name: className,
      samples: [jsonString]
    });

    const inputData = new InputData();
    inputData.addInput(jsonInput);

    const { lines } = await quicktype({
      inputData,
      lang: 'typescript',
      combineClasses: true,
      rendererOptions: {
        'just-types': true
      },
      indentation: '  '
    });

    if (validateLines(lines)) {
      fs.writeFileSync(path.join(__dirname, '../../apps/client/src/app/lazy-data/model/', `${_.kebabCase(className)}.ts`), lines.join('\n'));
    }
  }
  console.log(colors.green(`Lazy loaded data Models updated`));

  console.log(colors.cyan(`Updating lazy loaded data interface`));

  const { imports, properties } =
    [...baseFiles, ...koFiles, ...zhFiles]
      .filter((row) => {
        return row.indexOf('.json') > -1;
      })
      .reduce((acc, row) => {
        const { type, importStr } = getType(row);
        return {
          properties: `${acc.properties}
  ${getPropertyName(row)}: ${type};`,
          imports: importStr ? `${acc.imports}
${importStr}` : acc.imports
        };
      }, { properties: '', imports: '' });

  fs.writeFileSync(
    path.join(__dirname, '../../apps/client/src/app/lazy-data/lazy-data.ts'),
    `${imports}

export interface LazyData {${properties}
}`.replace(/"/g, '\'')
  );

  console.log(colors.green(`Lazy loaded data interface updated`));


  console.log(colors.cyan(`Updating keys list`));

  const keys =
    [...baseFiles, ...koFiles, ...zhFiles]
      .filter((row) => {
        return row.indexOf('.json') > -1;
      })
      .map(row => getPropertyName(row));


  fs.writeFileSync(
    path.join(__dirname, '../../apps/client/src/app/lazy-data/lazy-data-keys.ts'),
    `export const LazyDataKeys = ${JSON.stringify(keys,null, 2)}`.replace(/"/g, '\'')
  );

  console.log(colors.green(`Keys list updated`));

  return '';
})().then(() => {
  colors.cyan('ALL GOOD');
});

const extractsHash = hashFiles.sync({ files: [path.join(__dirname, '../../apps/client/src/assets/extracts/extracts.json')] });
fs.writeFileSync(
  path.join(__dirname + '/../../apps/client/src/environments/extracts-hash.ts'),
  `export const extractsHash = \`${extractsHash}\`;
`
);
