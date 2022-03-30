const fs = require('fs')
const readCsv = require('./read-csv')

let config

const init = function (_config) {
  config = _config
}

const i18n = function (dbName, id, nKey = 'name') {
  let hasValidName = false
  const name = config.languages.reduce((obj, { output, file }) => {
    const dbInst = db(dbName, file, true)
    const dbRow = typeof id === 'function' ? dbInst.find(id) : dbInst.findById(id)
    if (dbRow && dbRow[nKey]) {
      hasValidName = true
      obj[output] = dbRow[nKey]
    }

    return obj
  }, {})

  return hasValidName ? name : undefined
}

Array.prototype.binarySearch = function (id) {
  id = +id
  if (isNaN(id)) return -2

  if (this.length > id && id === +this[id]['#']) {
    return id
  }

  let startPos = 0
  let endPos = this.length - 1
  let startId = +this[startPos]['#']
  let endId = +this[endPos]['#']

  while (endPos > startPos) {
    if (id === startId) return startPos
    if (id === endId) return endPos

    let pos = startPos + Math.ceil((endPos - startPos) / 2)
    let posId = +this[pos]['#']

    // console.log(`${id}, start(${startId}, ${startPos}), end(${endId}, ${endPos}), pos(${posId}, ${pos})`)
    if (posId === id) {
      return pos
    } else if (posId > id) {
      endPos = pos
      endId = posId
    } else {
      startPos = pos
      startId = posId
    }
  }

  return -1
}

/* eslint no-extend-native: 0 */
Array.prototype.findById = function (id) {
  let index = this.binarySearch(id)
  if (index === -1) return null

  if (index < 0) {
    console.log('binarySearch failed', id)
    return this.find(item => item['#'] == id) // eslint-disable-line eqeqeq
  } else {
    return this[index]
  }
}

Array.prototype.kvmap = function (nKey = 'Name', valueFunc = (val) => val) {
  return this.map(item => ({ key: item['#'], value: valueFunc(item[nKey]) }))
}

/**
 * Make an object
 * @param {*} valueFunc Value mapping function
 * @param {*} idKey Column key of ID (defaults to '#')
 * @returns 
 */
Array.prototype.toObject = function (valueFunc = (val) => val, idKey = '#') {
  return this.reduce((obj, row) => {
    obj[row[idKey]] = valueFunc(row)
    return obj
  }, {})
}

/**
 * Make an object with i18n
 * @param {string} key Column key
 * @returns Object
 */
Array.prototype.simpleObject = function (key) {
  if (!this._meta) {
    throw new Error('Method called on non-db-rows array')
  }

  return this.toObject(row => row[key] ? i18n(this._meta.name, row['#'], key) : undefined)
}

const dbStore = {}

/**
 * Read csv data
 * @param {string} name csv file name
 * @param {string|null|false} lang The language you want to read. 
 * Pass `false` if the table is not divided by language. 
 * Pass `null` to use the first language in config.
 * @param {boolean} cache Use cached csv data instead of parsing.
 * @returns {Array}
 */
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

const outputList = process.argv[2] ? process.argv[2].split(',') : null

/**
 * Write data to file
 * @param {string} name File name
 * @param {function|object} content Content to write
 * @returns {void}
 */
const output = function (name, content) {
  if (outputList && !outputList.includes(name)) return

  console.log('output', name)
  if (typeof content === 'function') {
    content = content()
  }

  fs.writeFileSync(config.outputPath(name), JSON.stringify(content, null, 2) + '\n')
}

/**
 * Get i18n object from a string (e.g. some item name)
 * @param {*} dbName Table name
 * @param {*} value String
 * @param {*} from The language of string
 * @param {*} nKey Column key of string (defaults to 'Name')
 * @returns {object}
 */
const translate = function (dbName, value, from, nKey = 'Name') {
  const query = value.toLowerCase()
  const row = db(dbName, from, true).find(item => item[nKey].toLowerCase() === query)

  return row ? i18n(dbName, row['#'], nKey) : null
}

module.exports = { init, db, output, translate, i18n }
