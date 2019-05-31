const { getAllPages } = require('../tools.js');
const fs = require('fs');
const path = require('path');
const {merge} = require('rxjs');
const {map} = require('rxjs/operators');

function getFragment(path) {
  return `<url>
      <loc>https://ffxivteamcraft.com/db${path}</loc>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
   </url>`;
}

function getMetaFragments(sheetName, routeName){
  return getAllPages(`https://xivapi.com/${sheetName}?columns=ID,Name_*`).pipe(
    map(page => {
      return [].concat.apply([], page.Results.map(item => {
        return ['en', 'ja', 'de', 'fr'].map(lang => {
          return getFragment(`/${lang}/${routeName}/${item.ID}/${(item[`Name_${lang}`] || item.Name_en).split(' ').join('-')}`);
        });
      }));
    })
  );
}

const sitemap = [];

merge(
  getMetaFragments('Item', 'item'),
  getMetaFragments('Quest', 'quest'),
  getMetaFragments('InstanceContent', 'instance'),
  getMetaFragments('Status', 'status'),
  getMetaFragments('CraftAction', 'action'),
  getMetaFragments('Action', 'action'),
  getMetaFragments('Fate', 'fate'),
  getMetaFragments('ENpcResident', 'npc'),
  getMetaFragments('Leve', 'leve'),
  getMetaFragments('Trait', 'trait'),
  getMetaFragments('BNpcName', 'mob'),
).subscribe((fragments) => {
  sitemap.push(...fragments);
},null, () => {
  console.log(`urls inside sitemap: ${sitemap.length}`);
  fs.writeFileSync(path.join(__dirname, '../output/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   ${sitemap.join('\n')}
</urlset>`);
});
