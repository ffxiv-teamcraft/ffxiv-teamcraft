const fs = require('fs')
const readCsv = require('./read-csv')

let config

const init = function (_config) {
  config = _config
}

const i18n = function (dbName, id, nKey = 'name') {
  return config.languages.reduce((obj, { output, file }) => {
    obj[output] = db(dbName, file, true).findById(id)[nKey]

    return obj
  }, {})
}

/* eslint no-extend-native: 0 */
Array.prototype.findById = function (id) {
  return this.find(item => item['#'] == id) // eslint-disable-line eqeqeq
}

Array.prototype.kvmap = function (nKey = 'Name', valueFunc = (val) => val) {
  return this.map(item => ({ key: item['#'], value: valueFunc(item[nKey]) }))
}

Array.prototype.toObject = function (valueFunc = (val) => val, idKey = '#') {
  return this.reduce((obj, row) => {
    obj[row[idKey]] = valueFunc(row)
    return obj
  }, {})
}

Array.prototype.simpleObject = function (key) {
  if (!this._meta) {
    throw new Error('Method called on non-db-rows array')
  }

  return this.toObject(row => row[key] ? i18n(this._meta.name, row['#'], key) : undefined)
}

const dbStore = {}
const db = function (name, lang = null, cache = false) {
  if (!lang && lang !== false) {
    lang = config.languages[0].file
  }

  let file = lang ? `${name}.${lang}` : name
  if (dbStore[file]) {
    return dbStore[file]
  }

  const dbItem = readCsv(fs.readFileSync(config.dbPath(file), 'utf-8'))
  dbItem._meta = { name, lang, file }

  if (cache) {
    dbStore[file] = dbItem
  }

  return dbItem
}

const output = function (name, content) {
  fs.writeFileSync(config.outputPath(name), JSON.stringify(content, null, 2) + '\n')
}

const translate = function (dbName, value, from, nKey = 'Name') {
  const query = value.toLowerCase()
  const row = db(dbName, from, true).find(item => item[nKey].toLowerCase() === query)

  return row ? i18n(dbName, row['#'], nKey) : null
}

module.exports = { init, db, output, translate, i18n }
