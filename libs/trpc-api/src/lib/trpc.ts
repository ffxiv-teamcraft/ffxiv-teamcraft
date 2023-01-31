import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

const t = initTRPC.create({
  transformer: superjson,
  allowOutsideOfServer: true
});

export const router = t.router;
export const procedure = t.procedure;
