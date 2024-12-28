"use client";

import { useEffect, useState, useCallback } from "react";
import { Synth } from "@/features/synthetisers/types/synth";
import { SynthetiserCard } from "../SynthetiserCard";
import { ListPost } from "./ListMainPost";
import ErrorBoundary from "@/components/ErrorBoundary";

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
	const [showPosts, setShowPosts] = useState(false);

	const isAuthenticated = useCallback(() => {
		const token = localStorage.getItem("token");
		const userId = localStorage.getItem("userId");
		return !!(token && userId);
	}, []);

	useEffect(() => {
		setSynths(initialSynths);
		setUserRoles(initialUserRoles);
	}, [initialSynths, initialUserRoles]);

	const handleTogglePosts = useCallback(() => {
		setShowPosts((prev) => !prev);
	}, []);

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
							<ListPost
								posts={synth.posts}
								showPosts={showPosts}
								onToggle={handleTogglePosts}
								synthetiserId={synth.id}
							/>
						</div>
					))}
			</div>
		</ErrorBoundary>
	);
};

export default ListSynthetisers;
