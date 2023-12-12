import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3333;
  app.enableCors();
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
      fixRequestBody(proxyReq, req);
    },
    onError: err => console.error(err)
  });
  app.use(
    '/gubal',
    proxy
  );
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}, XIVAPI_KEY LOADED: ${environment.xivapiKey !== undefined}`);
}

bootstrap();
