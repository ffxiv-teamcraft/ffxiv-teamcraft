const path = require('path')

module.exports = {
  dbPath: (name) => path.join(
    __dirname,
    '../../../../library/',
    `${name}.csv`
  ),
  outputPath: (name) => path.join(
    __dirname,
    '../../../apps/client/src/assets/data/zh/',
    `zh-${name}.json`
  ),
  languages: [{
    output: 'zh',
    file: ''
  }]
}
