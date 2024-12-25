"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Synth } from "@/features/synthetisers/types/synth";
import axios from "axios";
import { SynthetiserCard } from "../SynthetiserCard";
import { api } from "@/services/axios";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function ListSynthetisers() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [synths, setSynths] = useState<Synth[]>([]);
	const [userRoles, setUserRoles] = useState<string[]>([]);

	const checkAuth = useCallback(async () => {
		try {
			const token = localStorage.getItem("token");
			if (!token) {
				router.push("/login");
				return false;
			}
			const response = await api.get("/auth/me");
			return response.status === 200;
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
			if (!isAuthenticated) return;

			const [roleResponse, synthResponse] = await Promise.all([
				api.get("/auth/me"),
				api.get("/api/synthetisers"),
			]);

			const userRole = roleResponse.data.role;
			setUserRoles(userRole === "admin" ? ["admin"] : [userRole]);
			setSynths(synthResponse.data.data);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 401) {
				localStorage.removeItem("token");
				router.push("/login");
				return;
			}
			setError("Une erreur est survenue");
		} finally {
			setIsLoading(false);
		}
	}, [router, checkAuth]);

	useEffect(() => {
		fetchSynths();
	}, [fetchSynths]);

	if (isLoading) {
		return (
			<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
		);
	}

	if (error) {
		return (
			<div className="text-red-500">
				{error}
				<button
					onClick={fetchSynths}
					className="bg-blue-500 text-white px-4 py-2 rounded"
				>
					Réessayer
				</button>
			</div>
		);
	}

	return (
		<ErrorBoundary>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{synths
					.sort((a, b) => {
						const marqueComparison = a.marque.localeCompare(b.marque);
						if (marqueComparison !== 0) return marqueComparison;
						return a.modele.localeCompare(b.modele);
					})
					.map((synth) => (
						<SynthetiserCard
							key={synth.id}
							synthetiser={synth}
							userRoles={userRoles}
							onUpdateSuccess={fetchSynths}
						/>
					))}
			</div>
		</ErrorBoundary>
	);
}
