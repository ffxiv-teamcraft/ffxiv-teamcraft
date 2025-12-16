const path = require('path')

module.exports = {
  dbPath: (name) => path.join(
    __dirname,
    '../../../../library/',
    `${name}.csv`
  ),
  outputPath: (name) => path.join(
    __dirname,
    '../../../libs/data/src/lib/json/tw/',
    `tw-${name}.json`
  ),
  languages: [{
    output: 'tw',
    file: ''
  }]
}
