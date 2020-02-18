const { init, output, db } = require('./lib/common')

init(require('./config/zh'))

output('achievement-descriptions', db('Achievement').simpleObject('Description'))
output('achievements', db('Achievement').simpleObject('Name'))
output('action-categories', db('ActionCategory').simpleObject('Name'))
output('actions', db('Action').simpleObject('Name'))
output('action-descriptions', db('ActionTransient').simpleObject('Description'))
output('base-params', db('BaseParam').simpleObject('Name'))
output('beast-reputation-ranks', db('BeastReputationRank').simpleObject('Name'))
output('content-types', db('ContentType').simpleObject('Name'))
output('craft-actions', db('CraftAction').simpleObject('Name'))
output('craft-descriptions', db('CraftAction').simpleObject('Description'))
output('event-items', db('EventItem').simpleObject('Singular'))
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
  } : undefined
}))
output('gathering-bonuses', db('GatheringPointBonus', false).toObject(row => {
  return +row.BonusValue ? {
    value: +row.BonusValue,
    conditionValue: +row.ConditionValue,
    bonus: {
      zh: db('GatheringPointBonusType', null, true).findById(row.BonusType).Text
    },
    condition: {
      zh: db('GatheringCondition', null, true).findById(row.Condition).Text
    }
  } : undefined
}))
output('gathering-types', db('GatheringType').simpleObject('Name'))
output('instance-descriptions', db('ContentFinderCondition')
  .reduce((obj, row) => {
    if (!obj[row.Content] && row.Name && row.ContentLinkType !== '4') {
      const transient = db('ContentFinderConditionTransient', null, true)
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
output('item-descriptions', db('Item').simpleObject('Description'))
output('job-abbr', db('ClassJob').simpleObject('Name'))
output('job-categories', db('ClassJobCategory').simpleObject('Name'))
output('job-name', db('ClassJob').simpleObject('Name'))
output('journal-genre', db('JournalGenre').simpleObject('Name'))
output('leve-descriptions', db('Leve').simpleObject('Description'))
output('leves', db('Leve').simpleObject('Name'))
output('maps', db('Map', false).toObject(row => {
  let name = db('PlaceName', null, true)
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
output('races', db('Race').simpleObject('Masculine'))
output('shops', Object.assign(db('GilShop').simpleObject('Name'), db('SpecialShop').simpleObject('Name')))
output('status-descriptions', db('Status').simpleObject('Description'))
output('statuses', db('Status').simpleObject('Name'))
output('trait-descriptions', db('TraitTransient').simpleObject('Description'))
output('traits', db('Trait').simpleObject('Name'))
output('tribes', db('Tribe').simpleObject('Masculine'))
output('triple-triad-rule-descriptions', db('TripleTriadRule').simpleObject('#2'))
output('triple-triad-rules', db('TripleTriadRule').simpleObject('Name'))
output('weathers', db('Weather').simpleObject('Name'))
