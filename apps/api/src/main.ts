import { inferAsyncReturnType, initTRPC } from '@trpc/server';
import { appRouter } from '@ffxiv-teamcraft/trpc-api';
import * as trpcExpress from '@trpc/server/adapters/express';
import express = require('express');
import cors = require('cors');
// created for each request
const createContext = ({
                         req,
                         res
                       }: trpcExpress.CreateExpressContextOptions) => ({}); // no context
const app = express();
app.use(cors());
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext
  })
);

const port = process.env.port || 3000;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/trpc`);
});
server.on('error', console.error);
