const { output, db, i18n } = require('../lib/common')

output('achievement-descriptions', () => db('Achievement').simpleObject('Description'))
output('achievements', () => db('Achievement').simpleObject('Name'))
output('action-categories', () => db('ActionCategory').simpleObject('Name'))
output('actions', () => db('Action').simpleObject('Name'))
output('action-descriptions', () => db('ActionTransient').simpleObject('Description'))
output('base-params', () => db('BaseParam').simpleObject('Name'))
output('beast-reputation-ranks', () => db('BeastReputationRank').simpleObject('Name'))
output('content-types', () => db('ContentType').simpleObject('Name'))
output('craft-actions', () => db('CraftAction').simpleObject('Name'))
output('craft-descriptions', () => db('CraftAction').simpleObject('Description'))
output('event-items', () => db('EventItem').simpleObject('Singular'))
output('ex-versions', () => db('ExVersion').simpleObject('Name'))
output('fates', () => db('Fate').toObject(row => {
  if (!row.Name) return

  let icon = ('000000' + row['Icon{Map}']).substr(-6)
  return row.Name ? {
    name: i18n('Fate', row['#'], 'Name'),
    description: i18n('Fate', row['#'], 'Description'),
    icon: `ui/icon/${icon.substr(0, 2)}0000/${icon}.tex`
  } : undefined
}))
output('gathering-bonuses', () => db('GatheringPointBonus', false).toObject(row => {
  return +row.BonusValue ? {
    value: +row.BonusValue,
    conditionValue: +row.ConditionValue,
    bonus: i18n('GatheringPointBonusType', row.BonusType, 'Text'),
    condition: i18n('GatheringCondition', row.Condition, 'Text')
  } : undefined
}))
output('gathering-types', () => db('GatheringType').simpleObject('Name'))
output('instance-descriptions', () => db('ContentFinderCondition')
  .reduce((obj, row) => {
    if (!obj[row.Content] && row.Name && row.ContentLinkType !== '4') {
      obj[row.Content] = i18n('ContentFinderConditionTransient', row['#'], 'Description')
    }

    return obj
  }, {}))
output('instances', () => db('ContentFinderCondition')
  .reduce((obj, row) => {
    if (!obj[row.Content] && row.Name && row.ContentLinkType !== '4') {
      obj[row.Content] = i18n('ContentFinderCondition', row['#'], 'Name')
    }

    return obj
  }, {}))
output('item-search-categories', () => db('ItemSearchCategory').simpleObject('Name'))
output('item-ui-categories', () => db('ItemUICategory').simpleObject('Name'))
output('items', () => db('Item').simpleObject('Name'))
output('item-descriptions', () => db('Item').simpleObject('Description'))
output('job-categories', () => db('ClassJobCategory').simpleObject('Name'))
output('job-name', () => db('ClassJob').simpleObject('Name'))
output('journal-genre', () => db('JournalGenre').simpleObject('Name'))
output('leve-descriptions', () => db('Leve').simpleObject('Description'))
output('leves', () => db('Leve').simpleObject('Name'))
output('maps', () => db('Map', false).toObject(row => {
  let placeName = +row.PlaceName
  if (!placeName) return

  return i18n('PlaceName', placeName, 'Name')
}))
output('mobs', () => db('BNpcName').simpleObject('Singular'))

let isNotebookShifted = false
output('notebook-division', () => db('NotebookDivision').toObject(row => {
  let id = +row['#']
  if (id === 1007 && !row.Name.includes('8')) {
    isNotebookShifted = true
    return
  } else if (isNotebookShifted && id >= 1008 && id < 2000) {
    --id
  }

  const name = i18n('NotebookDivision', id, 'Name')
  console.log(row['#'], id, name)
  return name
}))
output('notebook-division-category', () => db('NotebookDivisionCategory').simpleObject('Name'))
output('npc-titles', () => db('ENpcResident').simpleObject('Title'))
output('npcs', () => db('ENpcResident').simpleObject('Singular'))
output('places', () => db('PlaceName').simpleObject('Name'))
output('quest-descriptions', () => db('Quest').toObject(row => {
  let id = row.Id
  if (!id) return

  let questPath = `quest/${id.substr(id.indexOf('_') + 1, 3)}/${id}`
  return i18n(questPath, item => item['#1'] === `TEXT_${id.toUpperCase()}_SEQ_00`, '#2')
}))
output('quests', () => db('Quest').simpleObject('Name'))
output('races', () => db('Race').simpleObject('Masculine'))

const craftTypeJobMap = [8, 9, 10, 11, 12, 13, 14, 15]
output('recipes', () => db('Recipe', false).map(recipe => {
  if (!+recipe['#'] || !+recipe['Item{Result}']) return null
  const level = db('RecipeLevelTable', false, true).findById(recipe.RecipeLevelTable)

  const ingredients = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(index => {
    const id = +recipe[`Item{Ingredient}[${index}]`]
    const amount = +recipe[`Amount{Ingredient}[${index}]`]

    if (!id || !amount) {
      return null
    }

    return {
      id,
      amount,
      ilvl: id < 20 ? 0 : +db('Item', null, true).findById(id)['Level{Item}']
    }
  }).filter(a => a)
  const totalIlvl = ingredients.reduce((sum, { amount, ilvl }) => sum + amount * ilvl, 0)
  const quality = Math.floor((+level.Quality) * (+recipe.QualityFactor) / 100)
  const materialQuality = quality * (+recipe.MaterialQualityFactor) / 100

  return {
    id: +recipe['#'],
    job: craftTypeJobMap[+recipe.CraftType],
    lvl: +level.ClassJobLevel,
    yields: +recipe['Amount{Result}'],
    result: +recipe['Item{Result}'],
    stars: +level.Stars,
    qs: recipe.CanQuickSynth === 'True',
    hq: recipe.CanHq === 'True',
    durability: Math.floor((+level.Durability) * (+recipe.DurabilityFactor) / 100),
    quality: quality,
    progress: Math.floor((+level.Difficulty) * (+recipe.DifficultyFactor) / 100),
    suggestedControl: +level.SuggestedControl,
    suggestedCraftsmanship: +level.SuggestedCraftsmanship,
    controlReq: +recipe.RequiredControl,
    craftsmanshipReq: +recipe.RequiredCraftsmanship,
    rlvl: +recipe.RecipeLevelTable,
    ingredients: ingredients.map(({ id, amount, ilvl }) => ({
      id,
      amount,
      quality: ilvl / totalIlvl * materialQuality
    }))
  }
}).filter(a => a))

output('shops', Object.assign(db('GilShop').simpleObject('Name'), db('SpecialShop').simpleObject('Name')))
output('status-descriptions', () => db('Status').simpleObject('Description'))
output('statuses', () => db('Status').simpleObject('Name'))
output('trait-descriptions', () => db('TraitTransient').simpleObject('Description'))
output('traits', () => db('Trait').simpleObject('Name'))
output('tribes', () => db('Tribe').simpleObject('Masculine'))
output('triple-triad-rule-descriptions', () => db('TripleTriadRule').simpleObject('#2'))
output('triple-triad-rules', () => db('TripleTriadRule').simpleObject('Name'))
output('weathers', () => db('Weather').simpleObject('Name'))
