// src/features/synthetisers/api/synth.service.ts
import { api } from "@/services/axios";
import { AxiosError } from "axios";
import { Synth } from "@/types";

export interface SynthResponse {
	data: Synth[];
	roles: string[];
}


class SynthService {
  // Renommer la méthode pour correspondre à l'appel
  async fetchSynthetisers(): Promise<SynthResponse> {
    try {
      const { data } = await api.get<SynthResponse>('/api/synthetisers');
      return data;
    } catch (error) {
      throw this.handleAxiosError(error);
    }
  }

  private handleAxiosError(error: unknown) {
    if (error instanceof AxiosError) {
      switch (error.response?.status) {
        case 401:
          throw new Error('Non authentifié');
        case 403:
          throw new Error('Accès interdit');
        case 404:
          throw new Error('Ressource non trouvée');
        default:
          throw new Error(error.response?.data?.message || 'Erreur serveur');
      }
    }
    return new Error('Erreur de connexion');
  }
}

export const synthService = new SynthService();