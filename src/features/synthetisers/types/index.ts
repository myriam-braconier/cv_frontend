export type Synth = {
	id: number;
	marque: string;
	modele: string;
	image_url?: string;
	note?: number;
	nb_avis?: number;
	specifications?: string;
	url?: string;
	price: {
	  value: number;
	  currency: string;
	} | number;
	auctionPrices?: AuctionPrice[]; // Ajout de cette propriété
	posts?: Post[];
  }

  export interface AuctionPrice {
	id: number;
	proposal_price: number;
	status: string;
	createdAt: string;
	userId: number;
  }


export interface Post {
    id: number;
    titre?: string;
    commentaire?: string;
    contenu?: string; // Remplacé `Text` par `string`, car `Text` n'est pas défini
    type_contenu?: 'texte' | 'video' | 'audio' | 'lien'; // Types de contenu autorisés
    url_contenu?: string;
    format?: string;
    statut?: 'brouillon' | 'publié' | 'archivé'; // Statuts possibles
    userId: number; // ID de l'utilisateur
    synthetiserId: number; // ID du synthétiseur associé
    createdAt?: Date; // Date de création
    updatedAt?: Date; // Date de mise à jour
}




export type  User = {
	id: number;
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	role: string[];
	password: string;
}





export type ApiResponse = {
	data: Synth[];
	roles: string[];
	message?: string;
	status?: number;
}


export type LoginResponse = {
	token: string;
	user: {
		id: number;
		email: string;
		role: string[];
	};
}
