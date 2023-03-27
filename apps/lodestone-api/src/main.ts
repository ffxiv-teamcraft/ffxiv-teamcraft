import express from 'express';
import cors from 'cors';
import { Achievements, Character, CharacterSearch, ClassJob, FCMembers, FreeCompany, FreeCompanySearch } from '@xivapi/nodestone';
import { RedisCache } from './cache/redis-cache';

const app = express();
app.use(cors());
(async () => {
  const characterParser = new Character();
  const achievementsParser = new Achievements();
  const classJobParser = new ClassJob();
  const freeCompanyParser = new FreeCompany();
  const freeCompanyMemberParser = new FCMembers();
  const characterSearch = new CharacterSearch();
  const freecompanySearch = new FreeCompanySearch();

  const cache = new RedisCache();
  await cache.init();

  app.get('/Character/Search', async (req, res) => {
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    try {
      const parsed = await characterSearch.parse(req);
      return res.status(200).send(parsed);
    } catch (err: any) {
      return res.status(500).send(err);
    }
  });

  app.get('/FreeCompany/Search', async (req, res) => {
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    try {
      const parsed = await freecompanySearch.parse(req);
      return res.status(200).send(parsed);
    } catch (err: any) {
      return res.status(500).send(err);
    }
  });

  app.get('/Character/:characterId', async (req, res) => {
    const includesBio = (req.query['columns'] as string)?.indexOf('Bio') > -1;
    if (includesBio) {
      res.set('Cache-Control', 'max-age=3600');
    }
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    try {
      const additionalData = Array.isArray(req.query.data)
        ? req.query.data
        : [req.query.data].filter((d) => !!d);
      const characterId = +req.params.characterId;
      const result = await cache.getCached(`character:${characterId}:${req.query['columns']}:${additionalData.join(',')}`, async () => {
        const character = await characterParser.parse(req, 'Character.');
        const parsed: any = {
          Character: {
            ID: +req.params.characterId,
            ...character
          }
        };
        if (additionalData.includes('AC')) {
          parsed.Achievements = await achievementsParser.parse(
            req,
            'Achievements.'
          );
        }
        if (additionalData.includes('CJ')) {
          parsed.ClassJobs = await classJobParser.parse(req, 'ClassJobs.');
        }
        return parsed;
      }, includesBio);
      return res.status(200).send(result);
    } catch (err: any) {
      if (err.message === '404') {
        return res.sendStatus(404);
      }
      return res.status(500).send(err);
    }
  });

  app.get('/FreeCompany/:fcId', async (req, res) => {
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    try {
      const additionalData = Array.isArray(req.query.data)
        ? req.query.data
        : [req.query.data].filter((d) => !!d);
      const result = await cache.getCached(`freecompany:${+req.params.fcId}:${additionalData.join(',')}`, async () => {
        const freeCompany = await freeCompanyParser.parse(req, 'FreeCompany.');
        const parsed: any = {
          FreeCompany: {
            ID: +req.params.fcId,
            ...freeCompany
          }
        };
        if (additionalData.includes('FCM')) {
          parsed.FreeCompanyMembers = await freeCompanyMemberParser.parse(
            req,
            'FreeCompanyMembers.'
          );
        }
        return parsed;
      });
      return res.status(200).send(result);
    } catch (err: any) {
      if (err.message === '404') {
        return res.sendStatus(404);
      }
      return res.status(500).send(err);
    }
  });

  const port = process.env.PORT || 8080;
  const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
  });
  server.on('error', console.error);
})();
