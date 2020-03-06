const request = require('request')
const { init, output, translate } = require('./lib/common')

let nameMap = [
  { en: 'A Realm Reborn', zh: '重生之境' },
  { en: 'A Realm Awoken', zh: '觉醒之境' },
  { en: 'Through the Maelstrom', zh: '混沌的漩涡' },
  { en: 'Defenders of Eorzea', zh: '艾欧泽亚的守护者' },
  { en: 'Dreams of Ice', zh: '寒冰的幻想' },
  { en: 'Before the Fall', zh: '希望的灯火' },
  { en: 'Heavensward', zh: '苍穹之禁城' },
  { en: 'As Goes Light, So Goes Darkness', zh: '光与暗的分界' },
  { en: 'The Gears of Change', zh: '命运的齿轮' },
  { en: 'Revenge of the Horde', zh: '绝命怒嚎' },
  { en: 'Soul Surrender', zh: '灵魂继承者' },
  { en: 'The Far Edge of Fate', zh: '命运的止境' },
  { en: 'Stormblood', zh: '红莲之狂潮' },
  { en: 'The Legend Returns', zh: '英雄归来' },
  { en: 'Rise of A New Sun', zh: '曙光微明' },
  { en: 'Under the Moonlight', zh: '月下芳华' },
  { en: 'Prelude in Violet', zh: '狂乱前奏' },
  { en: 'A Requiem for Heroes', zh: '英雄挽歌' },
  { en: 'Shadowbringers', zh: '暗影之逆焰' }
]

let patchNameMap = {
  '5.1': '纯白誓约、漆黑密约'
}

init(require('./config/zh'))

request(`https://xivapi.com/patchlist`, {
  json: true
}, function (err, res, body) {
  if (err) throw err

  output('patchs', body.toObject(row => {
    let [, name] = row.Name_en.split(':')
    if (name) {
      name = name.trim()

      const mapItem = nameMap.find(item => item.en.toLowerCase() === name.toLowerCase())
      if (mapItem) {
        name = mapItem.zh
      } else {
        const ret = translate('Quest', name, 'en')
        if (ret) {
          name = ret.zh
        }
      }
    } else if (patchNameMap[row.Version]) {
      name = patchNameMap[row.Version]
    }

    return {
      zh: `${row.Version} 版本${name ? `：${name}` : ''}`
    }
  }, 'ID'))
})
