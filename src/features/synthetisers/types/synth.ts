export interface Synth {
	id: number;
	marque: string;
	modele: string;
	image_url?: string;
	specifications?: string;
	price:
		| {
				value: number;
				currency: string;
		  }
		| number; // Pour supporter les deux formats possibles
	auctionPrices?: AuctionPrice[];
	note?: number;
	nb_avis?: number;
	posts?: Post[]; // Tableau des posts associés
}

export interface Post {
	id: number;
	titre?: string;
	commentaire?: string;
	contenu?: string; // Remplacé `Text` par `string`, car `Text` n'est pas défini
	type_contenu?: "texte" | "video" | "audio" | "lien"; // Types de contenu autorisés
	url_contenu?: string;
	format?: string;
	statut?: "brouillon" | "publié" | "archivé"; // Statuts possibles
	userId?: number;
	// Ajout de la relation avec l'utilisateur
	author?: {
		id: number;
		username: string;
	};
	synthetiserId: number; // ID du synthétiseur associé
	createdAt?: number; // Date de création
	updatedAt?: string; // Date de mise à jour
}

export interface AuctionPrice {
	id: number;
	proposal_price: number;
	status: string;
	synthetiserId: number;
	userId: number;
	updatedAt: string;
	createdAt: number;
}
export interface User {
	id: number;
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	role: string[];
	password: string;
}

export interface ApiResponse {
	data: Synth[];
	roles: string[];
	message?: string;
	status?: number;
}

export interface LoginResponse {
	token: string;
	user: {
		id: number;
		email: string;
		role: string[];
	};
}
