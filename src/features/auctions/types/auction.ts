export interface Auction {
	id: number;
	proposal_price: number;
	status: string;
	synthetiserId: number;
	userId: number;
	updatedAt?: string;
	createdAt?: number;  
	synthetiser: {  // Ajout de la relation avec le synthétiseur
        id: number;
        marque: string;
        modele: string;
        image_url?: string;
    };
}

export interface Synth {
	id: number;
	marque: string;
	modele: string;
	image_url?: string;
}