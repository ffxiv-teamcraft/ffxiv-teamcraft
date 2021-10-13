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
    .replace(/bonuse$/, 'bonus')
    .replace(/statuse$/, 'status')
    .replace(/sery$/, 'series')
    .replace(/s?\.json/, '');
  return 'Lazy' + _.startCase(_.camelCase(baseName)).replace(/\s/g, '');
}

function getType(file) {
  const className = getClassName(file);
  const data = fs.readFileSync(path.join(__dirname, '../../apps/client/src/assets/data/', file), 'utf8');
  const indexType = Array.isArray(JSON.parse(data)) ? 'Array<T>' : 'Record<number, T>';
  if (fs.existsSync(path.join(__dirname, '../../apps/client/src/app/lazy-data/model/', `${_.kebabCase(className)}.ts`))) {
    return {
      type: indexType.replace('T', className),
      importStr: `import {${className}} from './model/${_.kebabCase(className)}';`
    };
  }
  // If it's not a class index, let's get the data type
  let inferredType;
  if (indexType.startsWith('Array')) {
    inferredType = typeof JSON.parse(data)[0];
  } else {
    const parsed = JSON.parse(data);
    const firstElement = parsed[Object.keys(parsed)[0]];
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
