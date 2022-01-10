import express from 'express';
import cors from 'cors';
import { createClient, RedisClientType } from 'redis';

const app = express();
app.use(cors);

(async () => {
  const REDISHOST = process.env.REDISHOST || '10.140.235.195';
  const REDISPORT = process.env.REDISPORT || 6379;
  const redis = createClient({
    url: `redis://${REDISHOST}:${REDISPORT}`
  }) as unknown as RedisClientType;
  redis.on('error', err => {
    console.error('REDIS ERROR', err);
    process.exit(1);
  });
  await redis.connect();

  app.get('/status', async (req, res) => {
    const status = await redis.get('status');
    res.send(status);
  });

  app.get('/crafting', async (req, res) => {
    const server = req.query.server as string;
    const levels = (req.query.levels as string)?.split(',').map(l => +l);
    const minV24 = req.query.minVelocity || 10;
    const maxComplexity = req.query.maxComplexity || 99999;
    const selfSufficient = req.query.selfSufficient === 'true';
    const serverCache = await redis.get(`profit:${server}`);
    if (!serverCache) {
      return res.status(500).send({ message: `Profit cache for ${server} is missing` });
    }
    const serverCacheArray: any[] = JSON.parse(serverCache);
    const matching = serverCacheArray.filter(row => {
      return row.crafting
        && row.profit.c < 99999999
        && row.complexity < maxComplexity
        && row.v24 > minV24
        && (!selfSufficient || row.levelReqs.every((lvl: number, i: number) => levels[i] >= lvl));
    }).sort((a, b) => {
      if (!selfSufficient) {
        return (b.profit.c - b.cost) - (a.profit.c - a.cost);
      }
      return (b.profit.c - b.complexity * 10) * (b.v24) - (a.profit.c - a.complexity * 10) * (a.v24);
    }).slice(0, 20);
    return res.send({
      items: matching
    });
  });

  app.get('/gathering', async (req, res) => {
    const server = req.query.server as string;
    const levels = (req.query.levels as string)?.split(',').map(l => +l);
    const minV24 = req.query.minVelocity || 10;
    const serverCache = await redis.get(`profit:${server}`);
    if (!serverCache) {
      return res.status(500).send({ message: `Profit cache for ${server} is missing` });
    }
    const serverCacheArray: any[] = JSON.parse(serverCache);
    const matching = serverCacheArray.filter(row => {
      return row.gathering
        && row.profit.c < 99999999
        && row.complexity < 99999
        && row.v24 > minV24
        && (row.levelReqs.every((lvl: number, i: number) => levels[i] >= lvl));
    }).sort((a, b) => {
      return b.profit.c50 * b.v24 / 2 - a.profit.c50 * a.v24 / 2;
    }).slice(0, 20);
    return res.send({
      items: matching
    });
  });

  app.listen(8080);
})();
