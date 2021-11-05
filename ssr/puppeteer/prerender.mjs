import ssr from './ssr.mjs';
import items from '../../apps/client/src/assets/data/items.json';
import puppeteer from 'puppeteer';
import cliProgress from 'cli-progress';
import PQueue from 'p-queue';

const { SingleBar } = cliProgress;

const queue = new PQueue({ concurrency: 6 });

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
  progress.start(itemIds.length * languages.length, 0);
  itemIds.forEach(id => {
    languages.forEach(lang => {
      const path = `/db/${lang}/item/${id}/${items[id][lang].split(' ').join('-')}`;
      queue.add(() => {
        return delay(Math.floor(Math.random() * 4000) + 1000).then(() => {
          return ssr(path, browserWSEndpoint).then(() => {
            progress.increment();
          }).catch(() => {
            progress.increment();
            return void 0;
          })
        })
      });
    });
  });
})();
