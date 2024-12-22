export interface Synth {
    id: number;
    marque: string;
    modele: string;
    image_url?: string;
    specifications?: string;
    price: number | null;  
    auctionPrices: number; 
    auctionPriceId: number;
    note?: number;
    nb_avis?: number;
    posts?: unknown[]; // ajoutez ceci si vous avez des posts
}




export type Post = {
	id: number;
	titre?: string;
	commentaire? : string;
	contenu?: Text;
	type_contenu?: 'texte' | 'video' | 'audio' | 'lien';
	url_contenu?: string;
	format?: string;
	statut?: 'brouillon' | 'publié' | 'archivé';
	userId: number;
	synthetiserId: number;
	createdAt?: Date;
    updatedAt?: Date;
}