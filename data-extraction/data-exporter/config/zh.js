const path = require('path')

module.exports = {
  dbPath: (name) => path.join(
    __dirname,
    '../../../../library/',
    `${name}.csv`
  ),
  outputPath: (name) => path.join(
    __dirname,
    '../../../libs/data/src/lib/json/zh/',
    `zh-${name}.json`
  ),
  languages: [{
    output: 'zh',
    file: ''
  }]
}
