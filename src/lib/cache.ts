// @/lib/cache.ts

const CACHE_KEY = 'background_image';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

interface CacheEntry {
  value: string;
  timestamp: number;
}

export const getBackgroundFromCache = (): string | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const entry: CacheEntry = JSON.parse(cached);
    const now = Date.now();

    // Vérifier si le cache est expiré
    if (now - entry.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return entry.value;
  } catch (error) {
    console.error('Erreur lors de la lecture du cache:', error);
    return null;
  }
};

export const setBackgroundInCache = (imageUrl: string): void => {
  try {
    const entry: CacheEntry = {
      value: imageUrl,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch (error) {
    console.error('Erreur lors de l\'écriture dans le cache:', error);
  }
};