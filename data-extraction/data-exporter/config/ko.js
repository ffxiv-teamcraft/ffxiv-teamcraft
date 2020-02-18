const path = require('path')

module.exports = {
  dbPath: (name) => path.join(
    __dirname,
    '../../../../library/korea/csv',
    `${name}.csv`
  ),
  outputPath: (name) => path.join(
    __dirname,
    '../../../apps/client/src/assets/data/ko/',
    `ko-${name}.json`
  ),
  languages: [{
    output: 'ko',
    file: ''
  }]
}
