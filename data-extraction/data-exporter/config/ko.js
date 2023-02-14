const path = require('path')

module.exports = {
  dbPath: (name) => path.join(
    __dirname,
    '../../../../library/korea/csv',
    `${name}.csv`
  ),
  outputPath: (name) => path.join(
    __dirname,
    '../../../libs/data/src/lib/json/ko/',
    `ko-${name}.json`
  ),
  languages: [{
    output: 'ko',
    file: ''
  }]
}
