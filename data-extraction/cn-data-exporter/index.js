const fs = require('fs')
const path = require('path')
const readCsv = require('./read-csv')

const dbPath = (name, isMultiLanguage) => path.join(
  __dirname,
  '../../../library/5.1/',
  `${name}${isMultiLanguage ? '.chs' : ''}.csv`
)
const outputPath = (name) => path.join(
  __dirname,
  '../../apps/client/src/assets/data/zh/',
  `zh-${name}.json`
)

/* eslint no-extend-native: 0 */
Array.prototype.findById = function (id) {
  return this.find(item => item['#'] == id)
}

Array.prototype.kvmap = function (nKey = 'Name', valueFunc = (val) => val) {
  return this.map(item => ({ key: item['#'], value: valueFunc(item[nKey]) }))
}

Array.prototype.toObject = function (valueFunc = (val) => val) {
  return this.reduce((obj, row) => {
    obj[row['#']] = valueFunc(row)
    return obj
  }, {})
}

Array.prototype.simpleObject = function (key) {
  return this.toObject(row => row[key] ? ({
    zh: row[key]
  }) : undefined)
}

const dbStore = {}
const db = function (name, isMultiLanguage = true, cache = false) {
  if (dbStore[name]) {
    return dbStore[name]
  }

  const dbItem = readCsv(fs.readFileSync(dbPath(name, isMultiLanguage), 'utf-8'))
  if (cache) {
    dbStore[name] = dbItem
  }

  return dbItem
}

const output = function (name, content) {
  fs.writeFileSync(outputPath(name), JSON.stringify(content, null, 2) + '\n');
}

output('achievement-descriptions', db('Achievement').simpleObject('Description'))
output('achievements', db('Achievement').simpleObject('Name'))
output('action-categories', db('ActionCategory').simpleObject('Name'))
output('actions', db('Action').simpleObject('Name'))
output('action-descriptions', db('ActionTransient').simpleObject('Description'))
output('content-types', db('ContentType').simpleObject('Name'))
output('craft-actions', db('CraftAction').simpleObject('Name'))
output('craft-descriptions', db('CraftAction').simpleObject('Description'))
output('fates', db('Fate').toObject(row => {
  if (!row.Name) return

  let icon = ('000000' + row['Icon{Map}']).substr(-6)
  return row.Name ? {
    name: {
      zh: row.Name
    },
    description: {
      zh: row.Description
    },
    icon: `ui/icon/${icon.substr(0, 2)}0000/${icon}.tex`
  } : undefined;
}))
output('gathering-bonuses', db('GatheringPointBonus', false).toObject(row => {
  return +row.BonusValue ? {
    value: +row.BonusValue,
    conditionValue: +row.ConditionValue,
    bonus: {
      zh: db('GatheringPointBonusType', true, true).findById(row.BonusType).Text
    },
    Condition: {
      zh: db('GatheringCondition', true, true).findById(row.Condition).Text
    }
  } : undefined
}))
output('instance-descriptions', db('ContentFinderCondition')
  .reduce((obj, row) => {
    if (!obj[row.Content] && row.Name && row.ContentLinkType !== '4') {
      const transient = db('ContentFinderConditionTransient', true, true)
        .findById(row['#'])
      if (transient && transient.Description) {
        obj[row.Content] = {
          zh: transient.Description
        }
      }
    }

    return obj
  }, {}))
output('instances', db('ContentFinderCondition')
  .reduce((obj, row) => {
    if (!obj[row.Content] && row.Name && row.ContentLinkType !== '4') {
      obj[row.Content] = {
        zh: row.Name
      }
    }

    return obj
  }, {}))
output('item-search-categories', db('ItemSearchCategory').simpleObject('Name'))
output('item-ui-categories', db('ItemUICategory').simpleObject('Name'))
output('items', db('Item').simpleObject('Name'))
output('job-abbr', db('ClassJob').simpleObject('Name'))
output('job-categories', db('ClassJobCategory').simpleObject('Name'))
output('job-name', db('ClassJob').simpleObject('Name'))
output('journal-genre', db('JournalGenre').simpleObject('Name'))
output('leve-descriptions', db('Leve').simpleObject('Description'))
output('leves', db('Leve').simpleObject('Name'))
output('maps', db('Map', false).toObject(row => {
  let name = db('PlaceName', true, true)
    .findById(row.PlaceName)
    .Name

  return name ? {
    zh: name
  } : undefined
}))
output('mobs', db('BNpcName').simpleObject('Singular'))
output('npc-titles', db('ENpcResident').simpleObject('Title'))
output('npcs', db('ENpcResident').simpleObject('Singular'))
output('places', db('PlaceName').simpleObject('Name'))
output('quest-descriptions', db('Quest').toObject(row => {
  let id = row.Id
  if (!id) return

  let questPath = `quest/${id.substr(id.indexOf('_') + 1, 3)}/${id}`
  let quest = db(questPath)
  
  let desc = quest.find(item => item['#1'] === `TEXT_${id.toUpperCase()}_SEQ_00`)
  if (!desc) return

  return {
    zh: desc['#2']
  }
}))
output('quests', db('Quest').simpleObject('Name'))
output('shops', db('SpecialShop').simpleObject('Name'))
output('status-descriptions', db('Status').simpleObject('Description'))
output('statuses', db('Status').simpleObject('Name'))
output('trait-descriptions', db('TraitTransient').simpleObject('Description'))
output('traits', db('Trait').simpleObject('Name'))
output('triple-triad-rule-descriptions', db('TripleTriadRule').simpleObject('#2'))
output('triple-triad-rules', db('TripleTriadRule').simpleObject('Name'))
output('weathers', db('Weather').simpleObject('Name'))
