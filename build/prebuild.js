const path = require('path');
const colors = require('colors/safe');
const fs = require('fs');
const appVersion = require('../package.json').version;

console.log(colors.cyan('\nRunning pre-build tasks'));

const versionFilePath = path.join(__dirname + '/../src/environments/version.ts');

const src = `export const version = '${appVersion}';
`;

// ensure version module pulls value from package.json
fs.writeFile(versionFilePath, src, { flat: 'w' }, function (err) {
    if (err) {
        return console.log(colors.red(err));
    }

    console.log(colors.green(`Updating application version ${colors.yellow(appVersion)}`));
    console.log(`${colors.green('Writing version module to ')}${colors.yellow(versionFilePath)}\n`);
});
