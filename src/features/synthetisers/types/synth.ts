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
	userId: number; // ID de l'utilisateur
	synthetiserId: number; // ID du synthétiseur associé
	createdAt?: Date; // Date de création
	updatedAt?: Date; // Date de mise à jour
}

export interface AuctionPrice {
	id: number;
	proposal_price: number;
	status: string;
	synthetiserId: number;
	userId: number;
	updatedAt?: string;
	createdAt: number;  
}
