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

	// const handleDuplicate = (synthId: string | number) => {
	// 	router.push(`/synthetisers/duplicate/${synthId}`);
	// };

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
								synth={synth}
								userRoles={userRoles}
								onUpdateSuccess={onUpdateSuccess}
								isAuthenticated={isAuthenticated}
							/>
						</div>
					))}
			</div>
			{/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{synths.map((synth) => (
					<div key={synth.id} className="border p-4 rounded-lg">
						<h3 className="font-bold">
							{synth.marque} {synth.modele}
						</h3>
						<p>
							Prix:{" "}
							{synth.price === null
								? "Non défini"
								: typeof synth.price === "object"
								? `${synth.price.value} ${synth.price.currency}`
								: `${synth.price} EUR`}
						</p>
						<button
							onClick={() => handleDuplicate(synth.id)}
							className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
						>
							Dupliquer
						</button>
					</div>
				))}
			</div> */}
		</ErrorBoundary>
	);
};

export default ListSynthetisers;
