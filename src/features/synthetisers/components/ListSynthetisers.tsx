"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Synth } from "@/types";
import axios from "axios";
import { SynthetiserCard } from "./SynthetiserCard";
import { api } from "@/services/axios";

export default function ListSynthetisers() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [synths, setSynths] = useState<Synth[]>([]);
	const [userRoles, setUserRoles] = useState<string[]>([]);

	const checkAuth = useCallback(async (): Promise<boolean> => {
		try {
			const token = localStorage.getItem("token");
			if (!token) {
				router.push("/login");
				return false;
			}

			const response = await api.get("/auth/check");
			return response.status === 200;
		} catch {
			router.push("/login");
			return false;
		}
	}, [router]);

	const fetchSynths = useCallback(async (): Promise<void> => {
		try {
			setIsLoading(true);
			setError(null);

			const token = localStorage.getItem("token");
			if (!token) {
				router.push("/login");
				return;
			}

			const response = await api.get("/api/synthetisers");
			const { data, roles = [] } = response.data;

			if (!roles.length) {
				throw new Error("Vous n'avez pas les autorisations nécessaires");
			}

			setUserRoles(roles);
			setSynths(Array.isArray(data) ? data : []);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					localStorage.removeItem("token");
					router.push("/login");
				} else {
					setError(
						error.response?.data?.message ||
							"Une erreur inattendue est survenue"
					);
				}
			} else {
				setError("Une erreur inattendue est survenue");
			}
		} finally {
			setIsLoading(false);
		}
	}, [router]);

	const handleRetry = useCallback(async (): Promise<void> => {
		const isAuthenticated = await checkAuth();
		if (isAuthenticated) {
			fetchSynths();
		}
	}, [fetchSynths, checkAuth]);

	useEffect(() => {
		fetchSynths();
	}, [fetchSynths]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[200px] p-4">
				<div className="text-red-500 mb-4">{error}</div>
				<button
					onClick={handleRetry}
					className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
				>
					Réessayer
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{userRoles.includes("admin") && (
				<div className="bg-white rounded-lg shadow-lg p-4">
					<h2 className="text-2xl font-bold">Panel Administrateur</h2>
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{synths.length > 0 ? (
					synths.map((synth) => (
						<SynthetiserCard key={synth.id} synthetiser={synth} />
					))
				) : (
					<div className="col-span-full text-center py-8">
						<p className="text-gray-500">Aucun synthétiseur trouvé</p>
					</div>
				)}
			</div>
		</div>
	);
}
