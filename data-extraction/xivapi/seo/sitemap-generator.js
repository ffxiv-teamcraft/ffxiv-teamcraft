const { getAllPages } = require('../tools.js');
const fs = require('fs');
const path = require('path');
const { map } = require('rxjs/operators');

function getFragment(path) {
  return `<url>
      <loc>https://ffxivteamcraft.com/db${path}</loc>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
   </url>`;
}

function generateSitemap(sheetName, routeName) {
  const fragments = [];
  return getAllPages(`https://xivapi.com/${sheetName}?columns=ID,Name_*`).pipe(
    map(page => {
      return [].concat.apply([], page.Results.map(item => {
        return ['en', 'ja', 'de', 'fr'].map(lang => {
          return getFragment(`/${lang}/${routeName}/${item.ID}/${encodeURIComponent((item[`Name_${lang}`] || item.Name_en).split(' ').join('-'))}`);
        });
      }));
    })
  ).subscribe(links => {
      fragments.push(...links);
    },
    null,
    () => {
      fs.writeFileSync(path.join(__dirname, `../../../sitemaps/sitemap-${routeName}.xml`), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   ${fragments.join('\n')}
</urlset>`);
    });
}


generateSitemap('Item', 'item');
generateSitemap('Quest', 'quest');
generateSitemap('InstanceContent', 'instance');
generateSitemap('Status', 'status');
generateSitemap('CraftAction', 'action');
generateSitemap('Action', 'action');
generateSitemap('Fate', 'fate');
generateSitemap('ENpcResident', 'npc');
generateSitemap('Leve', 'leve');
generateSitemap('Trait', 'trait');
generateSitemap('BNpcName', 'mob');

