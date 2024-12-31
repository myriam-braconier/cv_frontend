"use client";
import { API_URL } from '@/config/constants';

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ListSynthetisers from "@/features/synthetisers/components/list/ListSynthetisers";
import { LoadingSpinner } from "@/components/LoadingSpinner"; // Ajout de l'import

import api from "@/lib/axios/index";

export default function SynthetisersPage() {
	const router = useRouter();
	const [synths, setSynths] = useState([]);
	const [userRoles, setUserRoles] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const checkAuth = useCallback(async () => {
		const token = localStorage.getItem("token");
		if (!token) {
			router.push(`${API_URL}/login`);
			return false;
		}
		try {
			const response = await api.get(`${API_URL}/auth/verify`);
			return response.status === 200;
		} catch {
			router.push(`${API_URL}/login`);
			return false;
		}
	}, [router]);

	const fetchSynths = useCallback(async () => {
		if (!localStorage.getItem("token")) {
			router.push(`${API_URL}/login`);
			return;
		}

		try {
			setIsLoading(true);
			setError(null);
			const [roleResponse, synthResponse] = await Promise.all([
				api.get(`${API_URL}/auth/verify`),
				api.get(`${API_URL}/api/synthetisers`),
			]);
			const userRole = roleResponse.data.role;
			console.log("Role reçu de l'API:", userRole); // Log du rôle
			const roles = userRole === "admin" ? ["admin"] : [userRole];
			console.log("Roles à définir:", roles); // Log des rôles avant setState
			setUserRoles(roles);
			setSynths(synthResponse.data.data);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 401) {
				localStorage.removeItem("token");
				router.push(`${API_URL}/login`);
				return;
			}
			setError("Une erreur est survenue");
		} finally {
			setIsLoading(false);
		}
	}, [router]);

	useEffect(() => {
		const initPage = async () => {
			const isAuth = await checkAuth();
			if (isAuth) {
				fetchSynths();
			}
		};
		initPage();
	}, [checkAuth, fetchSynths]); // Dépendances vides pour n'exécuter qu'au montage

	return (
		<main className="min-h-screen">
			<div className="w-full px-4 py-6">
				<h1 className="text-3xl font-bold mb-8 text-center">
					Liste des Synthétiseurs
				</h1>

				{isLoading ? (
					<LoadingSpinner />
				) : error ? (
					<div className="text-red-500 text-center">{error}</div>
				) : (
					<ListSynthetisers synths={synths} userRoles={userRoles} />
				)}
			</div>
		</main>
	);
}
