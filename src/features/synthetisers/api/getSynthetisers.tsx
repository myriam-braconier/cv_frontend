// features/synthetisers/api/getSynthetisers.ts
import { Synth } from '@/features/synthetisers/types/synth';
import { apiFetch } from '@/config/api';

interface SynthResponse {
  synths: Synth[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  message: string;
}

export async function getSynthetisers(page = 1, limit = 12): Promise<Synth[]> {
  try {
    console.log(`🔍 Fetching synthetisers - Page: ${page}, Limit: ${limit}`);
    
    // Utiliser apiFetch au lieu de fetch direct
    const data: SynthResponse = await apiFetch(`/api/synthetisers?page=${page}&limit=${limit}`);

    console.log('✅ Synthetisers API response:', {
      total: data.pagination.total,
      currentPage: data.pagination.currentPage,
      synthsCount: data.synths.length,
      firstSynth: data.synths[0] ? {
        id: data.synths[0].id,
        marque: data.synths[0].marque,
        postsCount: data.synths[0].posts?.length
      } : null
    });

    return data.synths || [];
  } catch (error) {
    console.error('❌ Error fetching synthetisers:', error);
    return [];
  }
}