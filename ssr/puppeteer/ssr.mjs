import puppeteer from 'puppeteer';
import urlModule from 'url';
import { Storage } from '@google-cloud/storage';
import { readFileSync } from 'fs';
import { join } from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const storage = new Storage();
const bucket = storage.bucket('ssr.beta.ffxivteamcraft.com');
const URL = urlModule.URL;

const GtFish = readFileSync(join(__dirname, '../output/gt-fish.js'));
const GtNodes = readFileSync(join(__dirname, '../output/gt-nodes.js'));

function removeScripts(pageContent) {
  let matches = pageContent.match(/<script(?:.*?)>(?:[\S\s]*?)<\/script>/gi);
  for (let i = 0; matches && i < matches.length; i++) {
    if (matches[i].indexOf('application/ld+json') === -1) {
      pageContent = pageContent.replace(matches[i], '');
    }
  }

  //<link rel="import" src=""> tags can contain script tags. Since they are already rendered, let's remove them
  matches = pageContent.match(/<link[^>]+?rel="import"[^>]*?>/i);
  for (let i = 0; matches && i < matches.length; i++) {
    pageContent = pageContent.replace(matches[i], '');
  }
  return pageContent;
}

/**
 * @param {string} path page path to prerender.
 * @param {string} browserWSEndpoint Optional remote debugging URL. If
 *     provided, Puppeteer's reconnects to the browser instance. Otherwise,
 *     a new browser instance is launched.
 * @param prerender Is this for prerendering? If yes, no content will be returned if cache is hit.
 * @param baseUrl Base url for the website to SSR
 */
async function ssr(path, browserWSEndpoint, prerender = false, baseUrl = 'http://localhost:8080') {
  const start = Date.now();
  const cacheRef = bucket.file(`${path.slice(1)}.html`);
  const [exists] = await cacheRef.exists();
  if (exists) {
    if (prerender) {
      return;
    }
    const [content] = await cacheRef.download();
    const ttRenderMs = Date.now() - start;
    return { html: content.toString(), ttRenderMs };
  }
  const url = `${baseUrl}${path}`;

  const browser = await puppeteer.connect({ browserWSEndpoint });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1
  });

  const stylesheetContents = {};

  // 1. Intercept network requests.
  await page.setRequestInterception(true);

  // Stash the responses of local stylesheets.
  page.on('response', async resp => {
    const responseUrl = resp.url();
    const sameOrigin = new URL(responseUrl).origin === new URL(url).origin;
    const isStylesheet = resp.request().resourceType() === 'stylesheet';
    if (sameOrigin && isStylesheet) {
      stylesheetContents[responseUrl] = await resp.text();
    }
  });

  page.on('request', req => {
    // Block GA to avoid double page hits
    const blocklist = ['www.google-analytics.com', '/gtag/js', 'ga.js', 'analytics.js', 'yandex.ru', 'vntsm.com', /\.map$/, /.ico$/];
    if (blocklist.find(regex => req.url().match(regex))) {
      return req.abort();
    }

    if (req.url().endsWith('.js')) {
      return req.continue({
        url: `${baseUrl}${new URL(req.url()).pathname}`
      });
    }

    if (req.url() === 'https://www.garlandtools.org/bell/fish.js') {
      return req.respond({
        contentType: 'application/javascript',
        body: GtFish
      });
    }

    if (req.url() === 'https://www.garlandtools.org/bell/nodes.js') {
      return req.respond({
        contentType: 'application/javascript',
        body: GtNodes
      });
    }

    // 3. Pass through all other requests.
    req.continue();
  });

  const renderUrl = new URL(url);
  renderUrl.searchParams.set('headless', 'true');
  await page.goto(renderUrl, {
    waitUntil: 'load'
  });
  try {
    await page.waitForFunction(() => {
      return window.renderComplete;
    }, { timeout: 60000 });
    await page.$$eval('link[rel="stylesheet"]', (links, content) => {
      links.forEach(link => {
        const cssText = content[link.href];
        if (cssText) {
          const style = document.createElement('style');
          style.textContent = cssText;
          link.replaceWith(style);
        }
        delete content[link.href];
      });
    }, stylesheetContents);
    const html = removeScripts(await page.content()); // serialized HTML of page DOM.

    await page.close();

    const ttRenderMs = Date.now() - start;

    await cacheRef.save(html, {
      gzip: true
    });

    return { html, ttRenderMs };
  } catch (err) {
    console.error(err.message);
    return { html: '', ttsRenderMs: Date.now() - start };
  }
}

export { ssr as default };
