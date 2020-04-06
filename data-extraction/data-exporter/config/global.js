const path = require('path')

module.exports = {
  dbPath: (name) => path.join(
    __dirname,
    '../../../../library/5.11/',
    `${name}.csv`
  ),
  outputPath: (name) => path.join(
    __dirname,
    '../../../apps/client/src/assets/data/',
    `${name}.json`
  ),
  languages: [{
    output: 'de',
    file: 'de'
  }, {
    output: 'en',
    file: 'en'
  }, {
    output: 'fr',
    file: 'fr'
  }, {
    output: 'ja',
    file: 'ja'
  }]
}
