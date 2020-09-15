const path = require('path');
const colors = require('colors/safe');
const { mkdir, readdir, writeFile, readFile } = require('fs').promises;
const _ = require('lodash');
const hashFiles = require('hash-files');
const { quicktype, InputData, jsonInputForTargetLanguage } = require('quicktype-core');

const projectRoot = path.resolve(__dirname, '../..');
const dataRoot = path.resolve(projectRoot, 'apps/client/src/assets/data');
const genRoot = path.resolve(projectRoot, 'apps/client/src/app/core/data/gen');

const getPropertyName = (filename) => _.camelCase(filename.replace('.json', '').replace(/\/\w+\//, ''));

/**
 * Generates a basic type definition for the given object, as a fallback when quicktype can't generated anything useful for it.
 * @param {unknown} obj
 * @returns {string} A string that can be used as a type definition.
 */
function generateBasicType(obj) {
  const rootType = typeof obj;
  if (rootType === 'string' || rootType === 'boolean' || rootType === 'number') return rootType;
  if (rootType !== 'object') return 'unknown';
  if (Array.isArray(obj)) {
    return `Array<${generateBasicType(obj[0])}>`;
  } else {
    return `Record<string | number, ${generateBasicType(Object.values(obj)[0])}>`;
  }
}

/**
 * Generates the contents of the lazy-data.ts file.
 * @param {Record<string, {fileName: string; hashedFileName: string; interfaceName: string; type: string;}>} fileDetails A record containing the information about all of the lazy data.
 * @returns {string} The contents of the lazy data file to be written.
 */
function generateLazyDataFileString(fileDetails) {
  const importLines = Object.values(fileDetails)
    .map(({ fileName, interfaceName }) => {
      const relPath = path.posix.join('gen', fileName).replace('.json', '');
      return `import { ${interfaceName} } from './${relPath}';`;
    })
    .join('\n');

  const typeDefLines = Object.entries(fileDetails)
    .map(([propertyName, { type }]) => {
      return `  ${propertyName}: ${type};`;
    })
    .join('\n');

  return `${importLines}

export type LazyDataKey = keyof LazyData;
export interface LazyData {
${typeDefLines}
}`;
}

/**
 * Generates info about the lazy data files.
 * @return {Record<string, {fileName: string; hashedFileName: string; interfaceName?: string; type?: string;}>}
 */
async function generateFileDetails() {
  const [baseFiles, koFiles, zhFiles] = await Promise.all([
    readdir(dataRoot),
    readdir(path.join(dataRoot, 'ko')).then((r) => r.map((row) => `/ko/${row}`)),
    readdir(path.join(dataRoot, 'zh')).then((r) => r.map((row) => `/zh/${row}`)),
  ]);

  return [...baseFiles, ...koFiles, ...zhFiles]
    .filter((row) => {
      return row.indexOf('.json') > -1;
    })
    .reduce((acc, row) => {
      const hash = hashFiles.sync({ files: [path.join(dataRoot, row)] });
      const propertyName = getPropertyName(row);
      return {
        ...acc,
        [propertyName]: {
          fileName: row,
          hashedFileName: `${row.replace('.json', '')}.${hash}.json`,
        },
      };
    }, {});
}

async function execute() {
  console.log(colors.cyan(`Updating lazy loaded files list`));

  const fileDetails = await generateFileDetails();
  await writeFile(
    path.join(projectRoot, 'apps/client/src/app/core/data/lazy-files-list.ts'),
    `export const lazyFilesList = ${JSON.stringify(fileDetails, null, 2)};`.replace(/"/g, "'")
  );

  console.log(colors.green('Lazy loaded files list updated'));

  console.log(colors.cyan(`Generating lazy loaded data type definitions`));

  await mkdir(genRoot, { recursive: true });
  for (const [propertyName, { fileName }] of Object.entries(fileDetails)) {
    const jsonInput = jsonInputForTargetLanguage('typescript');
    const interfaceName = `Lazy${_.upperFirst(propertyName)}`;
    const interfaceFile = path.join(genRoot, fileName.replace('.json', '.ts'));
    const jsonFile = path.join(dataRoot, fileName);
    const json = await readFile(jsonFile, { encoding: 'utf8' });
    await jsonInput.addSource({
      name: interfaceName,
      samples: [json],
    });
    const inputData = new InputData();
    inputData.addInput(jsonInput);
    const result = await quicktype({ inputData, rendererOptions: { ['just-types']: true, ['acronym-style']: 'original' } });
    const parsedJson = JSON.parse(json);
    let content;
    if (result.lines.length > 0) {
      content = result.lines.join('\n');
      fileDetails[propertyName].type = Array.isArray(parsedJson) ? `Array<${interfaceName}>` : `Record<string | number, ${interfaceName}>`;
    } else {
      content = `export type ${interfaceName} = ${generateBasicType(parsedJson)};`;
      fileDetails[propertyName].type = interfaceName;
    }
    fileDetails[propertyName].interfaceName = interfaceName;
    await mkdir(path.parse(interfaceFile).dir, { recursive: true });
    await writeFile(interfaceFile, content);
  }

  console.log(colors.green(`Lazy loaded data type definitions generated`));

  console.log(colors.cyan(`Updating lazy loaded data interface`));

  await writeFile(path.join(__dirname, '../../apps/client/src/app/core/data/lazy-data.ts'), generateLazyDataFileString(fileDetails));

  const extractsHash = hashFiles.sync({ files: [path.join(__dirname, '../../apps/client/src/assets/extracts.json')] });
  await writeFile(
    path.join(__dirname + '/../../apps/client/src/environments/extracts-hash.ts'),
    `export const extractsHash = \`${extractsHash}\`;
`
  );

  console.log(colors.green(`Lazy loaded data interface updated`));
}

execute();
