// Ce service ne peut être utilisé que côté serveur (API routes)
// N'importez jamais ce fichier dans un composant client
import RedisClient from '@/lib/redisClient';

let redisClient: typeof RedisClient | null = null;

// Import dynamique de Redis uniquement côté serveur
const getRedisClient = async (): Promise<typeof RedisClient> => {
  if (typeof window !== 'undefined') {
    throw new Error('Redis client cannot be used on client side');
  }

  if (!redisClient) {
    // Importer le client par défaut, pas en destructuré
    const clientModule = await import('@/lib/redisClient');
    redisClient = clientModule.default;
  }

  return redisClient;
};

export async function generateBackground(prompt: string): Promise<string | null> {
  if (typeof window !== 'undefined') {
    throw new Error('This function can only be called server-side');
  }

  try {
    const redis = await getRedisClient();

    // Créer une clé de cache basée sur le prompt encodé
    const cacheKey = `bg_image:${Buffer.from(prompt).toString('base64')}`;

    // Vérifier le cache Redis
    const cachedImage = await redis.get(cacheKey);
    if (cachedImage) {
      console.log('Image trouvée en cache pour:', prompt);
      return cachedImage;
    }

    // Générer une nouvelle image (remplacer par votre logique)
    const generatedImageUrl = await generateNewImage(prompt);

    if (generatedImageUrl) {
      // Mettre en cache pendant 24 heures (86400 secondes)
      await redis.setEx(cacheKey, 86400, generatedImageUrl);
      console.log('Image générée et mise en cache pour:', prompt);
    }

    return generatedImageUrl;
  } catch (error) {
    console.error('Erreur lors de la génération/récupération d\'image:', error);
    return null;
  }
}

async function generateNewImage(prompt: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.your-image-service.com/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.IMAGE_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: `Background image for ${prompt}, artistic, synthesizer themed`,
        size: '512x512',
        style: 'digital-art',
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data.imageUrl || data.url || null;
  } catch (error) {
    console.error('Erreur lors de la génération d\'image:', error);
    return generateFallbackImage(prompt);
  }
}

function generateFallbackImage(prompt: string): string | null {
  const hash = simpleHash(prompt);
  const hue = hash % 360;

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:hsl(${hue},70%,60%);stop-opacity:1" />
          <stop offset="100%" style="stop-color:hsl(${(hue + 60) % 360},70%,40%);stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>
  `)}`;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertit en int 32 bits
  }
  return Math.abs(hash);
}

// Fonction optionnelle pour nettoyer le cache
export async function clearImageCache(prompt?: string): Promise<void> {
  if (typeof window !== 'undefined') {
    throw new Error('This function can only be called server-side');
  }

  try {
    const redis = await getRedisClient();

    if (prompt) {
      const cacheKey = `bg_image:${Buffer.from(prompt).toString('base64')}`;
      await redis.del(cacheKey);
    } else {
      const keys = await redis.keys('bg_image:*');
      if (keys.length > 0) {
        await Promise.all(keys.map(key => redis.del(key)));
      }
    }
  } catch (error) {
    console.error('Erreur lors du nettoyage du cache:', error);
  }
}
