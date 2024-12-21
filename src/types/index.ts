export type Synth = {
	id: number;
	marque: string;
	modele: string;
	image_url?: string;
	note?: number;
	nb_avis?: number;
	specifications?: string;
	url?: string;
	price?: number;
	posts: Post[]; // Ajout de la propriété post
};

export type Post = {
	id: number;
	titre?: string;
	commentaire?: string;
	contenu?: Text;
	type_contenu?: "texte" | "video" | "audio" | "lien";
	url_contenu?: string;
	format?: string;
	statut?: "brouillon" | "publié" | "archivé";
	userId: number;
	synthetiserId: number;
	createdAt?: Date;
	updatedAt?: Date;
};

export type User = {
	id: number;
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	role: string[];
	password: string;
};

export type ApiResponse = {
	data: Synth[];
	roles: string[];
	message?: string;
	status?: number;
};

export type LoginResponse = {
	token: string;
	user: {
		id: number;
		email: string;
		role: string[];
	};
};
