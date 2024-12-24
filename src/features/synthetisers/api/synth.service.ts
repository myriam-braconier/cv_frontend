// src/features/synthetisers/api/synth.service.ts
import { api } from "@/services/axios";
import { AxiosError } from "axios";
import { Synth } from "@/features/synthetisers/types";

export interface SynthResponse {
	data: Synth[];
	roles: string[];
}

class SynthService {
	async fetchSynthetisers(): Promise<SynthResponse> {
		try {
			const { data } = await api.get<SynthResponse>("/api/synthetisers");
			return data;
		} catch (error) {
			throw this.handleAxiosError(error);
		}
	}

	async updateSynthetiser(
		id: Synth["id"],
		data: Partial<Synth>
	): Promise<Synth> {
		try {
			const { data: response } = await api.put<Synth>(
				`/api/synthetisers/${id}`,
				data
			);
			return response;
		} catch (error) {
			throw this.handleAxiosError(error);
		}
	}

	private handleAxiosError(error: unknown) {
		if (error instanceof AxiosError) {
			switch (error.response?.status) {
				case 401:
					throw new Error("Non authentifié");
				case 403:
					throw new Error("Accès interdit");
				case 404:
					throw new Error("Ressource non trouvée");
				default:
					throw new Error(error.response?.data?.message || "Erreur serveur");
			}
		}
		return new Error("Erreur de connexion");
	}
}

// Exporter une instance unique du service
export const synthService = new SynthService();
