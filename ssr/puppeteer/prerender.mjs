import ssr from './ssr.mjs';
import items from '../../apps/client/src/assets/data/items.json';
import puppeteer from 'puppeteer';
import _ from 'lodash';
import colors from 'colors/safe.js';

const { chunk } = _;
const { green } = colors;

const CHUNK_SIZE = 10;

(async () => {
  const browser = await puppeteer.launch({
    timeout: 60000
  });
  const browserWSEndpoint = await browser.wsEndpoint();

  const itemIds = Object.keys(items);
  const languages = Object.keys(items[itemIds[0]]);
  const chunks = chunk(itemIds, CHUNK_SIZE);
  console.log(green(`Starting prerendering of ${itemIds.length * languages.length} item db pages in ${Math.ceil(itemIds.length / CHUNK_SIZE)} batches of ${CHUNK_SIZE * languages.length} pages`));
  console.log(`This can take up to ${Math.ceil(chunks.length * 30 / 60 / 60)} hours.\n`);
  for (const chunk of chunks) {
    await Promise.all(chunk.map(id => {
      console.log(`Item#${id}`);
      return Promise.all(languages.map(lang => {
        const path = `/db/${lang}/item/${id}/${items[id][lang].split(' ').join('-')}`;
        return ssr(path, browserWSEndpoint);
      }));
    }));
  }
})();
