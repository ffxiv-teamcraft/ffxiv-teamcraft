import express from 'express';
import puppeteer from 'puppeteer';
import ssr from './ssr.mjs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let browserWSEndpoint = null;
const app = express();

export const DIST_FOLDER = join(__dirname, '../dist/apps/client');

function detectIndexBot(userAgent) {

  const bots = [
    'bingbot',
    'yandexbot',
    'duckduckbot',
    'googlebot',
    'slurp',

    'facebookexternalhit',
    'linkedinbot',
    'embedly',
    'baiduspider',
    'pinterest',
    'vkShare',
    'facebot',
    'outbrain',
    'W3C_Validator'
  ];

  const agent = userAgent.toLowerCase();

  for (const bot of bots) {
    if (agent.indexOf(bot.toLowerCase()) > -1) {
      return true;
    }
  }
  return false;
}

function detectDeepLinkBot(userAgent) {
  const deepLinkBots = [
    'twitterbot',
    'slackbot',
    'Discordbot'
  ];
  const agent = userAgent.toLowerCase();
  for (const bot of deepLinkBots) {
    if (agent.indexOf(bot.toLowerCase()) > -1) {
      return true;
    }
  }
  return false;

}

const indexAllowedPages = ['/search', '/community-rotations', '/levequests', '/about', '/support-us', '/desynth-guide', '/gc-supply', '/macro-translator', '/db/'];

app.get('*.*', express.static(DIST_FOLDER, {
  maxAge: '1y'
}));

app.get('*', async (req, res) => {
  if (!browserWSEndpoint) {
    const browser = await puppeteer.launch({
      timeout: 60000,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    browserWSEndpoint = await browser.wsEndpoint();
  }
  try {
    const isPrerender = req.query['prerender'];
    const noSEO = req.headers.host.indexOf('beta.') > -1 || req.headers.host.indexOf('preview.') > -1;
    const isIndexBot = detectIndexBot(req.headers['user-agent']);
    const isDeepLinkBot = detectDeepLinkBot(req.headers['user-agent']);
    const isAllowedPage = indexAllowedPages.some(page => req.originalUrl.indexOf(page) > -1);

    if (isPrerender || (isDeepLinkBot && isAllowedPage) || (!noSEO && isIndexBot && isAllowedPage)) {
      const { html } = await ssr(req.path, browserWSEndpoint, isDeepLinkBot);
      return res.status(200).send(html);
    } else {
      res.sendFile(join(DIST_FOLDER, 'index.html'));
    }
  } catch (err) {
    console.error(err);
    // Ignored, as it's inside SSR
  }
});

app.listen(8080, () => console.log('Server started. Press Ctrl+C to quit'));
