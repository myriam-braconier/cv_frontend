// services/imageCache.ts
import { createClient } from 'redis';
import huggingFaceApi from '../lib/axios/huggingface'

const redisClient = createClient({
  url: process.env.REDIS_URL
});

interface CachedImage {
  base64: string;
  timestamp: number;
}

export class ImageCacheService {
  private static CACHE_DURATION = 7 * 24 * 60 * 60; // 7 jours

  static async getImage(prompt: string): Promise<string | null> {
    const key = `ai-bg:${prompt}`;
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
    const key = `ai-bg:${prompt}`;
    const imageData: CachedImage = {
      base64,
      timestamp: Date.now()
    };
    await redisClient.set(key, JSON.stringify(imageData), {
      EX: this.CACHE_DURATION
    });
  }
}

// services/imageGeneration.ts
export async function generateBackground(prompt: string) {
  try {
    // Check cache first
    const cachedImage = await ImageCacheService.getImage(prompt);
    if (cachedImage) return cachedImage;

    // Generate new image if not in cache
    const response = await huggingFaceApi.post('/models/stabilityai/stable-diffusion-xl-base-1.0', {
      inputs: prompt
    });
    
    const base64Image = response.data;
    
    // Save to cache
    await ImageCacheService.setImage(prompt, base64Image);
    
    return base64Image;
  } catch (error) {
    console.error('Image generation failed:', error);
    return null;
  }
}

// Middleware pour nettoyer le cache périodiquement
export async function cleanupImageCache() {
  const keys = await redisClient.keys('ai-bg:*');
  for (const key of keys) {
    const data = await redisClient.get(key);
    if (data) {
      const image: CachedImage = JSON.parse(data);
      if (Date.now() - image.timestamp > 7 * 24 * 60 * 60 * 1000) {
        await redisClient.del(key);
      }
    }
  }
}