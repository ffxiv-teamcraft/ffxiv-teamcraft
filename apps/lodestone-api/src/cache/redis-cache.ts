import { createClient, RedisClientType } from 'redis';

export class RedisCache {
  private static REDIS_HOST = process.env.REDIS_HOST || 'localhost';

  private static REDIS_PORT = process.env.REDIS_PORT || 6379;

  private client: RedisClientType;

  async init() {
    const client = createClient({
      url: `redis://${RedisCache.REDIS_HOST}:${RedisCache.REDIS_PORT}`
    }) as unknown as RedisClientType;
    client.on('error', err => {
      console.error('REDIS ERROR', err);
      process.exit(1);
    });
    await client.connect();
    this.client = client;
  }

  public async getCached(key: string, dataFactory: () => Promise<any>, skipCache = false): Promise<any> {
    if (!skipCache) {
      const cache = await this.client.get(key);
      if (cache) {
        return JSON.parse(cache);
      }
    }
    const data = await dataFactory();
    if (!skipCache) {
      await this.client.set(key, JSON.stringify(data), { EX: 3600 * 8 });
    }
    return data;
  }
}
