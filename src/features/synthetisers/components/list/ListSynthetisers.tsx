"use client";

import { useEffect, useState, useCallback } from "react";
import { Synth } from "@/features/synthetisers/types/synth";
import { SynthetiserCard } from "../SynthetiserCard";
import ErrorBoundary from "@/components/ErrorBoundary";

// import { useRouter } from "next/navigation";

interface ListSynthetisersProps {
	synths: Synth[];
	userRoles: string[];
	onUpdateSuccess?: () => void;
}

export const ListSynthetisers = ({
	synths: initialSynths,
	userRoles: initialUserRoles,
	onUpdateSuccess,
}: ListSynthetisersProps) => {
	const [synths, setSynths] = useState<Synth[]>(initialSynths);
	const [userRoles, setUserRoles] = useState<string[]>(initialUserRoles);
	// const router = useRouter();

	const isAuthenticated = useCallback(() => {
		const token = localStorage.getItem("token");
		const userId = localStorage.getItem("userId");
		return !!(token && userId);
	}, []);

	const checkAdminRole = useCallback(() => {
		const token = localStorage.getItem('token');
		if (!token) return false;
		const payload = JSON.parse(atob(token.split('.')[1]));
		return payload.role === 'admin' || payload.roleId === 1 || payload.roleId === 2;
	}, []);

	useEffect(() => {
		setSynths(initialSynths);
		setUserRoles(initialUserRoles);
	}, [initialSynths, initialUserRoles]);

	useEffect(() => {
		console.log("ListSynthetisers - initialUserRoles:", initialUserRoles);
		console.log("ListSynthetisers - userRoles avant update:", userRoles);
		setSynths(initialSynths);
		setUserRoles(initialUserRoles);
	}, [initialSynths, initialUserRoles, userRoles]);

	return (
		<ErrorBoundary>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
				{synths
					.sort((a, b) => {
						const marqueComparison = a.marque.localeCompare(b.marque);
						if (marqueComparison !== 0) return marqueComparison;
						return a.modele.localeCompare(b.modele);
					})
					.map((synth) => (
						<div key={synth.id} className="flex flex-col space-y-4">
							<SynthetiserCard
								key={synth.id}
								synth={synth}
								hasAdminRole={checkAdminRole()}
								onUpdateSuccess={onUpdateSuccess}
								isAuthenticated={isAuthenticated}
							/>
						</div>
					))}
			</div>
		</ErrorBoundary>
	);
};

export default ListSynthetisers;
