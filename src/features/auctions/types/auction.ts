export interface Auction {
	id: number;
	proposal_price: number;
	status: string;
	synthetiserId: number;
	userId: number;
	updatedAt?: string;
	createdAt?: number;  
	synthetiser?: Synth
}

export interface Synth {
	id: number;
	marque: string;
	modele: string;
	image_url?: string;
}