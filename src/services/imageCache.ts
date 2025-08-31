import redisClient, { connectRedis } from '@/lib/redisClient';


interface CachedImage {
  base64: string;
  timestamp: number;
}

export class ImageCacheService {
  private static CACHE_DURATION = 7 * 24 * 60 * 60; // 7 jours en secondes

  static async getImage(prompt: string): Promise<string | null> {
    await connectRedis();

    const key = `freepik-ai:${prompt}`;
    const cachedData = await redisClient.get(key);

    if (cachedData) {
      const image: CachedImage = JSON.parse(cachedData);
      if (Date.now() - image.timestamp < this.CACHE_DURATION * 1000) {
        return image.base64;
      }
    }
    return null;
  }

  static async setImage(prompt: string, base64: string): Promise<void> {
    await connectRedis();

    const key = `freepik-ai:${prompt}`;
    const imageData: CachedImage = {
      base64,
      timestamp: Date.now(),
    };
    await redisClient.set(key, JSON.stringify(imageData), {
      EX: this.CACHE_DURATION,
    });
  }
}
