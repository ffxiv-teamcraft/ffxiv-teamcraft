import { createClient, RedisClientType } from 'redis';
import { Item } from './item';
import { combineLatest, Observable } from 'rxjs';
import { subHours } from 'date-fns';
import { map, switchMap } from 'rxjs/operators';
import { doUniversalisRequest } from './universalis';
import { uniqBy } from 'lodash';


export async function createRedisClient(): Promise<RedisClientType> {
  const REDISHOST = process.env.REDISHOST || '10.140.235.195';
  const REDISPORT = process.env.REDISPORT || 6379;
  const client = createClient({
    url: `redis://${REDISHOST}:${REDISPORT}`
  }) as unknown as RedisClientType;
  client.on('error', err => {
    console.error('REDIS ERROR', err);
    process.exit(1);
  });
  await client.connect();
  return client;
}

export function evaluateComplexity(item: Item, items: Record<number, Item>): number {
  if (!item) {
    return 99999;
  }
  if (item.requirements) {
    return item.requirements.filter(i => i.id > 19).reduce((acc, ingredient) => {
      return acc + Math.ceil(evaluateComplexity(items[+ingredient.id], items) * (ingredient.amount / 4));
    }, 1);
  }
  if (item.vendors) {
    return 1;
  }
  if (item.gathering) {
    if (item.gathering.nodes[0]?.limited) {
      return 4;
    }
    return 1;
  }
  if (item.reduction) {
    return 2;
  }
  if (item.trades) {
    return 3;
  }
  return 99999;
}

export async function computeCost(item: Item, server: string, items: Record<number, Item>, redis: RedisClientType): Promise<number> {
  if (item.requirements) {
    let total = 1;
    for (const ingredient of item.requirements) {
      const reqEntry = items[+ingredient.id];
      if (reqEntry) {
        total += Math.floor(await computeCost(reqEntry, server, items, redis) * ingredient.amount);
      }
    }
    return total;
  }
  const mbEntry = await redis.get(`mb:${server}:${item.id}`);
  if (!mbEntry) {
    return -1;
  }
  return JSON.parse(mbEntry).c;
}

export async function computeProfit(item: Item, server: string, redis: RedisClientType): Promise<{ c: number, c10: number, c50: number } | null> {
  const mbEntry = await redis.get(`mb:${server}:${item.id}`);
  if (!mbEntry) {
    return null;
  }
  const parsed = JSON.parse(mbEntry);
  return {
    c: parsed.c,
    c10: parsed.c10,
    c50: parsed.c50
  };
}

export function getLevelRequirements(item: Item, items: Record<number, Item>): number[] {
  let baseRequirements = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  if (!item) {
    return baseRequirements;
  }
  if (item.gathering) {
    baseRequirements[9 + Math.floor(item.gathering.type / 2)] = item.gathering.level;
    return baseRequirements;
  } else if (item.crafting) {
    baseRequirements[item.crafting[0].job - 8] = item.crafting[0].lvl;
    item.requirements?.forEach(req => {
      const reqRequirements = getLevelRequirements(items[+req.id], items);
      baseRequirements = baseRequirements.map((lvl, i) => {
        if (reqRequirements[i] > lvl) {
          return reqRequirements[i];
        }
        return lvl;
      });
    });
  }
  return baseRequirements;
}

export function updateItems(server: string, itemIds: number[]): Observable<{ server: string, data: any[] }> {
  const yesterday = Math.floor(subHours(new Date(), 24).getTime() / 1000);
  const oneDaybeforeYesterday = Math.floor(subHours(new Date(), 48).getTime() / 1000);
  return combineLatest([
    doUniversalisRequest(`https://universalis.app/api/${server}/${itemIds.join(',')}?statsWithin=0`),
    doUniversalisRequest(`https://universalis.app/api/history/${server}/${itemIds.join(',')}?entriesWithin=172800&statsWithin=0`)
  ]).pipe(
    map(([listing, history]) => {
      return {
        server,
        data: listing.items.reduce((acc: Record<string, any>, item: any) => {
          const historyEntry = history.items.find((hItem: any) => hItem.itemID === item.itemID) || { entries: [] };
          const last24hSales = historyEntry?.entries.filter((h: { timestamp: number }) => h.timestamp > yesterday) || [];
          const tr24 = last24hSales.slice(-5).reduce((accp: number, row: any) => accp + row.pricePerUnit, 0) - last24hSales.slice(0, 5).reduce((accp: number, row: any) => accp + row.pricePerUnit, 0);
          const v24 = last24hSales.reduce((total: number, e: { quantity: number }) => total + e.quantity, 0);
          const v48 = historyEntry.entries.filter((h: { timestamp: number }) => h.timestamp > oneDaybeforeYesterday).reduce((total: number, e: { quantity: number }) => total + e.quantity, 0);
          const avg24 = Math.floor(last24hSales.reduce((total: number, e: { total: number }) => total + e.total, 0) / v24) || 0;
          const t = item.listings.reduce((accp: number, a: any) => accp + a.quantity, 0);
          const c = item.listings.sort((a: any, b: any) => a.pricePerUnit - b.pricePerUnit)[0]?.pricePerUnit || 0;
          const c10 = item.listings.filter((l: any) => l.quantity >= 10).sort((a: any, b: any) => a.pricePerUnit - b.pricePerUnit)[0]?.pricePerUnit || 0;
          const c50 = item.listings.filter((l: any) => l.quantity >= 50).sort((a: any, b: any) => a.pricePerUnit - b.pricePerUnit)[0]?.pricePerUnit || 0;
          return {
            ...acc,
            [item.itemID]: {
              v24,
              v48,
              avg24,
              c,
              c10,
              c50,
              t,
              tr24
            }
          };
        }, {})
      };
    })
  );
}

export async function updateCache(servers: string[], items: Record<number, Item>, redis: RedisClientType): Promise<void> {
  console.log(`STARTING CACHE UPDATE FOR ${servers.length} servers`);
  for(const server of servers){
    const currentServerCacheRaw = await redis.get(`profit:${server}`);
    let currentServerCache = [];
    if (currentServerCacheRaw) {
      currentServerCache = JSON.parse(currentServerCacheRaw);
    }
    const serverCache: any[] = [];
    for (const [id, item] of Object.entries<Item>(items)) {
      if (+id === 1) {
        continue;
      }
      const mbEntry = await redis.get(`mb:${server}:${item.id}`);
      if (!mbEntry) {
        continue;
      }
      const parsedMbEntry = JSON.parse(mbEntry);
      serverCache.push({
        id,
        crafting: item.crafting !== null,
        gathering: item.gathering !== null || item.reduction !== null,
        complexity: evaluateComplexity(item, items),
        cost: await computeCost(item, server, items, redis),
        profit: await computeProfit(item, server, redis),
        v24: parsedMbEntry.v24,
        v48: parsedMbEntry.v48,
        total: parsedMbEntry.t,
        trend24: parsedMbEntry.tr24,
        levelReqs: getLevelRequirements(item, items),
        updated: Date.now()
      });
    }
    const newCache = uniqBy([...serverCache, ...currentServerCache], 'id');
    console.log(`UPDATED CACHE FOR ${server}, ${serverCache.length} entries (${newCache.length} total)`);
    await redis.set(`profit:${server}`, JSON.stringify(newCache));
  }
}


export function updateServerData(server: string): Observable<Record<string, any>> {
  return doUniversalisRequest(`https://universalis.app/api/extra/stats/most-recently-updated?world=${server}`).pipe(
    switchMap((mru: { items: any[] }) => {
      return updateItems(server, mru.items.map(item => item.itemID));
    })
  );
}
