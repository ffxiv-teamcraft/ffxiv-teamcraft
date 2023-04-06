const path = require('path');
const colors = require('colors/safe');
const fs = require('fs');
const appVersion = require('../../package.json').version;

console.log(colors.cyan('\nRunning pre-build tasks'));

const versionFilePath = path.join(__dirname + '/../../apps/client/src/environments/version.ts');
const patchNotesFilePath = path.join(__dirname + '/../../apps/client/src/environments/patch-notes.json');

const src = `export const version = '${appVersion}';
`;

// ensure version module pulls value from package.json
fs.writeFileSync(versionFilePath, src);

console.log(colors.green(`Updating application version ${colors.yellow(appVersion)}`));
console.log(`${colors.green('Writing version module to ')}${colors.yellow(versionFilePath)}\n`);

const changelog = fs.readFileSync(path.join(__dirname, '../../CHANGELOG.md'), 'utf8');

const sections = changelog.split('# [');
const changes = sections.slice(1, 11).reduce((acc, section) => {
  const version = section.split('](h')[0];
  return [...acc, {
    version,
    content: section.split('\n')
      .slice(3, -5).join('\n')
      .replace(/\s\(\[.+/gm, '.')
      .replace(/`/gm, '\\`')
  }];
}, []);

fs.writeFileSync(patchNotesFilePath, JSON.stringify(changes));
console.log(`${colors.green('Writing patch notes to ')}${colors.yellow(patchNotesFilePath)}\n`);
