import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { graphql } from 'body-parser-graphql';
import { createClient, RedisClientType } from 'redis';

const RATE_LIMIT_BYTES_PER_REQUEST = 1_000_000;
const RATE_LIMIT_BYTES_PER_MINUTES = 4_000_000;
const RATE_LIMIT_BYTES_PER_HOUR = 20_000_000;

async function addUsage(redis: RedisClientType, ip: string, usage: number) {
  const minBytesUsageKey = `gubal:${ip}:${new Date().getUTCMinutes()}B`;
  const hourBytesUsageKey = `gubal:${ip}:h${new Date().getUTCHours()}B`;
  await redis.set(minBytesUsageKey, 0, {
    NX: true,
    EX: 60
  });
  await redis.set(hourBytesUsageKey, 0, {
    NX: true,
    EX: 3600
  });
  await redis.incrBy(minBytesUsageKey, usage);
  await redis.incrBy(hourBytesUsageKey, usage);
}

async function getUsage(redis: RedisClientType, ip: string) {
  const minUsageKey = `gubal:${ip}:${new Date().getUTCMinutes()}B`;
  const hourUsageKey = `gubal:${ip}:h${new Date().getUTCHours()}B`;
  return {
    minBytes: await redis.get(minUsageKey),
    hourBytes: await redis.get(hourUsageKey)
  };
}

function parseJwt(token: string): Record<string, any> {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

function logBan(req: any, ws: boolean) {
  const jwt = req.headers['authorization']?.replace('Bearer ', '');
  let userId = 'N/A';
  if (jwt) {
    userId = parseJwt(jwt)?.['https://securetoken.google.com/ffxivteamcraft']?.['user_id'] || 'MISSING';
  }
  console.log(`DENY ${ws ? 'WS' : req.method} ${req.url} from ${userId}/${req.ip}`);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3333;
  app.enableCors();
  if (environment.production) {
    const redis = createClient({
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
    }) as unknown as RedisClientType;
    await redis.connect();
    app.use(graphql());
    app.use(async (req, res, next) => {
      if (!req.url.endsWith('/gubal')) {
        next();
      } else {
        const { minBytes, hourBytes } = await getUsage(redis, req.ip);
        req.headers['X-Gubal-Usage'] = `${minBytes}|${hourBytes}`;
        next();
      }
    });

    const proxy = createProxyMiddleware({
      target: 'https://gubal.ffxivteamcraft.com/v1/graphql',
      pathRewrite: {
        '/gubal': ''
      },
      secure: true,
      changeOrigin: true,
      logLevel: 'silent',
      onProxyReq: (proxyReq, req, res) => {
        if (req.method === 'OPTIONS') {
          return res.sendStatus(201);
        }
        if (req.method !== 'POST') {
          return res.sendStatus(405);
        }
        const [minUsage, hourUsage] = req.headers['X-Gubal-Usage'].toString().split('|');
        const denied = +minUsage > RATE_LIMIT_BYTES_PER_MINUTES
          || +hourUsage > RATE_LIMIT_BYTES_PER_HOUR;
        const isMutation = req.body.query.startsWith('mutation');
        // Only deny if not mutation, to not prevent fishing data ingestion in the event of a wrong ban
        if (denied && !isMutation) {
          logBan(req, false);
          return res.sendStatus(429);
        }
        fixRequestBody(proxyReq, req);
      },
      onProxyRes: (proxyRes, req, res) => {
        const _write = res.write;
        res.write = (data, cb) => {
          const contentLength = Buffer.byteLength(data);
          addUsage(redis, req.ip, contentLength);
          if (contentLength > RATE_LIMIT_BYTES_PER_REQUEST) {
            return _write.call(res, Buffer.from(''), cb);
          }
          return _write.call(res, data, cb);
        };
      },
      onError: err => console.error(err)
    });
    app.use(
      '/gubal',
      proxy
    );
  }
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}, XIVAPI_KEY LOADED: ${environment.xivapiKey !== undefined}`);
}

bootstrap();
