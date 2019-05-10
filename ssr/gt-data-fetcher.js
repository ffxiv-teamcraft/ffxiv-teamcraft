const request = require('request');
const fs = require('fs');
const path = require('path');

fs.existsSync(path.join(__dirname, 'output')) || fs.mkdirSync(path.join(__dirname, 'output'));

request('https://www.garlandtools.org/bell/nodes.js', {}, (err, _, res) => {
  fs.writeFileSync(path.join(__dirname, 'output', 'gt-nodes.js'), res);
});

request('https://www.garlandtools.org/bell/fish.js', {}, (err, _, res) => {
  fs.writeFileSync(path.join(__dirname, 'output', 'gt-fish.js'), res);
});
