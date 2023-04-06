const path = require('path');
const colors = require('colors');
const fs = require('fs');

const patchNotes = JSON.parse(fs.readFileSync(path.join(__dirname + '/../../apps/client/src/environments/patch-notes.json'), 'utf8'));
const latest = patchNotes[0];
console.log(colors.green('--------------- Discord message'));
console.log(`**${latest.version} has been released !**

Patch Notes:

\`\`\`md
${latest.content}
\`\`\`
`);
