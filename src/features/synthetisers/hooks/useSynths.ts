// src/features/synthetisers/hooks/useSynths.ts
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Synth } from "@/types";
import { synthService } from "@/features/synthetisers/api/synth.service";

interface UseSynthsReturn {
	synths: Synth[];
	userRoles: string[];
	isLoading: boolean;
	error: string | null;
	fetchSynths: () => Promise<void>;
	handleRetry: () => Promise<void>;
}

export function useSynths(): UseSynthsReturn {
	const router = useRouter();
	const [synths, setSynths] = useState<Synth[]>([]);
	const [userRoles, setUserRoles] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const checkAuth = useCallback(async (): Promise<boolean> => {
		try {
			const response = await fetch("/api/auth/me", {
				credentials: "include",
			});
			return response.ok;
		} catch {
			router.push("/login");
			return false;
		}
	}, [router]);

	const fetchSynths = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);

			const isAuthenticated = await checkAuth();
			if (!isAuthenticated) {
				router.push("/login");
				return;
			}

			const { data, roles } = await synthService.fetchSynthetisers();

			if (!roles?.length) {
				throw new Error("Vous n'avez pas les autorisations nécessaires");
			}

			setUserRoles(roles);
			setSynths(data);
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Une erreur est survenue"
			);
			if (error instanceof Error && error.message === "Non authentifié") {
				router.push("/login");
			}
		} finally {
			setIsLoading(false);
		}
	}, [router, checkAuth]);

	const handleRetry = useCallback(async () => {
		await fetchSynths();
	}, [fetchSynths]);

	return {
		synths,
		userRoles,
		isLoading,
		error,
		fetchSynths,
		handleRetry,
	};
}
