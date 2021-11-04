import ssr from './ssr.mjs';
import items from '../../apps/client/src/assets/data/items.json';
import puppeteer from 'puppeteer';
import _ from 'lodash';
import colors from 'colors/safe.js';
import cliProgress from 'cli-progress';

const { chunk } = _;
const { green } = colors;
const { SingleBar } = cliProgress;

const CHUNK_SIZE = 10;

(async () => {
  const browser = await puppeteer.launch({
    timeout: 120000
  });
  const browserWSEndpoint = await browser.wsEndpoint();

  const itemIds = Object.keys(items).slice(1);
  const progress = new SingleBar({
    format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total}',
    hideCursor: true,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591'
  });
  const languages = Object.keys(items[itemIds[0]]);
  const chunks = chunk(itemIds, CHUNK_SIZE);
  progress.start(itemIds.length * languages.length, 0);
  for (const chunk of chunks) {
    await Promise.all(chunk.map(id => {
      return Promise.all(languages.map(lang => {
        const path = `/db/${lang}/item/${id}/${items[id][lang].split(' ').join('-')}`;
        return ssr(path, browserWSEndpoint).then(() => {
          progress.increment();
        }).catch(() => {
          progress.increment();
          return void 0;
        });
      }));
    }));
  }
})();
