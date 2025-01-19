// features/synthetisers/api/getSynthetisers.ts
import { Synth } from '@/features/synthetisers/types/synth';
import { API_URL } from '@/config/constants';

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
    const response = await fetch(
      `${API_URL}/api/synthetisers?page=${page}&limit=${limit}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      const text = await response.text();
      console.error('Error details:', text);
      return [];
    }

    const data: SynthResponse = await response.json();
    console.log('Synthetisers API response:', {
      total: data.pagination.total,
      currentPage: data.pagination.currentPage,
      synthsCount: data.synths.length,
      firstSynth: data.synths[0] ? {
        id: data.synths[0].id,
        marque: data.synths[0].marque,
        postsCount: data.synths[0].posts?.length
      } : null
    });

    return data.synths;
  } catch (error) {
    console.error('Error fetching synthetisers:', error);
    return [];
  }
}