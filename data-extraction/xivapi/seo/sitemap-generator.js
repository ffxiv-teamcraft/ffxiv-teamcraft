const { getAllPages } = require('../tools.js');
const fs = require('fs');
const path = require('path');

function getFragment(path) {
  return `<url>
      <loc>https://ffxivteamcraft.com/db${path}</loc>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
   </url>`;
}

const fragments = [];

getAllPages('https://xivapi.com/Item?columns=ID,Name_*').subscribe(page => {
  page.Results.forEach(item => {
    fragments.push(...['en', 'ja', 'de', 'fr'].map(lang => {
      return getFragment(`/${lang}/item/${item.ID}/${(item[`Name_${lang}`] || item.Name_en).split(' ').join('-')}`);
    }));
  });
}, null, () => {
  fs.writeFileSync(path.join(__dirname, '../../apps/client/src/assets/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   ${fragments.join('\n')}
</urlset>`);
});
